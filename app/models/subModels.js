const mongoose = require('mongoose');

// pair username - id
const Participant =  new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    }
});

const Review = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 150,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 5,
    }
});

const Message = new mongoose.Schema({
    sender: {
        type: Participant,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1024,
    },
});

const ChatStatus = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    other: {
        type: Participant,
        required: true,
    },
    new: {
        type: Number,
        required: true,
        default: 0,
    },
    myTurn: {
        type: Boolean,
        required: true,
    },
    lastMessage: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1024,
        default: ' ',
    },
    lastDate: {
        type: Date,
        required: false,
    },
});

const CommentSchema = new mongoose.Schema({
    user: {
        type: Participant,
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 1024,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now(),
    },
});


const Comment = mongoose.model('Comment', CommentSchema);



module.exports = {
    Participant,
    Review,
    Message,
    ChatStatus,
    Comment,
    CommentSchema,
}