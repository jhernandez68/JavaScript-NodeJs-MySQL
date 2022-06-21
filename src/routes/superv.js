//Archivo js para reportes (Planeación | Reportes | Jefe Planta)
const exphbs = require('express-handlebars');
const express = require ('express');
const Chart = require('chart.js');
const pool = require('../database');
const ObjectsToCsv = require('objects-to-csv'); //para pasar del objeto {} a csv y asi guardarlo.
const router = express.Router();

var productividad = [], areaxd, rp_novedades = [], datos = [],total = [], busqueda;
var f_i, f_f, formatted_date;

//!Función para transformar Fechas del formato "d-m-a" a "d/m/a" (Fecha_inicial)
const formatDate = (f_i)=>{

    let formatted_date = f_i.getFullYear() + "/" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() + 1);

    //Meses mayores a 10 y dias menores a 10
    if(f_i.getMonth() > 10 && f_i.getDate() < 10){
            formatted_date = f_i.getFullYear() + "/" + (f_i.getMonth() + 1) + "/0" +  (f_i.getDate() + 1);
            return formatted_date;
    }

    //Meses menores a 10 y días mayores a 9
    if(f_i.getMonth() < 10 && f_i.getDate()>9){
        
        //Cuando el dia es igual a 1:
        if(f_i.getDate() == "30" ){
            formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 2) + "/0" +  (f_i.getDate() - 29);
        
        }else if(f_i.getDate() == "31" ){
            formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 2) + "/0" +  (f_i.getDate() - 30);
        
        }else if (f_i.getDate() != "30" || f_i.getDate() != "31"){
            formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 1) + "/" +  (f_i.getDate() + 1);
        }
        
        return formatted_date;
    }

    //Meses menores a 10 y días menores a 10
    if(f_i.getMonth() < 10 && f_i.getDate() <9){
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

//! Función para transformar Fechas del formato "d-m-a" a "d/m/a" (Fecha_final)
const formatDate2 = (f_f)=>{
    let formatted_date = f_f.getFullYear() + "/" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() + 1);

    //Meses mayores a 10 y días menores a 10.
    if(f_f.getMonth() > 10 && f_f.getDate() < 10){
        formatted_date = f_f.getFullYear() + "/" + (f_f.getMonth() + 1) + "/0" + (f_f.getDate() + 1 );
        return formatted_date;
    }
        
    //Meses menores a 10 y días mayores a 9
    if(f_f.getMonth() < 10 && f_f.getDate()>9){
        
        //Cuando el dia es igual a 1:
        if(f_f.getDate() == "30" ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 2) + "/0" +  (f_f.getDate() - 29);
        
        }else if(f_f.getDate() == "31" ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 2) + "/0" +  (f_f.getDate() - 30);
        
        }else if (f_f.getDate() != "30" || f_f.getDate() != "31"){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() + 1);
        }
        
        return formatted_date;
    }
        
    //Meses menores a 10 y días menores a 10
    if(f_f.getMonth() < 10 && f_f.getDate()<9){
        formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 1) + "/0" +  (f_f.getDate() + 1 );
        return formatted_date;
    }

    //Meses menores a 10 y días iguales a 10
    if(f_f.getMonth() < 10 && f_f.getDate() == 9){
        formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() + 1 );
        return formatted_date;
    }

    //Meses y días mayores a 9 
    if(f_f.getMonth() > 9 && f_f.getDate() > 9){
        formatted_date = f_f.getFullYear() + "/" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() + 1);
        return formatted_date;
    }
}

//TODO obtener el rol de usuario - se importa desde la ruta authentication
const {roluser, route} = require('./authentication.js');
if(roluser == 'Supervisor'){
        console.log('Se obtuvo el rol: ' + roluser);
}else{
        console.log('No esta logeado el usuario');
}

//! Ruta Principal - reportes
router.get('/principalreportes', (req, res) => {
    res.render('links/mainreportes');
});

//! Ruta para guardar exportar excel del servidor
router.get('/export', async (req, res) => {
    productividad = [];
    res.render('links/export', {productividad});
});

//! Ruta para mostrar todas las ordenes
router.get('/export/exportexcel', async (req, res) => {
    productividad = await pool.query('SELECT * FROM productividad');
    res.render('links/export', {productividad});
});

//! Ruta para enviar a filtro - Fechas y horas
router.get('/export/filterproductividad', async (req, res) => {
     res.render('links/filter');
});

