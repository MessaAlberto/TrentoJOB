const mongoose = require('mongoose');
const {Participant} = require('./subModels');

const Announcement = mongoose.model('Announcement', new mongoose.Schema({
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
    location: {
        type: String,
        required: false,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    owner: {
        type: Participant,
        required: true,
    },
    maxNumberParticipants: {
        type: Number,
        required: false,
    },
    participants: {
        type: [Participant],
        required: false,
    }
}));



module.exports = {
    Announcement
}