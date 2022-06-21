//TODO Archivo js para reportes (Planeación | Reportes | Jefe Planta)
const exphbs = require('express-handlebars');
const express = require ('express');
const Chart = require('chart.js');
const pool = require('../database');
const ObjectsToCsv = require('objects-to-csv'); //para pasar del objeto {} a csv y asi guardarlo.
const router = express.Router();
    
var otpila = [], test = [], contador=0;

//!Función para transformar la hora

const formatHour = (f_i) => {
    var formatted_hour;
    if(f_i.getHours() < 10 && f_i.getMinutes() < 10){
        formatted_hour = '0' + f_i.getHours() + ':0' + f_i.getMinutes();
        return formatted_hour;
    }else if(f_i.getHours()< 10 && f_i.getMinutes() > 9){
        formatted_hour = '0' + f_i.getHours() + ':' + f_i.getMinutes();
        return formatted_hour;
    }else if(f_i.getHours() > 10 && f_i.getMinutes() < 10){
        formatted_hour = f_i.getHours() + ':0' + f_i.getMinutes();
        return formatted_hour;
    }else {
        formatted_hour = f_i.getHours() + ':' + f_i.getMinutes();
        return formatted_hour;
    }
} 

//!Función para transformar Fechas del formato "d-m-a" a "d/m/a" (Fecha_inicial)
const formatDate = (f_i)=>{
    var formatDate;

    //Meses mayores a 10 y dias menores a 10
    if(f_i.getMonth() >10 && f_i.getDate() < 10){
            formatted_date = f_i.getFullYear() + "/" + (f_i.getMonth() + 1) + "/0" +  (f_i.getDate() + 1);
            return formatted_date;
    }

    //Meses menores a 10 y días mayores a 9
    if(f_i.getMonth() < 10 && f_i.getDate()>9){
            //Cuando el dia es igual a 1:
            if(f_i.getDate() == 30 ){
                formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() - 30);
            }
            //Cuando el dia es igual a 1:
            if(f_i.getDate() == 30 ){
                formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() - 30);
            } else{
                formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() + 1);
            }
            return formatted_date;
    }

    //Meses menores a 10 y días menores a 10
    if(f_i.getMonth() < 10 && f_i.getDate()<9){
        formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/0" +  (f_i.getDate() + 1 );
        return formatted_date;
    }

    //Meses menores a 10 y días iguales a 10
    if(f_i.getMonth() < 10 && f_i.getDate() == 9){
        formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() + 1 );
        return formatted_date;
    }

    //Meses y días mayores a 9 
    if(f_i.getMonth() > 9 && f_i.getDate() > 9){
        formatted_date = f_i.getFullYear() + "/" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() + 1);
        return formatted_date;
    }
}

