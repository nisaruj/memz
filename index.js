var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var connection_string;
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
  }
try {
    mongoose.connect(connection_string);
} catch (e) {
    console.log('Database Error');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine','ejs');

var Lesson = require('./models/lesson');

app.get('/',function(req,res){
    res.redirect('/lesson');
});

app.get('/lesson',function(req,res){
    Lesson.find({},function(err,lesson_res){
        res.render('index',{_lesson:lesson_res});
    });
});

app.get('/lesson/:lesson_id',function(req,res){
    Lesson.findOne({lesson_id: req.params.lesson_id},function(err,lesson_res){
        res.render('lesson',{_lesson:lesson_res})
    });
});

/*app.get('/newlesson',function(req,res){
    var les = new Lesson({})
    les.save(function(err){
        if (err) throw err;
    });
});*/

app.listen(server_port);
console.log('Listening on port %d',server_port);