//! Ruta para enviar a filtro
router.get('/export/filterproductividadOD', async (req, res) => {
    res.render('links/filterOD');
});

//! Ruta para filtrar por empleado
router.get('/export/filteruser', async (req, res) => {
    res.render('links/filteruser');
});

//! Ruta para mostrar ordenes filtradas
router.post('/export/exportexcel2', async (req, res ) => {
    const {date_1} =req.body;
    const {date_2} =req.body;
    const {area} = req.body;
    const {time_1} = req.body;
    const {time_2} = req.body;


    areaxd = area;

    //Variables para transformar fechas de "dia-mes-año" a "dia/año/mes"
    f_i = new Date(date_1);
    f_f = new Date(date_2);

    console.log('____________________________________________________');
    console.log("f_i: " +f_i);
    console.log("formatDate(f_i): " + formatDate(f_i));
    console.log('____________________________________________________');    
    //Variables para cuadro de RESUMEN
    var total_primera = 0, total_segunda = 0, redo = 0;


    //SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento,h_inicio, h_fin FROM corte WHERE (f_fin and f_inicio BETWEEN "2022/05/05" AND "2022/05/05") AND (h_inicio and h_fin BETWEEN "00:00" AND "11:54") GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin ORDER by f_inicio ASC

    datos = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin FROM '
                                + areaxd + ' WHERE (f_inicio AND f_fin BETWEEN "' + formatDate(f_i) + '" AND "'+ formatDate2(f_f) +'") AND (h_inicio AND h_fin BETWEEN "'+ time_1 + '" AND "'+ time_2 + '") GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin ORDER by f_inicio ASC');
    
    for ( i = 0 ; i < datos.length; i++){
        if(parseInt(datos[i].u_primera, 10) >= 0){
            total_primera = parseInt(datos[i].u_primera, 10) + total_primera;
        }
        if(parseInt(datos[i].u_segunda, 10) >= 0){
            total_segunda = parseInt(datos[i].u_segunda, 10) + total_segunda;
        }
        redo = parseFloat(datos[i].rendimiento) + redo;
    }
    
    redo = redo / datos.length;
    redo.toFixed(2);

    if(time_2 > time_1){

        productividad = await pool.query('SELECT * FROM '  + area + ' WHERE (f_inicio and f_fin BETWEEN "' + formatDate(f_i) + '" AND "' 
        + formatDate2(f_f) + '" ) AND ( h_inicio and h_fin BETWEEN "'+ time_1 +'" AND "'+ time_2 + '")');

    } if(time_1 > time_2){

        //TODO SELECT * FROM almohada WHERE ( f_inicio >=  (f_inicio tomado) AND h_inicio >=  (h_inicio insertado) AND h_fin <="24:00" (estatico) AND f_fin <= "2022/05/10" (f_fin insertado) OR 
        //TODO (f_inicio >= "2022/05/10" (f_fin insertado" AND h_inicio >= "00:00" (estatico) AND 
        //TODO h_fin<="04:00" (h_fin insertado) AND f_fin <= "2022/05/10" (f_fin insertado))
        
        productividad = await pool.query('SELECT * FROM '  + area + ' WHERE ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + 
                                        '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")');
    
        console.log('SELECT * FROM '  + area + ' WHERE ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + 
                                        '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")')
    }

    //Función para pasar de Object a CSV y guardarlo ->
    (async () => {;
        const csv = new ObjectsToCsv(productividad);
        await csv.toDisk('routes/' + areaxd + ".csv");
    })();

    res.render('links/export', {productividad, total_primera, total_segunda, redo, date_1, date_2,area});
});

