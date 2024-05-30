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

const Comment = new mongoose.Schema({
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
    }
});



module.exports = {
    Participant,
    Review,
    Comment,
}
