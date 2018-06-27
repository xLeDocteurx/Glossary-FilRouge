let bodyparser = require('body-parser');
let express = require('express');
let moment = require('moment');
let fs = require('fs');
let app = express();
let htmlspecialchars = require('htmlspecialchars');
const sqlite3 = require('sqlite3').verbose();
//Utilisation du template ejs
app.set('view engine', 'ejs');
//utilisation du dossier public pour le css
app.use(express.static('public')); 
//utilisation du css pour le cas où l'on choisit une lettre ( necessaire )
app.use('/lettre/:id', express.static('public'));
//utilisation body-parser pour recuperer les données venant du client
app.use(bodyparser.urlencoded({ extended: false}));
//Lancement serveur sur le port 8080
let server = app.listen(process.env.PORT || 8080);
//function pour els double tirets
    function blbl(str) {
        if (str == null) return '';
        return String(str).
            replace(/--/g, '&#151;');
    };
//Ouverture de la database ainsi que console log en cas d'erreur et si tout se passe bien
let db= new sqlite3.Database('./glossaire',sqlite3.OPEN_READWRITE,(err)=>{
	if (err){
		console.log(err.message);
	}
	console.log('Base de données ouverte sans problème');
});
//Variable pour afficher tout les marque-pages
let alph=['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
// Initialisation de la première requete bdd sur la page accueil
//Affichage des definitions si existantes, sinon renvoi de la page vierge
app.get('/', (req, res) => {
	let ind="SELECT word,definition,author,date_p,likes FROM definitions ORDER BY date_p DESC LIMIT 10";
	db.serialize(()=>{
		db.all(ind,(err,row)=>{
			if(err){
				console.log(err.message);
			}
			if(row.length>0){
				res.render('index',{wword:row,letters:alph})
			}else {
				console.log('Pas de definitions trouvée');
				res.render('index',{letters:alph})
			}
		})
	})
});
//Page spécifique peu importe le marque page appuyé ( protection a ajouter )
app.get('/lettre/:id',(req,res)=>{
	var id=htmlspecialchars(req.params.id);
	var filtre="SELECT word,definition,author,date_p,likes FROM definitions WHERE word like '"+id+"%'";
	db.serialize(()=>{
		db.all(filtre,(err,row)=>{
			if(err){
				console.log(err.message)
			}
			if(row.length>0){
				res.render('index',{wword:row,letters:alph})
			}else{
				res.render('index',{letters:alph});
				console.log('pas de données avec cette lettre');
			}
		})
	})
})
//Lors de l'envoi d'un formulaire d'inscription ( protection a rajouter )
app.post('/register',(req,res)=>{
	var ruser=blbl(htmlspecialchars(req.body.register_username));
	var remail=blbl(htmlspecialchars(req.body.register_username));
	var rpass=blbl(htmlspecialchars(req.body.register_password));
	var inscription="INSERT INTO users (username,email,password) VALUES ("+ruser+","+remail+","+rpass+")";
	console.log(ruser)
	db.serialize(()=>{
		db.all(inscription,(err,row)=>{
			if(err){
				console.log(err.message)
			}else if (row.length<3){

			}else{
				
			}
		})
	})
	res.redirect('/')
})