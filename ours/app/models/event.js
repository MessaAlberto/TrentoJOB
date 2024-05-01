var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Event', new Schema({
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
    date: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String,
        required: true,
    },
    organizerID: {
        type: String,
        required: true,
    },
    participantsID: {
        type: [String],
    }
}));