let bodyparser = require('body-parser');
let express = require('express');
let moment = require('moment');
let fs = require('fs');
let app = express();
const sqlite3 = require('sqlite3').verbose();

app.set('view engine', 'ejs');
app.use(express.static('public')); 

app.use(bodyparser.urlencoded({ extended: false}));

let server = app.listen(process.env.PORT || 8080);
//Ouverture de la database ainsi que console log en cas d'erreur et si tout se passe bien
let db= new sqlite3.Database('./glossaire',sqlite3.OPEN_READWRITE,(err)=>{
	if (err){
		console.log(err.message);
	}
	console.log('Base de données ouverte sans problème');
});
// Initialisation de la première requete bdd sur la page accueil
//Affichage des definitions si existantes, sinon renvoi de la page vierge
app.get('/', (req, res) => {
	let ind="SELECT word,definition,author,date_p,likes FROM definitions ORDER BY date_p DESC LIMIT 10";
	let alph=['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
	db.serialize(()=>{
		db.all(ind,(err,row)=>{
			if(err){
				console.log(err.message);
			}
			if(row.length>0){
				res.render('index',{wword:row},{letters:alph})
				console.log(alph)
			}else {
				console.log('Pas de definitions trouvée');
				res.render('index',{letters:alph})
				console.log(alph)
			}
		})
	})
});