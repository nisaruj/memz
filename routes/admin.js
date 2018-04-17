var express = require('express');
var router = express.Router();

var multer = require('multer');
var mupload = multer({dest: '../tmp/'});

var admin_controller = require('../controllers/admin_controller');

//Get admin's homepage
router.get('/', admin_controller.get_admin_page);

//Update lesson's availability
router.post('/', admin_controller.update_avail);

//New csv lesson confirmation
router.post('/newlesson/confirm', mupload.single('csv_upload'), admin_controller.upload_new_lesson_confirm);

//Post upload lesson
router.post('/newlesson', admin_controller.upload_new_lesson);

//Delete lesson
router.get('/deletelesson/:lesson_id', admin_controller.delete_lesson);

module.exports = router;