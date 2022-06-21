//Handlebars - ayuda a transformar un timestamp en un timeago
const { format} = require('timeago.js');

const helpers = {};

helpers.timeago = (timestamp) => {//Se convierte el timestamp en un timeago 'Hace x tiempo'
    return format(timestamp);
};

module.exports = helpers;