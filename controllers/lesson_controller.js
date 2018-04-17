var Lesson = require('../models/lesson');
var Stat = require('../models/stat');
var LearnStat = require('../models/learn_stat');

exports.get_lesson_list = function(req, res) {
    Lesson.find({avail: true}, function(err,lesson_res) {
        res.render('index', {user:req.user, _lesson:lesson_res});
    });
};

exports.get_lesson_list_filter = function(req, res) {
    Lesson.find({avail: true, lang: req.params.language}, function(err,lesson_res) {
        res.render('index', {user:req.user, _lesson:lesson_res});
    });
};

exports.get_vocab_in_lesson = function(req, res) {
    Lesson.findOne({lesson_id: req.params.lesson_id}, function(err,lesson_res) {
        res.render('lesson', {user:req.user, _lesson:lesson_res});
    });
};

exports.review_section = function(req, res) {
    Lesson.findOne({lesson_id: req.params.lesson_id}, function(err,lesson_res) {
        res.render('lesson_review', {
            user: req.user,
            _lesson: lesson_res
        });
    });
};

exports.receive_review_result = function(req, res) {
    var day_now = new Date();
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
                var learningData = {
                    $set: {username: req.user.username, loginDate : day_now}, 
                    $inc: {review_count: 1}
                };
                var day_start = new Date(day_now);
                day_start.setHours(0,0,0,0);
                var day_end = new Date(day_now);
                day_end.setHours(23,59,59,999);
                LearnStat.update({username: req.user.username, loginDate: {$gte: day_start, $lt: day_end}}, learningData, {upsert: true}, function(err, upres){
                    console.log('Updated learn stat');
                    Stat.findOne({username: req.user.username, lesson_id: req.body.lid},function(err,stat_res){
                        console.log('Result sent.');
                        return res.json({
                            user: req.user,
                            _lesson: lesson,
                            _stat: stat,
                            _overall: stat_res.vocab_stat
                        });
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
        })
    } else {
        queryLessonAndRender(req.body.id, req.body.qid);
    }
};

exports.get_quizset_json = function(req, res) {
    Lesson.findOne({lesson_id: req.params.lesson_id}, {_id: false}, function(err,lesson_res){
        console.log('get json');
        res.json({user: req.user,
            _lesson: lesson_res 
        });
    });
};