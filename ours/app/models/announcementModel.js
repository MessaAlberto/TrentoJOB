const {Schema, model} = require('mongoose');
const Participant = require('./participantModel');

module.exports = model('Announcement', new Schema({
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