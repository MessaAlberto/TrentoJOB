const {schema, model} = require('mongoose');

// pair username - id
module.exports = model("Participant", schema({
    username: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
}));