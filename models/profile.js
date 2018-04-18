var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var profileSchema = new Schema({
    username: String,
    score: Number,
    firstname: String,
    lastname: String
});

module.exports = mongoose.model('Profile', profileSchema);