const router = require('express').Router();
const {User} = require('../models/profileModel');
const {register, search, searchById, editEntity} = require("../utils");
const {privateAccess, privateContent} = require("../middleware");
const {registerValidation} = require("../validation");


// register
router.post("/", registerValidation, async (req,res) => register(req, res, User, 'user'));

router.get('/', async (req, res) => search(req, res, User));

router.get('/:id', async (req, res) => searchById(req, res, User));

router.put('/:id', privateContent(User), async (req, res) => editEntity(req, res, User));

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