//! Ruta para mostrar ordenes filtradas
router.post('/export/exportexcel2OD', async (req, res ) => {
    const {date_1} =req.body;
    const {date_2} =req.body;
    const {area} = req.body;

    areaxd = area;

    //Variables para transformar fechas de "dia-mes-año" a "dia/año/mes"
    f_i = new Date(date_1);
    f_f = new Date(date_2);

    //Variables para cuadro de RESUMEN
    var total_primera = 0, total_segunda = 0, redo = 0;


    //SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento,h_inicio, h_fin FROM corte WHERE (f_fin and f_inicio BETWEEN "2022/05/05" AND "2022/05/05") AND (h_inicio and h_fin BETWEEN "00:00" AND "11:54") GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin ORDER by f_inicio ASC

    datos = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin FROM '
                                + areaxd + ' WHERE (f_inicio AND f_fin BETWEEN "' + formatDate(f_i) + '" AND "'+ formatDate2(f_f) +'")  GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin ORDER by f_inicio ASC');
    
    for ( i = 0 ; i < datos.length; i++){
        if(parseInt(datos[i].u_primera, 10) >= 0){
            total_primera = parseInt(datos[i].u_primera, 10) + total_primera;
        }
        if(parseInt(datos[i].u_segunda, 10) >= 0){
            total_segunda = parseInt(datos[i].u_segunda, 10) + total_segunda;
        }
        redo = parseFloat(datos[i].rendimiento) + redo;
    }
    
    redo = redo / datos.length;
    redo.toFixed(2)

    productividad = await pool.query('SELECT * FROM '  + area + ' WHERE (f_inicio and f_fin BETWEEN "' + formatDate2(f_i) + '" AND "' 
                                        + formatDate2(f_f) + '" )');

    console.log('SELECT * FROM '  + area + ' WHERE (f_inicio and f_fin BETWEEN "' + formatDate2(f_i) + '" AND "' 
    + formatDate2(f_f) + '" )');

    //Función para pasar de Object a CSV y guardarlo ->
    (async () => {;
        const csv = new ObjectsToCsv(productividad);
        await csv.toDisk('routes/' + areaxd + ".csv");
    })();

    res.render('links/export', {productividad, total_primera, total_segunda, redo, date_1, date_2,area});
});

//! Ruta para mostrar datos filtrados

router.post('/export/exportexcel3', async (req, res) => {
    const {date_1} = req.body;
    const {date_2} = req.body;
    const {area} = req.body;
    const {operario} = req.body;

    areaxd = area;

    //Variables para pasar de "dia-mes-año" a "dia/año/mes"
    const f_i = new Date(date_1);
    const f_f = new Date(date_2);

    productividad = await pool.query('SELECT * FROM ' + area + ' WHERE f_inicio and f_fin BETWEEN "' + formatDate(f_i) + '" AND "' + formatDate2(f_f) + '" AND operario = "' + operario + '"');
    
    //Función para pasar de Object a CSV y guardarlo ->
    
    (async () => {;
        const csv = new ObjectsToCsv(productividad);
        await csv.toDisk('routes/' + areaxd + ".csv");
    })();
    
    res.render('links/export', {productividad});
});

//! Ruta para descargar el csv - utiliza res.download()
router.get('/export/downloadcsv', (req, res) => {
    res.download(__dirname + '/' + areaxd + ".csv");
    res.render('links/export', {productividad});
});

//! Ruta para buscar OT por nombre y área
router.post('/searchot', async (req, res) => {
    //Variables para cuadro de RESUMEN
    var total_primera = 0, total_segunda = 0, redo = 0;
    
    const {Search} =req.body;
    const {area} = req.body;

    areaxd = area;

    if(Search.length < 1){
        req.flash('message', 'No se digitó ninguna OT');
        res.redirect('/export');
    }

    if(Search.length > 1){

        datos = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin FROM '
        + areaxd + ' WHERE (orden =  "' + Search + '"' + ')  GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento, h_inicio, h_fin ORDER by f_inicio ASC');
        
        for ( i = 0 ; i < datos.length; i++){
            if(parseInt(datos[i].u_primera, 10) >= 0){
                total_primera = parseInt(datos[i].u_primera, 10) + total_primera;
            }
            if(parseInt(datos[i].u_segunda, 10) >= 0){
                total_segunda = parseInt(datos[i].u_segunda, 10) + total_segunda;
            }
            redo = parseFloat(datos[i].rendimiento) + redo;
        }
        
        redo = redo / datos.length;
        redo.toFixed(2)     
        
        productividad = await pool.query('SELECT * FROM ' + area + ' WHERE orden = ?', [Search]);
    }

    if(productividad.length > 0 ){
        //Función para el CSV
        (async () => {;
            const csv = new ObjectsToCsv(productividad);
            await csv.toDisk('routes/' + areaxd +".csv");
        })();    
        res.render('links/export', {productividad, datos, total_primera, total_segunda, redo, area});            
    }
    
    else {
        req.flash('message', 'No se encontró ninguna OT con el nombre ' + '"' +  Search  + '"' + ' ,perteneciente al área de: ' + '"' + area + '"');
        res.redirect('/export');
    }
    
});

