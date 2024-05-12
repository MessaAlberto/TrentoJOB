const mongoose = require('mongoose');

// pair username - id
module.exports = Partecipants =  new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});