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