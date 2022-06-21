//Passport es el framework utilizado para la autenticación
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

//Lógica para el inicio de sesión (/login)
passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},
    async (req,username, password, done)=>{
        const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username] );//Se cargan los usuarios en la bd y se guardan en 'rows'
        //Se evalua si hay datos que coincidan
        if(rows.length > 0){//Si se encuentran datos:
            const user = rows[0];
            const validPassword = await helpers.matchPassword(password, user.password);

            if(validPassword){//Si la contraseña es válida:
                done(null, user, req.flash('success','Bienvenid@' + user.username));
            }else{ 
                done(null, false, req.flash('message','Contraseña incorrecta'));//Si la contraseña es inválida
            }
        } else{
            return done(null, false, req.flash('message','El nombre de usuario no existe'));//Cualquier otro error que pueda presentarse
        }
}));

//Lógica para el registro de usuarios
passport.use('local.signup', new LocalStrategy({//Requiere usuario y contraseña
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    
    const {fullname, rol} = req.body;

    const newUser = {//Se crea una matriz para guardar los datos en la bd.
        username,
        password,
        fullname,
        rol
    };
    newUser.password = await helpers.encryptPassword(password);

    const result = await pool.query('INSERT INTO users SET ?', [newUser]);//Se utiliza la sentencia INSERT INTO para agregar el usuario a la bd.
    newUser.id = result.insertId;//Se le asigna una id al usuario y se retorna este.
    return done(null, newUser);
}));

passport.serializeUser((user, done) =>{
    done(null, user.id);
});

passport.deserializeUser( async (id, done)=> {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
});