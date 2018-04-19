var express = require('express');
var router = express.Router();

var lesson_controller = require('../controllers/lesson_controller');

//Lesson list
router.get('/', lesson_controller.get_lesson_list);

//Filtered lesson list 
router.get('/filter/:language', lesson_controller.get_lesson_list_filter);

//Vocab list
router.get('/:lesson_id', lesson_controller.get_vocab_in_lesson);

//Get lesson review
router.get('/:lesson_id/review', lesson_controller.review_section);

//Get lesson flashcard
router.get('/:lesson_id/flashcard', lesson_controller.flashcard_section);

//Receive review result from client
router.post('/:lesson_id/review', lesson_controller.receive_review_result);

//Return quiz set json to client
router.get('/get_qset/:lesson_id', lesson_controller.get_quizset_json);

module.exports = router;