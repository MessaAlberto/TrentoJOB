const express = require('express');
const router = express.Router();
const Event = require('./models/event'); // get our mongoose model

router.post('/events', async (req, res) => {
    
    let event = new Event({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        organizerID: req.body.organizerID,
        participantsID: req.body.participantsID
    });

    if (event.title === undefined || event.title === '' || event.title === null || typeof event.title !== 'string') {
        res.status(400).json({ error: 'The field "title" must be a non-empty string' });
        return;
    }

    event = await event.save();

    res.status(201).send();

});



module.exports = router;