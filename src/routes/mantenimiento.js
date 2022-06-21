//Archivo de mantenimiento
const express = require ('express');
const Chart = require('chart.js');
const pool = require('../database');
const ObjectsToCsv = require('objects-to-csv'); //para pasar del objeto {} a csv y asi guardarlo.
const router = express.Router();

var mantenimientoGlobal = [];


//Ruta principal para admin:
router.get('/mainadmin', (req, res) => {
    res.render('linksmtto/mainadmin');
});

//Función para generar CSV - se descarga como 'mantenimiento'
function generarCSV(mantenimientoxd){
    (async () => {;
        const csv = new ObjectsToCsv(mantenimientoxd);
        await csv.toDisk('routes/mantenimiento.csv');
    })();

}

//Función para transformar Fechas del formato "d-m-a" a "d/m/a" (Fecha_inicial)
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

//Función para transformar Fechas del formato "d-m-a" a "d/m/a" (Fecha_final)
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
        if(f_f.getDate() == 30 ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() - 30);
        }
        //Cuando el dia es igual a 1:
        if(f_f.getDate() == 30 ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 1) + "/" +  (f_f.getDate() - 30);
        } else{
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

//Ruta para filtrar datos de mantenimiento
router.get('/graficosmtto', async (req, res) => {
    res.render('links/graficosmtto');
});

//Variable para guardar datos de mtto:
var manconst;

//Ruta para mostrar datos de mantenimiento | Filtrados por fecha
router.post('/mantenimiento', async (req, res) => {
    //Filtar por fecha || Filtrar por máquina || Filtrar por tipo de reporte (Falla o Paro)

    //Se importan las fechas puestas por el usuario
    const {date_1} = req.body; //Fecha inicial
    const {date_2} = req.body; //Fecha final
    const {time_1} = req.body; //Hora inicial
    const {time_2} = req.body; //Hora final

    const f_i = new Date(date_1);
    const f_f = new Date(date_2);

    var mantenimiento = await pool.query('SELECT maquina, t_reporte, f_inicial, h_inicial, f_final, h_final, tiempo FROM mantenimiento WHERE (f_inicial AND f_final BETWEEN "'+ formatDate(f_i) + '" AND "' + formatDate2(f_f) + '" ) AND ( h_inicial AND h_final BETWEEN "' + time_1 + '" AND "' + time_2+'")');
    
    var listmtto = await pool.query('SELECT maquina FROM mantenimiento GROUP BY maquina ASC');

    manconst = mantenimiento;

    mantenimientoGlobal = mantenimiento;

    generarCSV(mantenimientoGlobal);

    res.render('links/mantenimiento', {mantenimiento, date_1, date_2, listmtto, time_1, time_2});
});

//Ruta para buscar info de máquin
router.post('/searchmtto', async (req, res) => {
    const {maquina} = req.body;

    var mantenimiento = await pool.query('SELECT * FROM mantenimiento WHERE maquina = "' + maquina + '"');
    var listmtto = await pool.query('SELECT maquina FROM mantenimiento GROUP BY maquina ASC');

    manconst = mantenimiento;

    //Se guarda el CSV para hacer el reporte
    mantenimientoGlobal = mantenimiento;

    generarCSV(mantenimientoGlobal);

    res.render('links/mantenimiento', {mantenimiento, listmtto});
});

router.get('/paromtto', async (req, res) => {
    var listmtto = await pool.query('SELECT maquina FROM mantenimiento GROUP BY maquina ASC');

    //paro - filtrar con datos del objeto manconst
    mantenimiento = [];

    //Se filtran los datos
    for( i = 0 ; i < manconst.length ; i++){
        if(manconst[i].t_reporte == "Paro"){
                mantenimiento[i] = manconst[i];
        }           
    }
    
    mantenimientoGlobal = mantenimiento;

    generarCSV(mantenimientoGlobal);

    res.render('links/mantenimiento', {mantenimiento, listmtto});
});

router.get('/fallamtto', async (req, res) => {
    var listmtto = await pool.query('SELECT maquina FROM mantenimiento GROUP BY maquina ASC');

    //falla - filtrar con datos del objeto manconst
    mantenimiento = [];
    
    //Se filtran los datos
    for( i = 0 ; i < manconst.length ; i++){
        if(manconst[i].t_reporte == "Falla"){
                mantenimiento[i] = manconst[i];
        }           
    }
    
    mantenimientoGlobal = mantenimiento;

    generarCSV(mantenimientoGlobal);
    res.render('links/mantenimiento', {mantenimiento, listmtto});
});

router.get('/novedadesmtto', async (req,res) => {

    //TODO TEST para ver ultima actualización de la tabla
    /*var tiempo;
    tiempo = await pool.query('SELECT UPDATE_TIME FROM   information_schema.tables WHERE  TABLE_SCHEMA = "mes" AND TABLE_NAME = "backup_mantenimiento"');
    
    console.log(tiempo);*/

    maquinas = await pool.query('SELECT * FROM backup_mantenimiento WHERE maquina != "" ORDER BY id ASC');
    res.render('linksmtto/novedadesmtto', {maquinas});
});

//Ruta para descargar el reporte - utiliza res.download()

router.get('/downloadmtto', (req, res) => {
    res.download(__dirname + '/mantenimiento.csv');
    res.render('links/mantenimiento', {mantenimientoGlobal});
});
module.exports = router;