//? |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

//! Ruta para la tabla rp_novedades
router.get('/rp_novedades', (req, res) => {
    res.render('links/rp_novedades');
});

//! Ruta para enviar a filtro de rp_novedades (por fechas y área)
router.get('/rp_novedades/rp_filter2', async (req, res) => {
    res.render('links/rp_novedades_filter2');
});

//! Ruta para mostrar ordenes filtradas (dia)
router.post('/rp_novedades/exportexcel2', async (req, res ) => {
    const {date_1} =req.body;
    const {area} = req.body;

    areaxd = area;
    
    //Variables para transformar fechas de "dia-mes-año" a "dia/año/mes"
    const f_i = new Date(date_1);
    
    rp_novedades = await pool.query('SELECT * FROM rp_novedades WHERE fecha = "' + formatDate(f_i) + '" AND area = "' + areaxd + '"');
    
    //Función para pasar de Object a CSV y guardarlo ->
        (async () => {;
            const csv = new ObjectsToCsv(rp_novedades);
            await csv.toDisk('routes/rp_novedades.csv');
        })();
    res.render('links/rp_novedades', {rp_novedades});
});

//! Ruta para mostrar ordenes filtradas (fechas y area)
router.post('/rp_novedades/exportexcel3', async (req, res ) => {
    const {date_1} = req.body;
    const {date_2} = req.body;
    const {area} = req.body;

    areaxd = area;
    
    //Variables para transformar fechas de "dia-mes-año" a "dia/año/mes"
    const f_i = new Date(date_1);
    const f_f = new Date (date_2);

    rp_novedades = await pool.query('SELECT * FROM rp_novedades WHERE fecha BETWEEN "' + formatDate(f_i)+ '" AND "' + formatDate2(f_f) + '" AND area = "' + areaxd + '" ORDER by fecha ASC');
    
    //Función para pasar de Object a CSV y guardarlo ->
        (async () => {;
            const csv = new ObjectsToCsv(rp_novedades);
            await csv.toDisk('routes/rp_novedades.csv');
        })();
    res.render('links/rp_novedades', {rp_novedades});
});

//! Ruta para descargar el csv - utiliza res.download()
router.get('/rp_novedades/downloadcsv', (req, res) => {
    res.download(__dirname + '/' + "rp_novedades.csv");
    res.render('links/rp_novedades', {rp_novedades});
});

//! Ruta para buscar rp_novedades según OT
router.post('/searchrp', async (req, res) => {
    const {Search} =req.body;

    rp_novedades = await pool.query('SELECT * FROM rp_novedades WHERE orden = ?', [Search]);
    if(rp_novedades.length > 0 ){
        
        //Función para el CSV
        (async () => {;
            const csv = new ObjectsToCsv(rp_novedades);
            await csv.toDisk('routes/rp_novedades.csv');
            })();    
        res.render('links/rp_novedades', {rp_novedades});            
    }else {
        req.flash('message', 'No se encontró ninguna OT con el nombre ' + '"' +  Search  + '"');
        res.redirect('/rp_novedades');
    }
});

//?|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

//! Rutas para los gráficos
router.get('/graficos', async (req, res) => {
    res.render('links/graficos');
});

