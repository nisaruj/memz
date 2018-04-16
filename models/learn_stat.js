var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var learn_statSchema = new Schema({
    username: String,
    loginDate: Date,
    review_count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('LearnStat', learn_statSchema);