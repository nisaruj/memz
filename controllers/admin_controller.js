var Lesson = require('../models/lesson');
var Stat = require('../models/stat');

var csv_parse = require('csv-parse');
var fs = require('fs');

exports.get_admin_page = function(req, res) {
    if (req.user && req.user.permission == 'admin') {
        Lesson.find({}, function(err, lesson_res) {
            res.render('admin', {user:req.user, _lesson:lesson_res});
        });
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
};

exports.update_avail = function(req, res) {
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
};

exports.upload_new_lesson_confirm = function(req, res) {
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
};

exports.upload_new_lesson = function(req, res) {
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
};

exports.delete_lesson = function(req, res) {
    if (req.user && req.user.permission == 'admin') {
        Lesson.remove({lesson_id: req.params.lesson_id}, function(err){
            if (err) {
                console.log('Remove error');
            }
            Stat.remove({lesson_id: req.params.lesson_id}, function(err){
                console.log('Lesson and stat removed');
                res.redirect('/admin');
            });
        })
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
};

exports.get_lesson_csv = function(req, res) {
    if (req.user && req.user.permission == 'admin') {
        Lesson.findOne({lesson_id: req.params.lesson_id}, function(err, lesson_res) {
            var filename = lesson_res.course + ' ' + lesson_res.name;
            var content = ""
            for (var i=0;i<lesson_res.vocab.length;i++) {
                content += lesson_res.vocab[i].word + "," + lesson_res.vocab[i].meaning + '\n';
            }
            fs.writeFile(__dirname + '/../tmp/' + filename + '.csv', content, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
                res.download(__dirname + '/../tmp/' + filename + '.csv');
            }); 
        });
    } else {
        res.send('<pre>You not have permission to access.</pre>');
    }
}