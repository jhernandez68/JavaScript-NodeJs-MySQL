const express = require('express');
const router = express.Router();
const pool = require('../database');

//RUTAS DE LA APLICACIÓN - > CONTIENE EL CRUD

//Ruta para añadir una nueva orden
router.get('/add', (req, res) => {
    res.render('links/add');
});

//Ruta para hacer un INSERT -> Utiliza el insert y un objeto, se pasa mediante query y 'pool' (conexión con bd)
router.post('/add', async(req, res) =>{
    const {title, description} = req.body; //Se solicita lo digitado con (req.body)
    const newLink = {//Se instancia un objeto para guardarlo en db
        title,
        description
    };
    await pool.query('INSERT INTO link set ?', [newLink]);
    req.flash('success', 'PT guardado correctamente');
    res.redirect('/links');
});

//Ruta para listar cada una de las ordenes -> Por ello la sentencia SELECT
router.get('/', async(req, res) =>{//Pintar datos que están en la db:
    const links = await pool.query('SELECT * FROM link');
    res.render('links/list', {links});
});

//Ruta para eliminar una de las ordenes listadas -> Lo hace mediante la ID
router.get('/delete/:id', async (req,res)=>{//Se borra cada una de las tarjetas mediante la ID
    const { id } = req.params;
    await pool.query('DELETE FROM link WHERE ID = ?', [id]);
    req.flash('success', 'PT borrado exitosamente');
    res.redirect('/links');
});

//Ruta para editar una Orden -> Lo hace mediante la ID y la sentencia SELECT
router.get('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const links = await pool.query('SELECT * FROM link WHERE id = ?',[id]);

    //Acceso al primer objeto del RowDataPacket
    res.render('links/edit', {links: links[0]});
});

//Ruta para actualizar los datos de una orden, lo hace obteniento la id y la instancia de un objeto (newLink)
router.post('/edit/:id',  async (req, res)=>{
    const {id} = req.params;
    const { title, description} = req.body;
    const newLink = {
        title,
        description
    };
    await pool.query('UPDATE link set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'PT Actualizado con éxito');
    res.redirect('/links');
});

module.exports = router;