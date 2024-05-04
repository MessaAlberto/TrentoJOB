const mongoose = require('mongoose');

// set up a mongoose model for profile
module.exports = mongoose.model('Profile', new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'organisation', 'admin'],
        default: 'utente',
    },
    birthday: {
        type: Date,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    }
}));