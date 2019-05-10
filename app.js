var express = require('express'),
bodyParser =require('body-parser'),
mongoose =require('mongoose'),
port= process.env.PORT || 3000,
app=express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Installez Mongoose en tapant : npm install mongoose
var mongoose=require('mongoose'); // Appel aux services de Mongoose

mongoose.connect('mongodb://localhost/bdd_yami', function(err){ // Connexion à ma BDD
    if(err) {
        throw err;
    }
});
// J'ai créé une BDD MongoDB nommée bdd_yami avec une table(collection) users de 3 champs à savoir: nom, email, pwd
// Création du schéma pour mes utilisateurs
var mesUsers = new mongoose.Schema({
  nom : String,
  email :String,
  pwd : String
});

// Création du Model pour les users
var Users = mongoose.model('users', mesUsers);

var route1 = express.Router();
route1.route('/api')
    .get(function(req, res){ // Ma fonction get pour extraire les données de ma BDD en format json
        Users.find(function(err,users){
            if(err){
                res.send(err);
            }
            res.send(users);
        });
    });

var route2=express.Router();
route2.route('/signup') // Controle Inscription: Ma fonction GET pour enregistrer les users depuis l'interface mobile
.get(function(req,res){
    var wine=req.body;
    Users.findOne({nom:wine.nom,email:wine.email,pwd:wine.pwd},function(err,item){
        console.log(item);
        var resultat={}
        if(item==null) { //Si l'user ne figure pas dans ma BDD enregistre moi
        var user1 = new Users({ nom : wine.nom, email:wine.email, pwd: wine.pwd, active:true });
           user1.save(function(err,users){
                if(err) return console.error(err);
                /* Ce statut de success doit être utilisé du côté
                frontend pour permettre l'inscription */
                resultat={status:"success", users:item};
                res.send(resultat);
                console.log(users.nom + " enregistré");
            });
        }
        else
         {
    /* ça veut dire que l'utilisateur existe déjà et que ce
    statut error doit être utilisé du côté frontend pour empêcher l'inscritpion */
        resultat={status:"error", users:item};
        res.send(resultat);
        console.log(resultat);
    }
    });
});

var route3=express.Router();
route3.route('/signin')

.get(function(req,res){ // Fonction login: Ma fonction GET pour authentifier et rechercher si cet utilisateur existe dans la BDD
    var wine=req.body;
    console.log(wine.email);
    Users.findOne({email:wine.email,pwd:wine.pwd},function(err,item){
        console.log(item);
        var resultat={}
        if(item==null) resultat={status:"error", user:item };
        else resultat={status:"success", user:item};
        res.send(resultat);
        console.log(item);
// A la fin de cette fonction, la logique est que lorsque, l'user existe déjà dans la BDD,
//il renvoie un status SUCCESS que je vais utiliser au niveau frontend pour donner l'accès à l'appli
// Pareil si l'utilisateur n'existe pas dans la BDD, il renvoie un statut ERROR que je vais également utiliser au niveau du fronted pour éviter l'accès à l'appli

    })
   })

//Utilisation de mes routes
app.use(route1);
app.use(route2);
app.use(route3);

app.listen(port, function(){
console.log('listen on port ' + port);
 });
