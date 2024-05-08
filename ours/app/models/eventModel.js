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
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    expired: {
        type: Boolean,
        required: true,
    },
    organizerId: {
        type: String,
        required: true,
    },
    maxNumberParticipants: {
        type: Number,
        required: false,
    },
    participantsId: {
        type: [String],
        required: false,
    }
}));