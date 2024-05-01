var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Event', new Schema({
    title: String,
    description: String,
    date: String,
    time: String,
    location: String,
    organizerID: String
}));