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

module.exports = {
    Participant,
    Review,
}

/*const mongoose = require('mongoose');

// Definisci lo schema per i partecipanti
const participantSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

// Crea il modello Participant utilizzando lo schema definito sopra
const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
*/