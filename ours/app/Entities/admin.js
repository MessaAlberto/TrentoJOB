const router = require('express').Router();
const {privateAccess} = require("../middleware");
const {registerValidation} = require("../validation");
const {Profile, Admin} = require("../models/profileModel");
const {hash} = require("bcrypt");
const {editEntity, searchById, search, erase} = require("../utils");

// create
router.post('/', registerValidation, privateAccess, async (req,res) => {
    try {
        // check if email already exists
        const emailExists = await Profile.findOne({email: req.body.email})
        if (emailExists)
            return res.status(400).json({message: 'Email already exists'});

        // hashing
        req.body.password = await hash(req.body.password, 10);
        let user = new Admin(req.body);
        user.role = 'admin';
        user.confirmed = true;

        // save
        const savedUser = await user.save();
        res.status(201).json({user: savedUser._id});

    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

// modify
router.put('/:id', privateAccess, async (req,res) => editEntity(req, res, Admin));

router.get('/', privateAccess,  async (req, res) => search(req, res, Admin));

router.get('/:id', privateAccess,  async (req, res) => searchById(req, res, Admin));

router.delete('/:id', privateAccess, async (req,res) => erase(req, res, Admin));



module.exports = router;