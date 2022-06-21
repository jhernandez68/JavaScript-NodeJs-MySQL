/*Estos helpers ayudan a encriptar la contraseña y compararla con la que está en la bd
Por ello bcrypt*/

const bcrypt = require('bcryptjs');
const helpers = {};

//Método para encriptar contraseñas
helpers.encryptPassword = async (password) => {//Métodos para encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);
    return hash;
};

//Método para comparar contraseñas
helpers.matchPassword = async (password, savedPassword) =>{
    try {//Validación contraseña encriptada
        return await bcrypt.compare(password, savedPassword);
    }catch(e){
        console.log(e);
    }
};

module.exports = helpers;