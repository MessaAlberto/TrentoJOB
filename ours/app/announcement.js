// Route to handle requests for /announcement
const router = require('express').Router();
const Announcement = require('./models/announcementModel'); // get our mongoose model

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
        if (title) {
            // Create a regular expression to match partial titles
            query.title = new RegExp(title, 'i');
        }

        // Query the database with the constructed query object
        const announcements = await Announcement.find(query);

        // Return JSON response containing the announcements
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error retrieving announcements:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            res.status(200).send(announcement);
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (error) {
        console.error('Error retrieving announcement:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    // not guest, self
    if (!req.user && req.user.role !== 'admin' && req.user._id !== req.params.id)
        return res.status(403);

    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (announcement) {
            res.status(200).send(announcement);
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;

