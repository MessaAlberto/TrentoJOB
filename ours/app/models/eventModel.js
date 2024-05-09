const {schema, model} = require('mongoose');
const {Participant} = require("./participantModel");

module.exports = model('Event', new schema({
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
    organizer: {
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