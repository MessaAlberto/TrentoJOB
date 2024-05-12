const router = require('express').Router();
const {Event} = require('../models/eventModel');
const {eventValidation} = require("../validation");
const {new_activity, search, searchById} = require("../utils");

// nwe event
router.post('/', eventValidation, async (req, res) => new_activity(req, res, Event));

// modify
router.put('/', (req,res) => {
    // TODO
});

router.get('/', async (req, res) => search(req, res, Event));

router.get('/:id', async (req, res) => searchById(req, res, Event));




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