//! Ruta para pintar los gráficos
router.post('/chartjs', async (req, res) => {

    //Variables para guardar datos de las barras
    var total_primera = 0, total_segunda = 0, redo = 0, tiempo_total = 0;
    var acolchado, almohada, corte, empaque, confeccion;

    //Se importan los datos digitados
    const {date_1} = req.body;
    const {date_2} = req.body;

    const {time_1} = req.body;
    const {time_2} = req.body;

    //Variables para fechas
    const f_i = new Date(date_1);
    const f_f = new Date(date_2);

    var f_xd = new Date(date_1);

    var y = 0, Fechas = [];

    //WHILE Para calcular las fechas entre F_inicio y F_fin
    
    while(f_f.getTime() > f_xd.getTime()){
        if(y== 0){
            Fechas[y] = formatDate(f_i);
        } else {
            f_xd.setDate(f_xd.getDate()+1);
            Fechas[y] = formatDate(f_xd);
        }
        y++;
    }
    
    var f_inicioMore1 = new Date(Fechas[0]);

    var f_finLess2 = new Date(Fechas[Fechas.length - 3]);

    console.log("__________________________________________");
    console.log(f_inicioMore1.getDate());
    console.log(f_i);
    console.log(formatDate(f_inicioMore1));
    console.log(formatDate(f_finLess2));
    console.log("Longitud: " + Fechas.length);
    console.log("__________________________________________");

    //Se calculan las fechas que hay en medio de f_inicio y f_fin
    if(Fechas.length >2){
        acolchado = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM acolchado WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        almohada = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        confeccion = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM confeccion WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        corte = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM corte WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        empaque = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM empaque WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        console.log('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM empaque WHERE '+ '(f_inicio AND f_fin BETWEEN "'+ formatDate(f_inicioMore1) + '" AND "' + formatDate2(f_finLess2) + '")' + ' OR (f_inicio = "'+ formatDate(f_i) + '" AND h_inicio AND f_fin BETWEEN "' + time_1 +'" AND "23:59"'+') OR (f_fin = "' + formatDate2(f_f) + '" AND f_fin BETWEEN"' + time_2 +'" AND "00:00" )'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
    } else if (Fechas.length <3){
        //Se hacen las consultas para obtener los datos de cada tabla.
        if(time_2 > time_1 ){
            console.log("hora 2 mayor");
            acolchado = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM acolchado WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '")' + ' AND (h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            almohada = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '")' + ' AND (h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            confeccion = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM confeccion WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '")' + ' AND (h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            corte = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM corte WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '")' + ' AND (h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            empaque = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM empaque WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '")' + ' AND (h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        }

        if(time_1 > time_2){
            console.log("hora 1 mayor");
            acolchado = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM acolchado WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            almohada = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            confeccion = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM confeccion WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            corte = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM corte WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            empaque = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM empaque WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            console.log('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        }if(time_1 == time_2){
            console.log("iguales")
            acolchado = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM acolchado WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            almohada = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            confeccion = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM confeccion WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            corte = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM corte WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            empaque = await pool.query('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM empaque WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
            console.log('SELECT AVG(rendimiento), AVG(u_primera), AVG(u_segunda), COUNT(operario), orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento FROM almohada WHERE '+ ' ( f_inicio >= "' + formatDate(f_i) + '" AND h_inicio >= "' + time_1 + '" AND h_fin <= "24:00" AND f_fin <= "' + formatDate2(f_f) + '" ) OR ( f_inicio >= "' +  formatDate2(f_f) + '" AND h_inicio >= "00:00" AND h_fin <= "' + time_2 + '" AND f_fin <= "' + formatDate2(f_f) + '")'+' GROUP by orden, f_inicio, f_fin, u_primera, u_segunda, rendimiento');
        }
    }

    //Variables de acolchado
    var u_primeraAcolchado = unidadesPrimera(acolchado);
    var u_segundaAcolchado = unidadesSegunda(acolchado);
    var rdoAcolchado = unidadesRendimiento(acolchado);
            
    //Variables de Almohada
    var u_primeraAlmohada = unidadesPrimera(almohada);
    var u_segundaAlmohada = unidadesSegunda(almohada);
    var rdoAlmohada = unidadesRendimiento(almohada);
        
    //Variables de Confeccion
    var u_primeraConfeccion = unidadesPrimera(confeccion);    
    var u_segundaConfeccion = unidadesSegunda(confeccion);
    var rdoConfeccion = unidadesRendimiento(confeccion);
            
    //Variables de Corte
    var u_primeraCorte = unidadesPrimera(corte);
    var u_segundaCorte = unidadesSegunda(corte);
    var rdoCorte = unidadesRendimiento(corte);

    //Variables de Empaque
    var u_primeraEmpaque = unidadesPrimera(empaque);
    var u_segundaEmpaque = unidadesSegunda(empaque);
    var rdoEmpaque = unidadesRendimiento(empaque);


    //Función para total_primera
    function unidadesPrimera(datosp){
        total_primera = 0;
        for( i = 0; i < datosp.length ; i++){
            if(parseInt(datosp[i].u_primera, 10) >= 0){
                total_primera = parseInt(datosp[i].u_primera, 10) + total_primera;
            }
        }
        return total_primera;
    }

    //Función para total_segunda
    function unidadesSegunda(datosp){
        total_segunda = 0;
        for( i = 0; i < datosp.length ; i++){
            if(parseInt(datosp[i].u_segunda, 10) >= 0){
                total_segunda = parseInt(datosp[i].u_segunda, 10) + total_segunda;
            }
        }
        return total_segunda;
    }

    //Función para total rendimiento
    function unidadesRendimiento(datosp){
        redo = 0;
        for( i = 0; i < datosp.length ; i++){
            redo = parseFloat(datosp[i].rendimiento) + redo;
        }
        return redo;
    }

    //Función para promedio t_total
    function t_totalAVG(datosp){
        tiempo_total = 0;
        for( i = 0 ; i < datosp.length ; i++){
            if(parseInt(datosp[i].t_total, 10) >= 0){
                tiempo_total = parseInt(datosp[i].t_total, 10) + tiempo_total;
            }           
        }
        return tiempo_total;
    }

    //Se calculan los rendimientos según el área:
    rdoAcolchado = rdoAcolchado / acolchado.length;
    rdoAlmohada = rdoAlmohada / almohada.length;
    rdoConfeccion = rdoConfeccion / confeccion.length;
    rdoCorte = rdoCorte / corte.length;
    rdoEmpaque = rdoEmpaque / empaque.length;

    //Se pasan a String para evitar errores en la gráfica:

    rdoAcolchado = parseFloat(rdoAcolchado);

    rdoAlmohada = parseFloat(rdoAlmohada).toFixed(3);
    rdoConfeccion = parseFloat(rdoConfeccion).toFixed(3);
    rdoCorte = parseFloat(rdoCorte).toFixed(3);
    rdoEmpaque = parseFloat(rdoEmpaque).toFixed(3);

    //push para meter algo al arreglo (o pila o cola)
    var filerdata=[];
    
    filerdata.push(rdoAlmohada, rdoConfeccion);

    console.log(filerdata);
    
    //Se calcula el tiempo por orden:
    var tiempoacolchado = await pool.query('SELECT t_total, h_inicio, h_fin FROM acolchado WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) +'") AND ( h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '") ' +'GROUP by t_total, h_inicio, h_fin');
    var tiempoaalmohada = await pool.query('SELECT t_total, h_inicio, h_fin FROM almohada WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) +'") AND ( h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '") ' +'GROUP by t_total, h_inicio, h_fin');
    var tiempoaconfeccion = await pool.query('SELECT t_total, h_inicio, h_fin FROM confeccion WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) +'") AND ( h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '") ' +'GROUP by t_total, h_inicio, h_fin');
    var tiempoacorte = await pool.query('SELECT t_total, h_inicio, h_fin FROM corte WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) +'") AND ( h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '") ' +'GROUP by t_total, h_inicio, h_fin');
    var tiempoempaque = await pool.query('SELECT t_total, h_inicio, h_fin FROM empaque WHERE (f_inicio AND f_fin BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) +'") AND ( h_inicio AND h_fin BETWEEN "' + time_1 + '" AND "' + time_2 + '") ' +'GROUP by t_total, h_inicio, h_fin');


    //Se calcula el tiempo total
    var t_totalAcolchado = t_totalAVG(tiempoacolchado);
    var t_totalAlmohada = t_totalAVG(tiempoaalmohada);
    var t_totalConfeccion = t_totalAVG(tiempoaconfeccion);
    var t_totalCorte = t_totalAVG(tiempoacorte);
    var t_totalEmpaque = t_totalAVG(tiempoempaque);

    t_totalAlmohada = parseFloat(t_totalAlmohada).toFixed(3);
    t_totalConfeccion = parseFloat(t_totalConfeccion).toFixed(3);
    t_totalCorte = parseFloat(t_totalCorte).toFixed(3);
    t_totalEmpaque = parseFloat(t_totalEmpaque).toFixed(3);

    //Fecha inicio, Fecha fin
    fecha_1 = formatDate(f_i);
    fecha_2 = formatDate2(f_f);

/*
    //? CÓDIGO para gráfica linear
    
    //? Se calculan las unidades producidas por dia
    var linearAlmohada = await pool.query('SELECT u_primera, f_fin FROM almohada WHERE f_inicio AND f_fin BETWEEN "' + formatDate(f_i) 
                                    + '" AND "' + formatDate2(f_f) + '" GROUP BY f_fin, u_primera');
    
    console.log("fecha: " + linearAlmohada[0].f_fin);

    Fechas = [];

    var y=0;

    //? WHILE Para calcular las fechas entre F_inicio y F_fin
    while(f_f.getTime() > f_i.getTime()){
        if(y== 0){
            Fechas[y] = formatDate(f_i);
        } else {
            f_i.setDate(f_i.getDate()+1);
            Fechas[y] = formatDate(f_i);
        }
        y++;
    }

    //?  Función para calcular unidades dependiendo el dia
    var unidadesPerDay = [];

    function u_totalFechas(datosp){
        u_totalF = 0;
        for( i = 0 ; i < Fechas.length ; i++){
            for (j = 0; j < datosp.length ; j++){
                if(datosp[j].f_fin == Fechas[i]){
                    u_totalF = u_totalF + parseInt(datosp[j].u_primera, 10);
                }
            }
        }
        return u_totalF;
    }
*/
    //Se mandan a la ruta los datos
    res.render('links/chartjs', {productividad, u_primeraCorte, u_primeraAcolchado, u_primeraConfeccion, u_primeraAlmohada, u_primeraEmpaque,
                                    u_segundaAcolchado, u_segundaAlmohada, u_segundaConfeccion, u_segundaCorte, u_segundaEmpaque,
                                        rdoAcolchado, rdoAlmohada, rdoConfeccion, rdoCorte, rdoEmpaque,
                                        date_1, date_2, t_totalAcolchado, t_totalAlmohada, t_totalConfeccion,
                                            t_totalCorte, t_totalEmpaque, time_1, time_2});
});

//! Ruta para descargar el csv - utiliza res.download()
router.get('/chartjs/downloadcsv', (req, res) => {
    res.download(__dirname + '/' + "estadísticas.csv");
    res.render('links/estadisticas', {datos});
    datos = [];
});

//! Ruta para editar orden
router.get('/editot', async (req, res) => {
    res.render('links/editot');
});

//! Ruta para editar orden
router.post('/editot/edit', async (req, res) => {
    //Se importan los datos colocados por el usuario
    const {date_1} = req.body; //Fecha inicial
    const {date_2} = req.body; //Fecha final
    const {orden} = req.body; 
    const {modulo} = req.body;
    const {area} = req.body;
    const {t_est} = req.body;
    const {u_primera} = req.body;
    const {u_segunda} = req.body;
    const {rendimiento} = req.body;
    const {t_total} = req.body;

    const f_i = new Date(date_1);
    const f_f = new Date(date_2);
    
    await pool.query('UPDATE ' + area + ' SET t_est = "'+ t_est + '" , u_primera = "' + u_primera + '" , u_segunda = "' +
                        u_segunda + '" , rendimiento = "' + rendimiento + '", t_total = "' + t_total + '"'+' WHERE f_inicio = "' + formatDate(f_i)  + 
                            '" AND f_fin = "'+ formatDate2(f_f)+ '" AND  orden = "' + orden + '" AND modulo = "' + modulo + '"');
    
    
    productividad = await pool.query('SELECT * FROM ' + area + ' WHERE orden = "' + orden + '" AND f_inicio = "' + formatDate(f_i)  + 
    '" AND f_fin = "' + formatDate2(f_f)+ '"');


    if(productividad.length > 0){
    //Función para pasar de Object a CSV y guardarlo ->
    (async () => {;
        const csv = new ObjectsToCsv(productividad);
        await csv.toDisk('routes/' + areaxd + ".csv");
    })();
    res.render('links/export', {productividad});

    }else{
        req.flash('message', 'No se encontró la OT');
        res.redirect('/editot')
    }

});

//! Rutas para eliminar una ot
router.get('/deleteot', async (req, res) => {
    res.render('links/deleteot');
});

router.post('/deleteot', async (req, res) => {
    //Se importan los datos colocados por el usuario
    const {date_1} = req.body; //Fecha inicial
    const {date_2} = req.body; //Fecha final
    const {orden} = req.body;
    const {modulo} = req.body;
    const {area} = req.body;

    const f_i = new Date(date_1);
    const f_f = new Date(date_2);

    await pool.query('DELETE FROM ' + area + ' WHERE orden = "' + orden  + '" AND f_inicio = "'+formatDate(f_i)  + 
                        '" AND f_fin = "'+ formatDate2(f_f) + '" AND modulo = "' + modulo + '"');

    req.flash('success', 'OT Borrada correctamente');
    res.redirect('/principalreportes');
});

module.exports = router;