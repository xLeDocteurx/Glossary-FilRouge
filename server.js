let bodyparser = require("body-parser");
let express = require("express");
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
//Variable pour afficher tout les marque-pages
let alph=['+','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

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
  var inscription =
  `INSERT INTO users (username,email,password) VALUES ('${ruser}','${remail}','${rpass}')`;
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
app.post('/ajout',(req,res)=>{
	var title=blbl(htmlspecialchars(req.body.add_word));
	var define=blbl(htmlspecialchars(req.body.add_definition));
	var postadd=`INSERT INTO definitions (word,definition,author,date_p,likes) VALUES('${title}','${define}','Test','DATE(\'now\')','0')`;
	db.serialize(()=>{
		db.all(postadd,(err,row)=>{
			if(err){
				console.log(err.message);
			}
		})
	})
});

app.post("/connect", (req, res) => {
let username = blbl(htmlspecialchars(req.body.connect_username));
let password = blbl(htmlspecialchars(req.body.connect_password));

let results = `SELECT * FROM users WHERE username = ${username}`;

console.log("résultats de la requette pour l'username : ");
console.log(results);
	res.redirect("/");
});
