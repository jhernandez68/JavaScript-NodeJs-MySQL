//Archivo de mantenimiento
const express = require ('express');
const Chart = require('chart.js');
const pool = require('../database');
const ObjectsToCsv = require('objects-to-csv'); //para pasar del objeto {} a csv y asi guardarlo.
const { route } = require('./authentication');
const router = express.Router();

//Ruta principal OnlyOperators

router.get('/onlyOperators', (req, res ) => {
    res.render('linksplaneacion/planeaciononlyOperators');
});

//Ruta principal reportes
router.get('/principalplaneacion', (req, res) => {
    res.render('linksplaneacion/principalplaneacion');
});

//Función para generar CSV - se descarga como 'mantenimiento'
function generarCSV(mantenimientoxd){
    (async () => {;
        const csv = new ObjectsToCsv(mantenimientoxd);
        await csv.toDisk('routes/mantenimiento.csv');
    })();

}

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
        if(f_i.getDate() == "30" ){
            formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 2) + "/0" +  (f_i.getDate() - 29);
        
        }else if(f_i.getDate() == "31" ){
            formatted_date = f_i.getFullYear() + "/0" + (f_i.getMonth() + 2) + "/0" +  (f_i.getDate() - 30);
        
        }else if (f_i.getDate() == "30" || f_i.getDate() == "31"){
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
        if(f_f.getDate() == "30" ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 2) + "/0" +  (f_f.getDate() - 29);
        
        }else if(f_f.getDate() == "31" ){
            formatted_date = f_f.getFullYear() + "/0" + (f_f.getMonth() + 2) + "/0" +  (f_f.getDate() - 30);
        
        }else if (f_f.getDate() == "30" || f_f.getDate() == "31"){
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

//Ruta para buscar Empleado

router.get('/mainoperator', async (req, res) => {
    empleados = await pool.query('SELECT * FROM empleados');
    res.render('linksplaneacion/mainoperator', {empleados});
});

//Busqueda de usuarios
router.post('/searchOperator', async (req, res) =>{
    //Se importa el nombre de usuario que se digitó
    const {Search} =req.body;

    empleados = await pool.query('SELECT * FROM empleados WHERE nombre = ?', [Search]);
    if(empleados.length > 0 ){
        res.render('linksplaneacion/mainoperator', {empleados});
    }else {
        req.flash('message', 'No se encontró ningún empleado con el nombre ' + '"' +  Search  + '"');
        res.redirect('/mainoperator');
    }
});


//Ruta para eliminar usuario
router.get('/deleteOperator/:id', async (req,res)=>{ //Ruta para eliminar empleado de la bd
    const {id} = req.params;
    await pool.query('DELETE FROM empleados WHERE id = "' + id +'"');
    res.redirect('/mainoperator');
});


//Rutas para editar usuario
router.get('/editOperator/:id', async (req, res) =>{
    const {id} = req.params;
    empleadoxd = await pool.query('SELECT * FROM empleados WHERE id = "' + id + '"');
    res.render('linksplaneacion/editOperators',{empleadoxd: empleadoxd[0]});
});

router.post('/editOperator/:id', async (req, res) =>{
    const {id} = req.params;
    const {nombre, area} = req.body;

    await pool.query('UPDATE empleados set nombre = "' + nombre + '" , area = "' + area +'"' + ' WHERE id = "' + id + '"');
    
    req.flash('success', 'Datos actualizados correctamente');
    res.redirect('/mainoperator');
});

//Ruta para añadir empleados a la db
router.get('/addOperator', async (req, res) => {
    res.render('linksplaneacion/addOperator');
});

router.post('/addOperator', async (req, res) => {
    const {id} = req.body;
    const {nombre} = req.body;
    const {area} = req.body;

    var comprobadorOp = 1;
    var comprobador = await pool.query('SELECT * FROM empleados');

    for(i = 0; i<comprobador.length ; i++){
        if(comprobador[i].id == id){
            comprobadorOp = 0;
        }
    }
    
    if(comprobadorOp == 0){
        req.flash('message', 'ID repetida');
        res.redirect('/mainoperator')
    }

    if(comprobadorOp == 1){
        await pool.query('INSERT INTO empleados (id, nombre, area) VALUES ("' + id + '", "' + nombre + '", "' + area + '")')

        req.flash('success', '¡ Usuario: ' + nombre + ' añadido con éxito!');

        res.redirect('/mainoperator');
    }
});

module.exports = router;