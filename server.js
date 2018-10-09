let bodyparser = require("body-parser");
let express = require("express");
let { commit } = require("./utils/utils.js");
let app = express();
let htmlspecialchars = require("htmlspecialchars");
let session = require('express-session')
const sqlite3 = require("sqlite3").verbose();
//Utilisation du template ejs
app.set("view engine", "ejs");
//utilisation du dossier public pour le css
app.use(express.static("public"));
//utilisation du css pour le cas où l'on choisit une lettre ( necessaire )
app.use("/lettre/:id", express.static("public"));
//utilisation du css pour le cas où l'on consulte sans sélectionner de lettre( necessaire )
app.use("/glossary/", express.static("public"));
//cas où l'on choisit un mot
app.use("/glossary/:word", express.static("public"));
//utilisation body-parser pour recuperer les données venant du client
app.use(bodyparser.urlencoded({ extended: false }));
//Utilisation des session en express
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
let sess;

//Lancement serveur sur le port 8080
let server = app.listen(process.env.PORT || 8000);
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
//Variable fantome pour montrer le bouton supprimer que sur la page specifique d'un mot
let cande = ["random"];
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
  sess = req.session;
  console.log(sess.username);
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
        res.render("glossary", { wword: row, letters: alph});
      } else {
        console.log("Pas de definitions trouvée");
        res.render("glossary", { letters: alph });
      }
    });
  });
});
//Page spécifique peu importe le marque page appuyé ( protection a ajouter )
app.get("/lettre/:id", (req, res) => {
  let id = htmlspecialchars(req.params.id);
  let filtre =
    "SELECT word,definition,author,date_p,likes FROM definitions WHERE word like '" +
    id +
    "%'";
  db.serialize(() => {
    db.all(filtre, (err, row) => {
      if (err) {
        console.log(err.message);
      }
      if (row.length > 0) {
        res.render("glossary", { wword: row, letters: alph});
      } else {
        res.render("glossary", { letters: alph});
        console.log("pas de données avec cette lettre");
      }
    });
  });
});
//Lors de l'envoi d'un formulaire d'inscription ( protection a rajouter )
app.post("/register", (req, res) => {
  let ruser = blbl(htmlspecialchars(req.body.register_username));
  let remail = blbl(htmlspecialchars(req.body.register_email));
  let rpass = blbl(htmlspecialchars(req.body.register_password));
  let inscription = `INSERT INTO users (username,email,password) VALUES ('${ruser}','${remail}','${rpass}')`;
  db.serialize(() => {
    db.all(inscription, (err, row) => {
      if (err) {
        console.log(err.message);
      }
    });
  });
  res.redirect("/");
});
//edit d'un poste
app.post("/edit", (req, res) => {
  let ed = req.body.editpost;
  let edi = `UPDATE `;
});
//Lors d'un ajout de poste sur le modal
app.post("/ajout", (req, res) => {
  let title = blbl(htmlspecialchars(req.body.add_word));
  let define = req.body.add_definition;
  let postadd = `INSERT INTO definitions (word,definition,author,date_p,likes) VALUES('${title}','${define}','Test',date(\'now\'),'0')`;
    db.serialize(() => {
      db.all(postadd, (err, row) => {
        if (err) {
          console.log(err.message);
        }
        res.redirect("/glossary");
      });
    });
});
//Lors de l'ajout d'un lien vers une source sur une définition
app.post("/source", (req, res) => {
  let item = req.body.add_linkitem;
  let link = req.body.add_link;
  let linkname = req.body.add_linkname;
  let linkadd = `INSERT INTO links (item, name, href) VALUES ('${item}','${linkname}','${link}')`;
  db.serialize(() => {
    db.all(linkadd, (err, row) => {
      if (err) {
        console.log(err.message);
      }
      // res.redirect(`glossary/${item}`);
      res.redirect(`/glossary/${item}`);
    });
  });
});

//Lors d'un clic sur un mot spécifique
app.get("/glossary/:word", (req, res) => {
  let id = req.params.word;

  //selectionner tous les likes d'un mot
  // let likes = `SELECT * FROM likes WHERE likes.definition = ${word}`;
  //selectioner et fusionner likes et mots

  let links = `SELECT * FROM links
  WHERE item = '${id}'`;

  let likes = `SELECT * FROM likes
  WHERE item = '${id}'`;

  let motss = `SELECT word,definition FROM definitions WHERE word='${id}';`;
  db.serialize(() => {
    db.all(motss, (err, row) => {
      // console.log(row);
      if (err) {
        console.log(err.message);
      }
      if (row.length > 0) {
        db.all(links, (errr, roww) => {
          // console.log(roww);
          if (errr) {
            console.log(errr.message);
          }
          db.all(likes, (errrr, rowww) => {
            // console.log(rowww);
            if (errrr) {
              console.log(errrr.message);
            }
            res.render("word", {
              mot: row[0],
              links: roww,
              likes: rowww,
              letters: alph,
              candel: cande
            });
          });
        });
      } else {
        res.redirect("/glossary");
      }
    });
  });
});

//Au moment d'un delete de post
app.post("/glossary", (req, res) => {
  let butt = req.body.deleted;
  let del = `DELETE FROM definitions WHERE word='${butt}';`;
  let log = `INSERT INTO logs (word,author,date_del) VALUES('${butt}','email',"date('now')");`;
  db.serialize(() => {
    db.all(log, (err, row) => {
      if (err) {
        console.log(err.message);
      }
      db.all(del, (err, row) => {
        if (err) {
          console.log(err.message);
        }
      });
      res.redirect("/glossary");
    });
  });
});

//Au moment d'une tentative de connexion
app.post("/connect", (req, res) => {
  sess = req.session;
  let username = blbl(htmlspecialchars(req.body.connect_username));
  let password = blbl(htmlspecialchars(req.body.connect_password));
  let connection = `SELECT * FROM users WHERE username = '${username}';`;
  db.serialize(() => {
    db.all(connection, (err, row) => {
      if (err) {
        console.error(err.message);
      }
      if (row.length > 0) {
        if( password == row[0].password) {
          sess.username = username;
        }
        res.redirect("/");
      } else {
        res.redirect("/");
      }
    });
  });
});
//Lors d'une recherche
app.post("/search", (req, res) => {
  let src = req.body.searc;
  let ur = "/glossary/" + src;
  res.redirect(ur);
});