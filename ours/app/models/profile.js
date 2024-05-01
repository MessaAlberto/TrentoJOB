const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Profile', new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    phone: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 15,
    },
}));