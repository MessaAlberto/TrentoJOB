const router = require('express').Router();
const {User} = require('../models/profileModel');
const {register, search, searchById, editEntity, erase} = require("../utils");
const {privateAccess, blockGuest} = require("../middleware");
const {registerValidation} = require("../validation");


// register
router.post("/", registerValidation, async (req,res) => register(req, res, User, 'user'));

router.get('/', async (req, res) => search(req, res, User));

router.get('/:id', async (req, res) => searchById(req, res, User));

router.put('/:id', blockGuest, async (req, res) => editEntity(req, res, User));

router.delete('/:id', privateAccess, async (req, res) => erase(req, res, User));



module.exports = router;