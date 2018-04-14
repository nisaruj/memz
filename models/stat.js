var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statSchema = new Schema({
    username: String,
    lesson_id: Number,
    vocab_stat: [{id: Number, review_correct: Number, review_total: Number}]
});

module.exports = mongoose.model('Stat', statSchema);