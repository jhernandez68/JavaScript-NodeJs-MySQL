//Aquí se realiza la conexión con la base de datos y se guarda en una Variable llamada 'pool'
const  mysql = require('mysql');
const {promisify} = require('util');
const {database} = require('./keys');

const  pool = mysql.createPool(database);

//Conexión con la bd -> similar a un try, catch para el manejo de excepciones
pool.getConnection((err, connection) => {
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('CONEXIÓN CON LA BASE DE DATOS CERRADA');
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.error('LA BASE DE DATOS TIENE MUCHAS INSTANCIAS');
        }
        if(err.code === 'ECONNREFUSED'){
            console.error('CONEXIÓN CON LA BASE DE DATOS CERRADA');
        }
    }

    if (connection) connection.release();
    console.log('Base de datos conectada con éxito');
    return;
});

pool.query = promisify(pool.query);

//Se exporta la conexión con la bd para ser usada en otras partes
module.exports = pool;