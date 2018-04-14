var appConfig = require('./config');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csv_parse = require('csv-parse');
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy;
var wanakana = require('wanakana');
var multer = require('multer');
var mupload = multer({dest: 'tmp/'});

var server_port = process.env.PORT || appConfig.server_port;
var session_secret = process.env.SESSION_SECRET || appConfig.session_secret;
var db_user = process.env.DB_USER || appConfig.db_user;
var db_pass = process.env.DB_PASS || appConfig.db_pass;
var connection_string = process.env.DB_STR || appConfig.connection_string;
mongoose.connect(connection_string);

var server = app.listen(server_port, function(){
    console.log('Listening on port %d',server_port);
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(require('express-session')({
    secret: session_secret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine','ejs');

var Lesson = require('./models/lesson');
var Account = require('./models/account');
var Stat = require('./models/stat');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.get('/',function(req,res){
    res.redirect('/lesson');
});

// LESSON SECTION //

app.get('/lesson', function(req,res){
    Lesson.find({avail: true},function(err,lesson_res){
        res.render('index',{user:req.user, _lesson:lesson_res});
    });
});

app.get('/lesson/:lesson_id', function(req,res){
    Lesson.findOne({lesson_id: req.params.lesson_id},function(err,lesson_res){
        res.render('lesson',{user:req.user, _lesson:lesson_res});
    });
});

app.get('/lesson/:lesson_id/review', function(req,res){
    Lesson.findOne({lesson_id: req.params.lesson_id},function(err,lesson_res){
        res.render('lesson_review',{user: req.user,
            _lesson: lesson_res
        });
    });
});

app.post('/lesson/:lesson_id/review', function(req,res){
    var queryLessonAndRender = function(correct, allQuiz){
        const correctSet = new Set(correct);
        var stat = []
        var overall = []
        for (var i=0;i<allQuiz.length;i++) {
            stat.push({id: allQuiz[i], is_correct: correctSet.has(allQuiz[i])})
        }
        console.log(stat);
        return Lesson.findOne({lesson_id: req.body.lid}, function(err,lesson_res){
            console.log(err);
        }).then(function(lesson){
            if (req.user) {
                Stat.findOne({username: req.user.username, lesson_id: req.body.lid},function(err,stat_res){
                    console.log('Result sent.');
                    return res.json({
                        user: req.user,
                        _lesson: lesson,
                        _stat: stat,
                        _overall: stat_res.vocab_stat
                    });
                });
            } else {
                for (var i=0;i<lesson.vocab.length;i++) {
                    overall.push({id: i+1, review_correct: correctSet.has(i+1)?1:0, review_total: 1});
                }
                console.log('Result sent.');
                return res.json({
                    user: req.user,
                    _lesson: lesson,
                    _stat: stat,
                    _overall: overall
                });
            }  
        }).catch(err => console.log(err));
    };
    if (req.user) {
        var update_query = {}
        var vocab_list = []
        for (var i=0;i<req.body.id.length;i++) {
            update_query['vocab_stat.'+req.body.id[i].toString()+'.review_correct'] = 1;
        }
        for (var i=0;i<req.body.qid.length;i++) {
            update_query['vocab_stat.'+req.body.qid[i].toString()+'.review_total'] = 1;
        }
        var exist;
        idSet = new Set(req.body.id);
        qidSet = new Set(req.body.qid);
        Stat.count({username: req.user.username, lesson_id: req.body.lid},function(err,c){
            exist = c;
            if (!exist) {
                for (var i=0;i<req.body.vsize;i++) {
                    vocab_list.push({id: i+1, review_correct: idSet.has(i+1) && qidSet.has(i+1)?1:0, review_total: qidSet.has(i+1)?1:0});
                }
                var newstat = {
                    username: req.user.username,
                    lesson_id: req.body.lid,
                    vocab_stat: vocab_list
                };
                newStat = new Stat(newstat);
                return newStat.save().then(function() {
                    console.log('Stat updated.');
                    queryLessonAndRender(req.body.id, req.body.qid); 
                });
            } else {
                return Stat.update({username: req.user.username, lesson_id: req.body.lid}, {$inc: update_query},function(err,res){
                    console.log(err);
                    queryLessonAndRender(req.body.id, req.body.qid);
                });
            }
        });
    } else {
        queryLessonAndRender(req.body.id, req.body.qid);
    }
});

// ADMIN SECTION //

app.get('/admin',function(req,res){
    if (req.user && req.user.permission == 'admin') {
        Lesson.find({},function(err,lesson_res){
            res.render('admin',{user:req.user, _lesson:lesson_res});
        });
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
});

app.post('/admin',function(req,res){
    if (req.user && req.user.permission == 'admin') {
        console.log(req.body.avail);
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
            res.render('admin',{user:req.user, _lesson: lesson_res});
        });
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
});

app.post('/admin/newlesson/confirm',mupload.single('csv_upload'), function (req,res) {
    if (req.user && req.user.permission == 'admin') {
        console.log('csv uploaded : %s',req.file.path);
        fs.readFile(req.file.path,'utf8',function(err,output) {
            csv_parse(output, function(err,parsed_data) {
                console.log(parsed_data);
                res.render('new_lesson',{user:req.user, data: parsed_data});
            });
        });
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
})

app.post('/admin/newlesson', function(req,res) {
    if (req.user && req.user.permission == 'admin') {
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
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
});

// AUTH SECTION //

app.get('/register', function(req,res) {
    res.render('register');
});

app.post('/register', function(req,res) {
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
})

app.get('/login', function(req,res){
    if (req.user) {
        res.render('login', {massage: "You have already logged in."});
    } else {
        res.render('login', {massage: null});
    }
});

app.post('/login', function(req,res,next) {
    /*passport.authenticate('local')(req, res, function () {
        res.redirect('/');
    });*/
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return next(err);
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
    })(req, res, next);
});

app.get('/logout', function(req,res) {
    req.logout();
    res.redirect('/');
});

//API SERVICE //

app.get('/lesson/get_qset/:lesson_id', function(req,res) {
    Lesson.findOne({lesson_id: req.params.lesson_id}, {_id: false}, function(err,lesson_res){
        console.log('get json');
        res.json({user: req.user,
            _lesson: lesson_res 
        });
    });
});