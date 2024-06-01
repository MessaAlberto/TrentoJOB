// Route to handle requests for /announcement
const router = require('express').Router();
const {Announcement} = require('../models/announcementModel');
const {announcementValidation} = require("../validation");
const {newActivity, search, searchById, editEntity, erase} = require("../utils");
const {blockGuest, checkRole} = require("../middleware");

// create
router.post('/', blockGuest, announcementValidation, async (req, res) => newActivity(req, res, Announcement));

router.get('/', async (req, res) => search(req, res, Announcement));

router.get('/:id', async (req, res) => searchById(req, res, Announcement));

router.put('/:id', blockGuest, async (req, res) => editEntity(req, res, Announcement));

router.delete('/:id', blockGuest, async (req, res) => erase(req, res, Announcement));



module.exports = router;