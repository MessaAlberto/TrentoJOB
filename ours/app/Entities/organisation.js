const router = require('express').Router();
const {Organisation} = require('../models/profileModel');
const {register, search, searchById} = require("../utils");
const {privateAccess} = require("../middleware");
const {registerValidation} = require("../validation");


// register
router.post("/", registerValidation, async (req,res) => register(req, res, Organisation, 'organisation'));

// modify
router.put('/:id', privateAccess,  (req,res) => {
    // TODO
});

router.get('/', async (req, res) => search(req, res, Organisation));

router.get('/:id', async (req, res) => searchById(req, res, Organisation));

// eliminazione account
router.delete('/:id', privateAccess, async (req, res) => {
    try {
        const profile = await Organisation.findByIdAndDelete(req.params.id);
        if (profile) {
            res.status(200).send(profile);
        } else {
            res.status(404).json({ error: 'Organisation not found' });
        }
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;