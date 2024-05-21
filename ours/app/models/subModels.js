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
});

const Attachment = Message.discriminator('Attachment', {
    file: {
        type: File,
        required: true,
    }
});

const PlainText = Message.discriminator('PlainText', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1024,
    },
});

const chatStatus = new mongoose.Schema({
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
    }
})

module.exports = {
    Participant,
    Review,
    Message,
    Attachment,
    PlainText,
    chatStatus,
}