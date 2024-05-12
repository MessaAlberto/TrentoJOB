// Route to handle requests for /announcement
const router = require('express').Router();
const {Announcement} = require('../models/announcementModel');
const {announcementValidation} = require("../validation");
const {newActivity, search, searchById, editEntity} = require("../utils");
const {privateContent} = require("../middleware");

// create
router.post('/', announcementValidation, async (req, res) => newActivity(req, res, Announcement));

router.get('/', async (req, res) => search(req, res, Announcement));

router.get('/:id', async (req, res) => searchById(req, res, Announcement));

router.put('/:id', privateContent(Announcement), async (req, res) => editEntity(req, res, Announcement));

router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const owner = await Announcement.findById(id, {owner: 1});

        // not guest, owner
        if (!owner || !req.user && req.user.role !== 'admin' && owner.id !== id)
            return res.status(403);

        await Announcement.findByIdAndDelete(id);
        res.status(200).json({message: 'delete successful'});

    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
});


module.exports = router;

