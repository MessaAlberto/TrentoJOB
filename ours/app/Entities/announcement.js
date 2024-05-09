// Route to handle requests for /announcement
const router = require('express').Router();
const {Announcement} = require('../models/announcementModel'); // get our mongoose model

// create
router.post('/', async (req, res) => {
    let announcement = new Announcement(req.body);


    // TODO BETTER
    if (announcement.title|| typeof announcement.title !== 'string') {
        res.status(400).json({ error: 'The field "title" must be a non-empty string' });
    } else {
        const announcementResult = await announcement.save();
        res.status(201).send(announcementResult);
    }
});

// modify
router.put('/', (req,res) => {
    // TODO
});

router.get('/', async (req, res) => {
    try {
        const { title } = req.query;
        let query = {};

        // Check if the title query parameter exists
        if (title)
            query.title = new RegExp(title, 'i');

        // Query the database with the constructed query object
        const announcements = await Announcement.find(query);

        // Return JSON response containing the announcements
        res.status(200).json(announcements);
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            res.status(200).json(announcement);
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (error) {
        console.error('Error retrieving announcement:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const owner = await Announcement.findById(id, {owner: 1});

        // not guest, owner
        if (!owner || !req.user && req.user.role !== 'admin' && owner.id !== id)
            return res.status(403);

        await Announcement.findByIdAndDelete(id);
        res.status(200).json({message: 'delete succesful'});

    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
});


module.exports = router;

