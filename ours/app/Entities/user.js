const router = require('express').Router();
const {User} = require('../models/profileModel');
const register = require("../validation");
const {privateAccess} = require("../middleware");


// register
router.post("/", (req,res) => register(req, res, User, 'user'));

// modify
router.put('/:id', privateAccess, async (req,res) => {
    // TODO
});

router.get('/', async (req, res) => {
    try {
        const { username } = req.query;
        let query = {
            role: 'user'
        };

        // Check if the username query parameter exists
        if (username) {
            // Create a regular expression to match partial usernames
            query.username = new RegExp(username, 'i');
        }

        // Query the database with the constructed query object
        const user = await User.find(query);

        // Return JSON response containing the profiles
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving profiles:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const profile = await User.findById(req.params.id);
        if (profile) {
            res.status(200).json(profile);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// eliminazione account
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