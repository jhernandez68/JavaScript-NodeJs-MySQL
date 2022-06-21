//Método para proteger rutas - Solo vista por usuarios registrados
module.exports = {
    isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next;
        }
        return res.redirect('/signin');
    }
}