//TODO Menu principal - liquidación
router.get('/mainmenu', async (req, res) => {
    
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario no está logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){
        console.log('Se obtuvo el nombre: ' + usernamexd );
        console.log('Se obtuvo el rol: ' + roluser);
        
        //Se transforma el nombre para hacer la consulta en la db
        usernamexd = usernamexd.toLowerCase();
    
        console.log('Transformación a minúsculas: ' + usernamexd);
        //Se consulta las ordenes que están quedando en el LOG
        logArea = await pool.query('SELECT * FROM log_' + usernamexd.toLowerCase());

        //Se resetea la tabla para dejar la id en 0 de nuevo
            if(logArea.length < 1){
                await pool.query('ALTER TABLE log_' + usernamexd + ' AUTO_INCREMENT=1');
            }
    
            res.render('main/mainmenu', {logArea, contador});
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//!Ruta para buscar orden por nombre y área
router.get('/addMainOT', async (req, res) => {
    res.render('main/mainmenu');
});

//!Ruta para buscar orden por nombre y área
router.post('/addMainOT', async (req, res) => {
    
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario no está logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado y tiene permisos
        if(roluser == 'Supervisor' || roluser == 'Admin'){
            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();

            var orden;//Variable para guardar la orden consultada en la db.
            logArea = await pool.query('SELECT * FROM log_' + usernamexd);//Se consulta las ordenes que están quedando en el LOG

            const {Search} = req.body;//Se trae la orden que el usuario digitó

            //Se verifica que se haya digitado una orden
            if(Search.length > 0){
                orden = await pool.query('SELECT * FROM planeacion WHERE ot = "' + Search + '"');

                if(orden.length > 0){ //Si la orden está en la bd

                    //Se transforma el nombre para hacer la consulta en la db
                    usernamexd = usernamexd.toLowerCase();
                    
                    var dia = new Date();
                    var hora;

                    //Se calcula la fecha actual
                    var fecha_actual = new Date();
                    var dia_ = String(fecha_actual.getDate()).padStart(2, '0');
                    var mes = String(fecha_actual.getMonth() + 1).padStart(2, '0'); //Enero es 0
                    var anio = fecha_actual.getFullYear();
                    fecha_actual = anio + '/' + mes + '/' + dia_;

                    console.log('____________________________________________________________________________');
                    console.log('fecha:' + fecha_actual);
                    console.log('____________________________________________________________________________');
                    console.log("Hora: ");
                    console.log(dia.getHours() + ':' + dia.getMinutes() );
                    console.log('____________________________________________________________________________');

                    await pool.query('INSERT INTO log_' + usernamexd + '(orden, parte, descripcion, und_prg, f_inicio, h_inicio, t_est, destino) VALUES ("' 
                    + orden[0].ot + '", "' + orden[0].parte+ '", "' + orden[0].descripcion + '", "' + orden[0].und_prog + '", "' + fecha_actual + '", "' + formatHour(dia) + '", "' + orden[0].t_estandar + '", "' + orden[0].destino + '")' );        
                    
                    //Si está bien, se hace la consulta de nuevo para actualizar la tabla
                    logArea = await pool.query('SELECT * FROM log_' + usernamexd);
                    req.flash('success', 'OT añadida correctamente');
                    res.redirect('/mainmenu');      
                } else {
                    req.flash('message', 'No se encontró la OT');
                    res.redirect('/mainmenu');
                }
            } else { //Si no hay nada en la busqueda
                req.flash('message', 'No digitó nada en la OT');
                res.redirect('/mainmenu');
            }
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
}); 

//!Ruta para eliminar orden
router.get('/deleteMainOT/:id', async (req, res) => {
    
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

        //Se transforma el nombre para hacer la consulta en la db
        usernamexd = usernamexd.toLowerCase();
        
        //Se trae la id de la orden para poder eliminar todos los registros
        const {id} = req.params;

        //! TEST PARA VER ROL DE USUARIO EN CUALQUIER PARTE   
        if(roluser == 'Supervisor'){
            console.log('Se obtuvo el nombre: ' + usernamexd );
            console.log('Se obtuvo el rol: ' + roluser);
        }else{
            console.log('No esta logeado el usuario');
        }

        await pool.query('DELETE FROM log_' + usernamexd + '_operarios WHERE idOT = ' + id);
        await pool.query('DELETE FROM log_' + usernamexd + ' WHERE id = "' + id +'"');

        console.log('__________________________________________________');
        console.log('DELETE FROM log_' + usernamexd + '_operarios WHERE idOT = ' + id);
        console.log('DELETE FROM log_' + usernamexd + ' WHERE id = "' + id +'"');
        console.log('__________________________________________________');

        req.flash('success', 'OT Borrada correctamente');
        res.redirect('/mainmenu');
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//TODO Rutas para interactuar con la OT

//!Ruta para módulo - orden
router.post('/manageModulo/:id', async (req, res) => {

    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se transforma el nombre para hacer la consulta en la db
    usernamexd = usernamexd.toLowerCase();
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    }else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){
            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();
            
            const {id} = req.params;
            const {modulo} = req.body;
        
            console.log(modulo);
        
            await pool.query('UPDATE log_' + usernamexd + ' SET modulo = "' + modulo + '" WHERE id = "' + id + '"');
            
            req.flash('success', 'Módulo añadido correctamente');
            res.redirect('/mainmenu');
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//!Ruta para unidades de primera - orden
router.post('/manageu_primera/:id', async (req, res) => {

    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    }else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();
            
            //Lógica para actualizar
            const {id} = req.params;
            const {u_primera} = req.body;
            
            console.log('UPDATE log_' + usernamexd + ' SET u_primera = "' + u_primera + '" WHERE id = "' + id + '"');

            await pool.query('UPDATE log_' + usernamexd + ' SET u_primera = "' + u_primera + '" WHERE id = "' + id + '"');

            req.flash('success', 'Unidades de primera añadidas correctamente a la OT');
            res.redirect('/mainmenu');
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//!Ruta para unidades de segunda - orden
router.post('/manageu_segunda/:id', async (req, res) => {

    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();
            
            //Lógica para añadir unidades de segunda a la OT
            const {id} = req.params;
            const {u_segunda} = req.body;
            
            await pool.query('UPDATE log_' + usernamexd + ' SET u_segunda = "' + u_segunda + '" WHERE id = "' + id + '"');
            
            req.flash('success', 'Unidades de segunda añadidas correctamente a la OT');
            res.redirect('/mainmenu');    
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
   
});

//Rutas para ver comentario de orden - actualizar
router.get('/addCommentOT/:id', async (req, res) => {
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se transforma el nombre para hacer la consulta en la db
    usernamexd = usernamexd.toLowerCase();
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){
            const {id} = req.params; //Se trae la ID de la orden

            var comment, comment2, ot; //Variables para guardar el comentario
        
            comment = await pool.query('SELECT * FROM log_' + usernamexd + ' WHERE id = ' + id); //Se consulta el comentario en la db
        
            comment2 = comment[0].comentario; //Se guarda en 'comment2' el comentario de la orden
            ot = comment[0].orden; //Se guarda en 'ot' la orden
        
            res.render('main/addCommentOT', {comment2, id, ot});    
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//!Ruta para cambiar el comentario
router.post('/addCommentOT/:id', async (req, res) => {
    
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se transforma el nombre para hacer la consulta en la db
    usernamexd = usernamexd.toLowerCase();
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

            //Lógica para gestionar el comentario
            const {id} = req.params;
            const {comentario} = req.body;

            console.log('____________________________________________________________');
            console.log('comentario: ' + comentario);
            console.log('_____________________________________________________________');
            
            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();
            
            await pool.query('UPDATE log_' + usernamexd+ ' SET comentario = "' + comentario +'" WHERE id = "' + id + '"');
        
            req.flash('success', 'Comentario añadido correctamente a la OT');
            res.redirect('/mainmenu');    
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }
});

//!Ruta para añadir empleados a una orden
router.get('/addOTOperator/:id', async (req, res) => {
    

    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();

            const {id} = req.params; //Se trae la id de la orden
            var idOT, idOT2, logAreaOP;
            var operariosOT; //Variable que guarda los operarios a mostrar según la OT
        
            //Se consulta las ordenes que están quedando en el LOG
            logAreaOP = await pool.query('SELECT * FROM log_' + usernamexd + '_operarios');

            if(logAreaOP.length < 1){
                console.log('ALTER TABLE log_' + usernamexd  + '_operarios AUTO_INCREMENT=1');
                await pool.query('ALTER TABLE log_' + usernamexd  + '_operarios AUTO_INCREMENT=1');  
            }

            idOT = await pool.query('SELECT * FROM log_' + usernamexd + ' WHERE id = "' + id + '"');//Se consulta las ordenes que están quedando en el LOG
        
            operariosOT = await pool.query('SELECT * FROM log_' + usernamexd + '_operarios WHERE idOT = "' + id + '"');//Se consulta las ordenes que están quedando en el LOG
        
            idOT2 = idOT[0].id;
        
            res.render('main/addOTOperator', {idOT2, operariosOT});    
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
        }
    }

});

//!Ruta para añadir empleados a una orden
router.post('/addOTOperator2/:id', async (req, res) => {
    
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');

    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){
            //Se transforma el nombre para hacer la consulta en la db
            usernamexd = usernamexd.toLowerCase();
            
            const {id} = req.params; //Se trae la id de la orden
            const {Search} = req.body;//Se trae la id de usuario que se digitó
            
            var empleados; //Variable que consulta la tabla empleados para guardar esos datos
            
            var orden;//Variable para guardar la orden consultada en la db.
            
            var operariosOT; //Variable que guarda los operarios a mostrar según la OT

            operariosOT = await pool.query('SELECT * FROM log_' + usernamexd + '_operarios WHERE idOT = "' + id + '"');//Se consulta las ordenes que están quedando en el LOG
            
            orden = await pool.query('SELECT * FROM log_' + usernamexd + ' WHERE id = "' + id + '"');//Se consulta las ordenes que están quedando en el LOG
        
            //Se verifica que se haya digitado una orden
            if(Search.length > 0){
                empleados = await pool.query('SELECT * FROM empleados WHERE id = "' + Search + '"');
        
                if(empleados.length > 0){ //Si el operario esta en la bd
        
                    await pool.query('INSERT INTO log_' + usernamexd + '_operarios (id, nombre, area, orden, idOT) VALUES ("' 
                    + empleados[0].id + '", "' + empleados[0].nombre+ '", "' + empleados[0].area + '", "' + orden[0].orden + '", "' + orden[0].id + '")' );        
                    
                    //Si está bien, se hace la consulta de nuevo para actualizar la tabla
                    operariosOT = await pool.query('SELECT * FROM log_' + usernamexd + '_operarios WHERE idOT = "' + id + '"');       
                } else {
                    req.flash('message', 'No se encontró');
                    res.redirect('/addOTOperator/' + id);
                }
            } else {//Si no hay nada en la busqueda
                req.flash('message', 'No digitó nada');
                res.redirect('/addOTOperator/' + id);
            }
            req.flash('success', 'Añadido correctamente');
            res.redirect('/addOTOperator/' + id);
        }else{
                console.log('No tiene permisos');
                res.send('No tiene permisos.');
        }
    }

});

//!Ruta para eliminar empleados de una orden
router.post('/deleteOperatorOT/:idOT/:key_id', async (req, res) => {

    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se transforma el nombre para hacer la consulta en la db
    usernamexd = usernamexd.toLowerCase();
    
    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){
            const {idOT} = req.params;
            const {key_id} = req.params; //Se trae la id de la orden
        
            await pool.query('DELETE FROM log_'+ usernamexd + '_operarios WHERE key_id = "' + key_id +'"');
        
            req.flash('success', 'Borrado correctamente');
        
            res.redirect('/addOTOperator/' + idOT);    
        }else{
            console.log('No tiene permisos');
            res.send('No tiene permisos.');
            }
    }
});

//TODO Ruta para liquidar la orden


/* 
    //PLantilla
    //TODO se trae el nombre de usuario junto con el rol
    var {roluser, route, usernamexd} = require('./authentication.js');
    
    //Se transforma el nombre para hacer la consulta en la db
    usernamexd = usernamexd.toLowerCase();

    //Se evalua si no es UNDEFINED o NULL - el usuario está o NO logeado
    if (roluser === undefined || roluser === null) {
        console.log('No está logeado');
        req.flash('message', 'Sesión finalizada');
        res.redirect('/signin');
    } else{ //Si el usuario está logeado
        if(roluser == 'Supervisor' || roluser == 'Admin'){

        }else{
                console.log('No tiene permisos');
                res.send('No tiene permisos.');
        }
    }
*/

module.exports = router;