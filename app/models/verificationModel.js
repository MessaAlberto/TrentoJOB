const mongoose = require('mongoose');
const {Participant} = require("./subModels");

const Verification = mongoose.model('Verification', new mongoose.Schema({
    organisation: {
        type: Participant,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    }
}));

module.exports = {
    Verification
};
    