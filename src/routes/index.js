const express = require('express');
const router = express.Router();
const path = require("path");
const pool = require('../database');
const helpers = require('../lib/helpers');

//Variables para el manejo de excel - No son 'const' para que se pueda actualizar su valor
var xlsx = require("xlsx"), filePath, workbook, sheetNames, data = []; //Arreglo para guardar campos de excel y pasarlos a db

//Variables globales
var usuarios, userxd //Variable para gestionar usuarios

//Asi es el manejo de las rutas:
router.get('/', (req, res) => {
    res.redirect('/signin'); 
});

//Se envian los datos del archivo 'Datos.xlsx' a la ruta 'links/excel'
router.get('/excel', (req, res) => {
    res.render('links/excel', {data});
});

//Ruta para guardar datos de excel en bd
router.post('/links/excel', async (req, res)=> {
    var datalong = data.length;//Variable para conocer si hay al menos una orden

    if(datalong > 0){//Else if para no tener datos duplicados
        await pool.query('TRUNCATE ordenes');
            for( var i= 0; i< datalong; i++){
                await pool.query('INSERT INTO ordenes set ?', data[i]);
            }
        data = [];
        req.flash('success', 'Información guardada correctamente en la base de datos');
        res.redirect('/excel');
    }else{
        req.flash('message', 'No hay datos para guardar');
        res.redirect('/excel');
        data = [];
    }
});

//TRUNCATE para borrar los datos en db de excel
router.get('/links/excel', async (req, res) =>{  
    await pool.query('TRUNCATE ordenes');
    data = [];
    req.flash('message', 'Información borrada correctamente en la base de datos');
    res.redirect('/excel');
});

//Ruta para conocer el nombre del excel
router.post('/links/read', async (req, res)=>{
    let filename = req.body.contenidoExcel;//Se obtiene el nombre del archivo seleccionado junto con su extensión

    if(filename == ""){//Se valida que se haya seleccionado un archivo
        req.flash('message', 'Error: Debe de seleccionar un archivo');
        res.redirect('/excel')
    }else{//Ruta escritorio para cargar archivo ->
        let flp = 'C:\\Users\\alistamento-planta\\Desktop';
        let extension = path.extname(filename);
        
        //Se valida la extensión del archivo seleccionado
        if(extension == ".xlsx" || extension == ".XLSX" || extension == ".CSV" || 
           extension ==".xlsm" || extension == ".xltx" || extension ==".xlsx") {
            filePath = path.resolve(flp,filename);
            workbook = xlsx.readFile(filePath);
            sheetNames = workbook.SheetNames;
            data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
            
            res.render('links/excel', {data});//Inserción de los datos:
            req.flash('success', 'Datos seleccionados con éxito');
        }else{
            req.flash('message', 'Error: Archivo erroneo');
            res.redirect('/excel');
        }
    }
});

//Rutas para gestión de usuarios
router.get('/manage/asc', async(req, res) =>{//Pintar usuarios en orden ascendente - (id)
    usuarios = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.render('links/manage', {usuarios});
});

router.get('/manage/desc', async(req,res) =>{//Pintar usuarios en orden descendente - (id)
    usuarios = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.render('links/manage', {usuarios});
});

router.get('/manage/nameasc', async (req, res)=>{//Pintar los usuarios en orden ascendente - (username)
    usuarios = await pool.query('SELECT * FROM users ORDER BY username ASC');
    res.render('links/manage', {usuarios});
});

router.get('/manage/namedesc', async (req, res) =>{//Pintar usuarios en orden descendente - (username)
    usuarios = await pool.query('SELECT * FROM users ORDER BY username DESC');
    res.render('links/manage', {usuarios});
});

router.get('/manage/fullnameasc', async (req, res) => {
    usuarios = await pool.query('SELECT * FROM users ORDER BY fullname ASC');
    res.render('links/manage', {usuarios})
});

router.get('/manage/fullnamedesc', async (req, res) => {
    usuarios = await pool.query('SELECT * FROM users ORDER BY fullname DESC');
    res.render('links/manage', {usuarios});
});

router.get('/manage/rolasc', async (req, res) => {
    usuarios = await pool.query('SELECT * FROM users ORDER by rol ASC');
    res.render('links/manage', {usuarios});
})

router.get('/manage/roldesc', async (req, res) => {
    usuarios = await pool.query('SELECT * FROM users ORDER by rol DESC');
    req.flash('success', 'Ordenado correctamente');
    res.render('links/manage', {usuarios});
});

//Ruta para eliminar usuario
router.get('/manage/deleteUser/:id', async (req,res)=>{ //Ruta para eliminar usuario
    const {id} = req.params;
    await pool.query('DELETE FROM users  WHERE ID = ?', [id]);
    res.redirect('/manage/asc');
});

//Rutas para editar usuario
router.get('/editUser/:id', async (req, res) =>{
    const {id} = req.params;
    userxd = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.render('links/editUsers',{userxd: userxd[0]});
});

router.post('/editUser/:id', async (req, res) =>{
    const {id} = req.params;
    const {username, password, fullname, rol} = req.body;
    const newUser = {
        username,
        password,
        fullname,
        rol
    }
    newUser.password = await helpers.encryptPassword(password);
    await pool.query('UPDATE users set ? WHERE id = ?', [newUser, id]);
    req.flash('success', 'Datos actualizados correctamente');
    res.redirect('/manage/asc');
});

//Busqueda de usuarios
router.post('/searchUser', async (req, res) =>{
    //Se importa el nombre de usuario que se digitó
    const {Search} =req.body;
    usuarios = await pool.query('SELECT * FROM users WHERE username = ?', [Search]);
    if(usuarios.length > 0 ){
        res.render('links/manage', {usuarios});
    }else {
        req.flash('message', 'No se encontró ningún usuario con el nombre ' + '"' +  Search  + '"');
        res.redirect('/manage/asc');
    }
});

module.exports = router;