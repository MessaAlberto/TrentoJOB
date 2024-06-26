const router = require('express').Router();
const {Event} = require('../models/eventModel');
const {eventValidation} = require("../validation");
const {newActivity, search, searchById, editEntity, erase} = require("../utils");
const {blockGuest, checkRole} = require("../middleware");

// Create new event
router.post('/', checkRole('organisation'), eventValidation, async (req, res) => newActivity(req, res, Event));

router.get('/', async (req, res) => search(req, res, Event));

router.get('/:id', async (req, res) => searchById(req, res, Event));

router.put('/:id', blockGuest, async (req, res) => editEntity(req, res, Event));

router.delete('/:id', blockGuest, async (req, res) => erase(req, res, Event));



module.exports = router;