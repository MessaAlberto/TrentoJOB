// Route to handle requests for /events
const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel'); // get our mongoose model


router.get('/', async (req, res) => {
    try {
        const { title } = req.query;
        let query = {};

        // Check if the title query parameter exists
        if (title) {
            // Create a regular expression to match partial titles
            const regex = new RegExp(title, 'i');
            // Add the title regex to the query
            query.title = regex;
        }

        // Query the database with the constructed query object
        const events = await Event.find(query);
        // const events = await Event.find(query).populate('participantsID');

        // Return JSON response containing the events
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

router.post('/', async (req, res) => {
    let event = new Event(req.body);

    if (event.title === undefined || event.title === '' || event.title === null || typeof event.title !== 'string') {
        res.status(400).json({ error: 'The field "title" must be a non-empty string' });
    } else {
        const eventResult = await event.save();
        res.status(201).send(eventResult);
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