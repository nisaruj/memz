var express = require('express');
var router = express.Router();

var index_controller = require('../controllers/index_controller');
var auth_controller = require('../controllers/auth_controller');

//Get user's dashboard
router.get('/dashboard', index_controller.get_dashboard);

//Get home page
router.get('/',function(req,res){
    res.redirect('/lesson');
});

//Get register page
router.get('/register', function(req,res) {
    res.render('register');
});

//Post register data
router.post('/register', auth_controller.post_register);

//Get login page
router.get('/login', auth_controller.get_login);

//Post login data
router.post('/login', auth_controller.post_login);

//Logout
router.get('/logout', auth_controller.get_logout);

module.exports = router;
