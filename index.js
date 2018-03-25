var server_port = process.env.PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var wanakana = require('wanakana');

var db_user = process.env.DB_USER || "YOUR_DATABASE_USERNAME";
var db_pass = process.env.DB_PASS || "YOUR_DATABASE_PASSWORD";
var connection_string = process.env.DB_STR || "YOUR_DATABASE_URI_STRING";
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
    Lesson.find({avail: true},function(err,lesson_res){
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
            lang: lesson_res.lang,
            quiz: lesson_res.vocab
        });
    });
});

app.get('/admin',function(req,res){
    Lesson.find({},function(err,lesson_res){
        res.render('admin',{_lesson:lesson_res});
    });
});

app.post('/admin',function(req,res){
    console.log(req.body.avail);
    const is_avail = new Set(req.body.avail);
    Lesson.find({},function(err,lesson_res){
        for (var i=0;i<lesson_res.length;i++) {
            lesson_res[i] = is_avail.has(i);
        }
        lesson_res.save(function (err) { 
            if (err) {
                console.log(err);
            }
        });
        res.render('admin',{_lesson:lesson_res});
    });
});

/*app.get('/newlesson',function(req,res){
    var les = new Lesson({})
    les.save(function(err){
        if (err) throw err;
    });
});*/