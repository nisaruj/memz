var server_port = process.env.PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var csv_parse = require('csv-parse');
var fs = require('fs');
var mongoose = require('mongoose');
var wanakana = require('wanakana');
var multer = require('multer');
var mupload = multer({dest: 'tmp/'});

var db_user = process.env.DB_USER || "YOUR_DATABASE_USERNAME";
var db_pass = process.env.DB_PASS || "YOUR_DATABASE_PASSWORD";
var connection_string = process.env.DB_STR || "YOUR_URI_STRING";
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
    for (var i=0;i<req.body.length;i++) {

    }
    const is_avail = new Set(req.body.avail.map(function(num) { return parseInt(num,10); }));
    Lesson.find({},function(err,lesson_res){
        for (var i=0;i<lesson_res.length;i++) {
            lesson_res[i].avail = is_avail.has(i);
            console.log(is_avail.has(i));
            Lesson.update({_id: lesson_res[i]._id}, {avail: lesson_res[i].avail},function(err,aff) {
                console.log('Updated %d',aff);
            });
        }
        console.log(lesson_res);
        res.render('admin',{_lesson: lesson_res});
    });
});

app.post('/admin/newlesson/confirm',mupload.single('csv_upload'), function (req,res) {
    console.log('csv uploaded : %s',req.file.path);
    fs.readFile(req.file.path,'utf8',function(err,output) {
        csv_parse(output, function(err,parsed_data) {
            console.log(parsed_data);
            res.render('new_lesson',{data: parsed_data});
        });
    });
})

app.post('/admin/newlesson', function(req,res) {
    var wordlist = [];
    for(var i=0;i<req.body.word.length;i++) {
        wordlist.push({
            id: i+1,
            word: req.body.word[i],
            meaning: req.body.meaning[i]
        })
    }
    var les = {
        avail: true,
        lesson_id: parseInt(req.body.lid),
        course: req.body.course_name ,
        name: req.body.lesson_name,
        lang: req.body.lang,
        vocab: wordlist,
        vocab_size: req.body.word.length
    };
    var newlesson = new Lesson(les);
    console.log(les);
    Lesson.count({lesson_id: parseInt(req.body.lid)}, function(err,count) {
        if (count > 0) {
            console.log('Duplicate lid');
            res.send('<pre>Duplicate lid. Try again later.</pre>');
        } else {
            newlesson.save(function(err) {
                if (err) {
                    console.log('Something went wrong. Try again later.');
                    console.log(err);
                    res.send('<pre>Something went wrong. Try again later.</pre>');
                } else {
                    console.log('Save successfully');
                    res.redirect('/admin');
                }
            });
        }
    });
});