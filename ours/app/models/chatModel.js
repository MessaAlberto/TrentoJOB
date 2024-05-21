const mongoose = require('mongoose');
const {Participant, Message, PlainText, Attachment} = require("./subModels");

const Chat = mongoose.model('Chat', new mongoose.Schema({
    memberA: {
        type: Participant,
        required: true,
    },
    memberB: {
        type: Participant,
        required: true,
    },
    messages: [{
        type: Message,
    }],
    date: {
        type: Date,
        required: true,
        default: Date.now,
    }
}));



module.exports = {
    Chat
};