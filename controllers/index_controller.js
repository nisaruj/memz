var Lesson = require('../models/lesson');
var Stat = require('../models/stat');
var LearnStat = require('../models/learn_stat');
var Profile = require('../models/profile');

exports.get_dashboard = function(req, res) {
    if (req.user) {
        const min_count = 3, min_rate = 0.6;
        return Lesson.find({}).then(function(lesson){
            var lessonMap = {}
            lesson.forEach(function(les){
                lessonMap[les.lesson_id] = les;
                //console.log(les.name);
            });
            return lessonMap;
        }).then(function(lessonMap) {
            Stat.find({username: req.user.username}, function(err, lesson_data){
                var learnt_word_count = 0, lesson_list = [], lesson_learnt_word_count;
                lesson_data.forEach(function(myLesson){
                    //console.log(lessonMap[myLesson.lesson_id].name);
                    lesson_learnt_word_count = 0;
                    for (var i=0;i<myLesson.vocab_stat.length;i++) {
                        if (myLesson.vocab_stat[i].review_total > min_count && 
                            myLesson.vocab_stat[i].review_correct / myLesson.vocab_stat[i].review_total >= min_rate) {
                                learnt_word_count++;
                                lesson_learnt_word_count++;
                        }
                    }
                    lesson_list.push({
                        fullname: lessonMap[myLesson.lesson_id].course + ' ' + lessonMap[myLesson.lesson_id].name,
                        lesson_id: myLesson.lesson_id,
                        lang: lessonMap[myLesson.lesson_id].lang,
                        learnt_count: lesson_learnt_word_count,
                        word_count: lessonMap[myLesson.lesson_id].vocab.length
                    });
                });
                LearnStat.find({username: req.user.username}, function(err, learnStat){
                    var learn_stat = [];
                    learnStat.forEach(function(stat){
                        learn_stat.push([stat.loginDate.getDate() + '/' + (stat.loginDate.getMonth()+1) + '/' + stat.loginDate.getFullYear(), stat.review_count]);
                    });
                    Profile.findOne({username: req.user.username}, function(err, profile_res){
                        res.render('dashboard', {
                            user: req.user,
                            lesson_list: lesson_list, 
                            learnt_word_count: learnt_word_count,
                            learn_stat: learn_stat,
                            profile: profile_res
                        });
                    });
                });
                //console.log(lesson_list);
            })
        }).catch(err => console.log(err));
    } else {
        res.redirect('/login');
    }
};