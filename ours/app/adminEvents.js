const express = require('express');
const router = express.Router();
const Event = require('./models/eventModel');

// Route to handle requests for /admin/events
router.get('/', printf, async (req, res) => {
    try {
        // Query database for all events
        const events = await Event.find();

        // Return JSON response containing the events
        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/', printf, async (req, res) => {
    let event = new Event(req.body);

    if (event.title === undefined || event.title === '' || event.title === null || typeof event.title !== 'string') {
        res.status(400).json({ error: 'The field "title" must be a non-empty string' });
    } else {
        const eventResult = await event.save();
        res.status(201).send(eventResult);
    }

});


function printf(req, res, next) {
    console.log("admin.js")
    next()
}

module.exports = router;
