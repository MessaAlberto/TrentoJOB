const router = require('express').Router();
const {Organisation} = require('../models/profileModel');
const {register, search, searchById, editEntity, erase} = require("../utils");
const {privateAccess, blockGuest} = require("../middleware");
const {registerValidation} = require("../validation");


// register
router.post("/", registerValidation, async (req,res) => register(req, res, Organisation, 'organisation'));

router.get('/', async (req, res) => search(req, res, Organisation));

router.get('/:id', async (req, res) => searchById(req, res, Organisation));

router.put('/:id', privateAccess, async (req, res) => editEntity(req, res, Organisation));

router.delete('/:id', privateAccess, async (req, res) => erase(req, res, Organisation));



module.exports = router;