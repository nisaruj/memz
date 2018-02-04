var server_port = process.env.PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var wanakana = require('wanakana');

var connection_string='mongodb://nisaruj:VRzyQeghliGHeVuS@memz-shard-00-00-svjat.mongodb.net:27017,memz-shard-00-01-svjat.mongodb.net:27017,memz-shard-00-02-svjat.mongodb.net:27017/test?ssl=true&replicaSet=memz-shard-0&authSource=admin';
mongoose.connect(connection_string);

var server = app.listen(server_port, function(){
    console.log('Listening on port %d',server_port);
});

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
        res.render('lesson',{_lesson:lesson_res});
    });
});

app.get('/lesson/:lesson_id/review',function(req,res){
    Lesson.findOne({lesson_id: req.params.lesson_id},function(err,lesson_res){
        //var index = Math.floor(Math.random() * lesson_res.vocab.length);
        res.render('lesson_review',{lesson_name: lesson_res.name,
            lesson_course: lesson_res.course,
            lid: lesson_res.id,
            quiz: lesson_res.vocab
        });
    });
});

/*app.get('/newlesson',function(req,res){
    var les = new Lesson({})
    les.save(function(err){
        if (err) throw err;
    });
});*/