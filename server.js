let bodyparser = require("body-parser");
let express = require("express");
let socket = require("socket.io");
let moment = require("moment");
let fs = require("fs");
let app = express();
let htmlspecialchars = require("htmlspecialchars");
const sqlite3 = require("sqlite3").verbose();
//Utilisation du template ejs
app.set("view engine", "ejs");
//utilisation du dossier public pour le css
app.use(express.static("public"));
//utilisation du css pour le cas où l'on choisit une lettre ( necessaire )
app.use("/lettre/:id", express.static("public"));
//utilisation du css pour le cas où l'on consulte sans sélectionner de lettre( necessaire )
app.use("/glossary/", express.static("public"));
//utilisation body-parser pour recuperer les données venant du client
app.use(bodyparser.urlencoded({ extended: false }));
//Lancement serveur sur le port 8080
let server = app.listen(process.env.PORT || 8080);
let io = socket(server);
//function pour les double tirets
function blbl(str) {
	if (str == null) return "";
	return String(str).replace(/--/g, "&#151;");
}
//Ouverture de la database ainsi que console log en cas d'erreur et si tout se passe bien
let db = new sqlite3.Database("./glossaire", sqlite3.OPEN_READWRITE, err => {
	if (err) {
		console.log(err.message);
	}
	console.log("Base de données ouverte sans problème");
});
//Variable pour stocker des donnés sur les visiteurs. c'est un array.
let visitors = [];
//Variable pour afficher tout les marque-pages
let alph = [
"+",
"A",
"B",
"C",
"D",
"E",
"F",
"G",
"H",
"I",
"J",
"K",
"L",
"M",
"N",
"O",
"P",
"Q",
"R",
"S",
"T",
"U",
"V",
"W",
"X",
"Y",
"Z"
];

// Page d'acceuil permettant de faire une recherche ou de visualiser le nuage de mots
app.get("/", (req, res) => {
	res.render("index", { letters: alph });
});

// Initialisation de la première requete bdd sur la page accueil
//Affichage des definitions si existantes, sinon renvoi de la page vierge
app.get("/glossary", (req, res) => {
	let ind =
	"SELECT word,definition,author,date_p,likes FROM definitions ORDER BY date_p DESC LIMIT 10";
	db.serialize(() => {
		db.all(ind, (err, row) => {
			if (err) {
				console.log(err.message);
			}
			if (row.length > 0) {
				res.render("glossary", { wword: row, letters: alph });
			} else {
				console.log("Pas de definitions trouvée");
				res.render("glossary", { letters: alph });
			}
		});
	});
});
//Page spécifique peu importe le marque page appuyé ( protection a ajouter )
app.get("/lettre/:id", (req, res) => {
	var id = htmlspecialchars(req.params.id);
	var filtre =
	"SELECT word,definition,author,date_p,likes FROM definitions WHERE word like '" +
	id +
	"%'";
	db.serialize(() => {
		db.all(filtre, (err, row) => {
			if (err) {
				console.log(err.message);
			}
			if (row.length > 0) {
				res.render("glossary", { wword: row, letters: alph });
			} else {
				res.render("glossary", { letters: alph });
				console.log("pas de données avec cette lettre");
			}
		});
	});
});
//Lors de l'envoi d'un formulaire d'inscription ( protection a rajouter )
app.post("/register", (req, res) => {
	var ruser = blbl(htmlspecialchars(req.body.register_username));
	var remail = blbl(htmlspecialchars(req.body.register_email));
	var rpass = blbl(htmlspecialchars(req.body.register_password));
	var inscription = `INSERT INTO users (username,email,password) VALUES ('${ruser}','${remail}','${rpass}')`;
	db.serialize(() => {
		db.all(inscription, (err, row) => {
			if (err) {
				console.log(err.message);
			}
		});
	});
	res.redirect("/");
});
//Lors d'un ajout de poste sur le modal
app.post("/ajout", (req, res) => {
	var title = blbl(htmlspecialchars(req.body.add_word));
	var define = req.body.add_definition;
	var postadd = `INSERT INTO definitions (word,definition,author,date_p,likes) VALUES('${title}','${define}','Test',date(\'now\'),'0')`;
	db.serialize(() => {
		db.all(postadd, (err, row) => {
			if (err) {
				console.log(err.message);
			}
			res.redirect("/glossary");
		});
	});
});
//Lors d'un clic sur un mot spécifique 
app.get('/glossary/:word',(req,res)=>{
	var id=req.params.word
	var motss=`SELECT word,definition FROM definitions WHERE word='${id}';`;
	db.serialize(()=>{
		db.all(motss,(err,row)=>{
			if(err){
				console.log(err.message)
			}if(row.length>0){
				res.render('glossary',{wword:row, letters:alph})
			}else {
				res.redirect('/glossary')
			}

		})
	})
})
//Au moment d'un delete de post
app.post('/glossary',(req,res)=>{
	var butt=req.body.deleted;
	var del=`DELETE FROM definitions WHERE word='${butt}';`;
	db.serialize(()=>{
		db.all(del,(err,row)=>{
			if(err){
				console.log(error);
			}
			res.redirect('/glossary')
		})
	})
})
//Au moment d'une tentative de connexion
app.post("/connect", (req, res) => {
	let username = blbl(htmlspecialchars(req.body.connect_username));
	let password = blbl(htmlspecialchars(req.body.connect_password));

	console.log(username);

	let connection = `SELECT email, password FROM users WHERE username = '${username}'`;

	db.all(connection, (err, row) => {
		if (err) {
			console.error(err.message);
			return;
		}
		if (row != []) {
			console.log("Connection réussie");
      // socket.emit("getid");
      io.on("connection", socket => {
      	console.log(
      		`lutilisateur "${
      			socket.id
      		}" s'est connecté avec succès avec le compte "${row.email}"`
      		);
      	linkvisitor(new Visitor(socket.id, row.email));
      });

      // linkvisitor({ id: socket.id });

      res.render("index", { user: row.email, letters: alph });
  } else {
  	console.log("Cet utilisateur n'existe pas dans la base de donné");
  	res.render("index", { letters: alph });
  }
});
});

//Utilisation de socket pour récupérer les id des visiteurs et les associer apres connection aux identifiants de la base de donnés
io.on("connection", socket => {
	let visitor = new Visitor(socket.id);
	socket.emit("handshake", visitor);
	addvisitor(visitor);

	socket.on("disconnect", () => {
		subvisitor(visitor);
		console.log(`${visitor.id} // Got disconnect!`);
	});
});

class Visitor {
	constructor(id, email) {
		this.id = id;
		arguments.length > 1 ? this.email = email : this.email = "";
	}
}

function addvisitor(data) {
	visitors.push(data);
	console.log("added a visitor to visitors :");
	console.log(visitors);
}

function subvisitor(data) {
	var i = visitors.indexOf(data.id);
	visitors.splice(i, 1);
	console.log("substracted datas from visitors :");
	console.log(visitors);
}

function linkvisitor(data) {
	var i = visitors.indexOf(
		visitors.find(visitor => {
			return visitor.id == data.id;
		})
		);
	visitors[i].email = data.email;
	console.log("linked datas inside visitors :");
	console.log(visitors);

  io.on("connection", socket => {
    socket.emit("hug", data);
  });
}
