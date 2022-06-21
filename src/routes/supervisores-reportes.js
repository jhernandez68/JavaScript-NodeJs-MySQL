//TODO Archivo JS para reportes de supervisores

const express = require ('express');
const pool = require('../database');
const ObjectsToCsv = require('objects-to-csv'); //para pasar del objeto {} a csv y asi guardarlo.
const router = express.Router();

//! Ruta Principal
router.get('/supervisores-reportes', (req, res) => {
    res.render('links/principalsuperv');
});

//! Los datos a filtrar es por orden, se agrupan segun la misma y se muestra el rendimiento

//? SELECT COUNT(operario), orden, u_primera, u_segunda, rendimiento, f_inicio, h_inicio, f_fin, h_fin FROM confeccion WHERE f_fin = "2022/04/25" GROUP BY orden, u_primera, u_segunda, rendimiento, f_inicio, h_inicio, f_fin, h_fin

//! Se exportan las rutas
module.exports = router;