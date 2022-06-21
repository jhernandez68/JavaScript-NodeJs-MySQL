//Lógica de JavaScript para realizar la autenticación de usuarios
const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');

var rol = new Object;
var rolusuarioxd;

var usernamexd;//Variable global para el nombre de usuario

//get para tener el inicio de sesión -> ruta en 'views'/'auth' y signin
router.get('/signin', (req,res) =>{
    res.render('auth/signin');
});

//Post del formulario en el archivo hbs
router.post('/signin', (req, res, next) => {
    
    //Se lee el nombre de usuario digitado en el logeo:
    const {username} = req.body;
    usernamexd = username;
    passport.authenticate('local.signin', {
        //Se tienen distintas opciones, si el usuario digito datos correctos o erroneos.
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true,
    })(req, res, next);
});

//Lógica para las rutas del registro de usuario
router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/logout',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/signup', (req, res)=>{
    res.render('auth/signup');
});

//Ruta principal, según el perfil se redirecciona a otra ruta:
router.get('/profile', async (req,res)=>{

    rol = await pool.query('SELECT rol from users WHERE username = ?', usernamexd);

    //Se obtiene el valor del rol y se guarda en un string
    var roluser = rol[0].rol;

    rolusuarioxd = roluser;

    userxd = rolusuarioxd;
    req.flash('success', 'Bienvenid@ ' + usernamexd);
    
    //Según el rol se redirecciona ->
    if(rolusuarioxd == "Admin"){
        res.redirect('/mainadmin');
        }else if(rolusuarioxd == "Reportes"){
            res.redirect('/supervisores-reportes');
            console.log({roluser});
            module.exports = {roluser};
        }else if(rolusuarioxd == "Supervisor"){
            //Se exporta el rol para usarlo en cualquier parte del programa
            console.log('___________________________________________________');
            console.log('entró (rolusuarioxd): ' + {rolusuarioxd});
            console.log('roluser:' + roluser);
            console.log('usernamexd: ' + usernamexd);
            module.exports = {roluser, usernamexd};
            res.redirect('/supervisores-reportes');

        }else if (rolusuarioxd == "Tiempos"){
            res.redirect("/principalreportes")
        }else if( rolusuarioxd == "Planeacion"){
            res.redirect('/principalplaneacion')
        }else if(rolusuarioxd == "OnlyOperators"){
            res.redirect('/onlyOperators')
        }else{
            res.redirect('/logout');
        }
});

router.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/signin');
});

//Ruta para el menú principal - de navigation.
router.get('/MainAll', (req, res) => {
    var roluser = rolusuarioxd;
    //Según el rol se redirecciona ->
    if(rolusuarioxd == "Admin"){
        res.redirect('/mainadmin');
        }else if(rolusuarioxd == "Reportes"){
            res.redirect('/supervisores-reportes');
            console.log({roluser});
            console.log("rol_user" + {roluser});
            module.exports = {roluser};
        }else if(rolusuarioxd == "Supervisor"){
            //Se exporta el rol para usarlo en cualquier parte del programa
            console.log('___________________________________________________');
            console.log('entró (rolusuarioxd): ' + {rolusuarioxd});
            console.log('roluser:' + roluser);
            console.log('usernamexd: ' + usernamexd);
            module.exports = {roluser, usernamexd};
            res.redirect('/supervisores-reportes');
        }else if (rolusuarioxd == "Tiempos"){
            res.redirect("/principalreportes");
        }else if( rolusuarioxd == "Planeacion"){
            res.redirect('/principalplaneacion');
        }else if(rolusuarioxd == "OnlyOperators"){
            res.redirect('/onlyOperators');
        }else{
            res.redirect('/logout');
        }
});

//Se exporta router
module.exports = router;
