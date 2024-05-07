var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Announcement', new Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    description: {
        type: String,
        required: true,
        maxlength: 1024,
    },
    date_begin: {
        type: Date,
        required: false,
    },
    date_stop: {
        type: Date,
        required: false,
    },
    time_begin: {
        type: String,
        required: false,
    },
    time_stop: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    ownerId: {
        type: String,
        required: true,
    },
    maxNumberParticipants: {
        type: Number,
    },
    participantsID: {
        type: [String],
    }
}));