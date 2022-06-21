//Variables para hacer la conexión, enviar mensajes, utilizar express, etc..
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash'); //se usa para hacer la alerta (success| message), pero requiere de una sesión
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const {database} = require('./keys');

//Inicializaciones
const app = express();
require('./lib/passport');

//configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

//Middlewares - Funciones de peticiones
app.use(session({
    secret:'mysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload({
    createParentPath: true
}));

//Variables globales 
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//Rutas (Routes) - urls del servidor - En cada archivo js se exporta la ruta.
app.use(require('./routes')); 
app.use(require('./routes/authentication'));
app.use(require('./routes/superv'));
app.use(require('./routes/supervisores-reportes'));
app.use(require('./routes/mantenimiento'));
app.use(require('./routes/planeacion-reportes'));
app.use(require('./routes/main'));
app.use('/links', require('./routes/links'));

//Public 
app.use(express.static(path.join(__dirname, 'public')));

//Starting server - sesion para iniciar el server
app.listen(app.get('port'), () => {
    console.log('Servidor en puerto', app.get('port'))
});