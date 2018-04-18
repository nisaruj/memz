var appConfig = require('../config');
var passport = require('passport');

var Account = require('../models/account');

var Recaptcha = require('express-recaptcha').Recaptcha;
var captcha_secret = process.env.CPT_SECRET || appConfig.captcha_secret;
var recaptcha = new Recaptcha('6LfBTlMUAAAAACNvLOHl-Sw0fgoro9Pf_AIVUkwq', captcha_secret);

exports.post_register = function(req, res) {
    recaptcha.verify(req, function(error, data){
        if(!error) {
            //success code
            var acc = new Account({ 
                username : req.body.username, 
                email: req.body.email, 
                permission: "user"});
            Account.register(acc, req.body.password, function(err, user) {
                if (err) {
                    return res.render('register', { user : user });
                }
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/');
                });
            });
        } else {
            //error code
            res.send('<pre>Captcha error</pre>');
        }
    });
};

exports.get_login = function(req, res) {
    if (req.user) {
        res.render('login', {massage: "You have already logged in."});
    } else {
        res.render('login', {massage: null});
    }
};

exports.post_login = function(req, res) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return;
        }
        if (!user) {
            return res.render('login', {massage: "Wrong username or password."});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.render('login', {massage: "Wrong username or password."});
            } else {
                return res.redirect('/');
            }
        });
    })(req, res);
};

exports.get_logout = function(req, res) {
    req.logout();
    res.redirect('/');
};