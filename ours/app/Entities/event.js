const router = require('express').Router();
const {Event} = require('../models/eventModel');
const {eventValidation} = require("../validation");
const {newActivity, search, searchById, editEntity, erase} = require("../utils");
const {privateContent, checkRole} = require("../middleware");

// Create new event
router.post('/', checkRole('organisation'), eventValidation, async (req, res) => newActivity(req, res, Event));

router.get('/', async (req, res) => search(req, res, Event));

router.get('/:id', async (req, res) => searchById(req, res, Event));

router.put('/:id', privateContent(Event), async (req, res) => editEntity(req, res, Event));

router.delete('/:id', privateContent(Event), async (req, res) => erase(req, res, Event));



module.exports = router;