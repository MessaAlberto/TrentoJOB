const mongoose = require('mongoose');
const {Participant, CommentSchema} = require("./subModels");

const Event = mongoose.model('Event', new mongoose.Schema({
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
    location: {
        type: String,
        required: true,
    },
    expired: {
        type: Boolean,
        required: true,
        default: false,
    },
    comments: {
        type: [CommentSchema],
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
    Event
};
