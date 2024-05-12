const router = require('express').Router();
const {User} = require('../models/profileModel');
const {register, search, searchById} = require("../utils");
const {privateAccess} = require("../middleware");
const {registerValidation} = require("../validation");


// register
router.post("/", registerValidation, async (req,res) => register(req, res, User, 'user'));

// modify
router.put('/:id', privateAccess, async (req,res) => {
    // TODO
});

router.get('/', async (req, res) => search(req, res, User));

router.get('/:id', async (req, res) => searchById(req, res, User));

// delete profile
router.delete('/:id', privateAccess, async (req, res) => {
    try {
        const profile = await User.findByIdAndDelete(req.params.id);
        if (profile) {
            res.status(200).json(profile);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
});



module.exports = router;