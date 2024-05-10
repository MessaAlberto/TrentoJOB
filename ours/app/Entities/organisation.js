const router = require('express').Router();
const {Organisation} = require('../models/profileModel');
const register = require("../validation");
const {privateAccess} = require("../middleware");


// register
router.post("/", (req,res) => register(req, res, Organisation, 'organisation'));

// modify
router.put('/:id', privateAccess,  (req,res) => {
    // TODO
});

router.get('/', async (req, res) => {
    try {
        const { username } = req.query;
        let query = {
            role: 'organisation' // Only search for profiles with role 'organizzazione'
        };

        // Check if the username query parameter exists
        if (username) {
            // Create a regular expression to match partial usernames
            query.username = new RegExp(username, 'i');
        }

        // Query the database with the constructed query object
        const profiles = await Organisation.find(query);

        // Return JSON response containing the profiles
        res.status(200).json(profiles);
    } catch (error) {
        console.error('Error retrieving profiles:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const profile = await Organisation.findById(req.params.id);
        if (profile) {
            res.status(200).send(profile);
        } else {
            res.status(404).json({ error: 'Organisation not found' });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

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