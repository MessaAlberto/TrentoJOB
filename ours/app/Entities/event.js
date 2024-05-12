const router = require('express').Router();
const {Event} = require('../models/eventModel');
const {eventValidation} = require("../validation");
const {new_activity} = require("../utils");

// nwe event
router.post('/', eventValidation, async (req, res) => new_activity(req, res, Event));

router.get('/', async (req, res) => {
    try {
        const { title } = req.query;
        let query = {};

        // Check if the title query parameter exists
        if (title) {
            // Create a regular expression to match partial titles
            query.title = new RegExp(title, 'i');
        }

        // Query the database with the constructed query object
        const events = await Event.find(query);
        // const events = await Event.find(query).populate('participantsID');

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.status(200).send(event);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error retrieving event:', error);
        res.status(500).send('Internal Server Error');
    }
});




router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (event) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;