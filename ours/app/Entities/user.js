const router = require('express').Router();
const {User} = require('../models/profileModel');
const register = require("../validation");

// register
router.post("/", (req,res) => register(req, res, User));

// modify
router.put('/', (req,res) => {
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

router.delete('/:id', async (req, res) => {
    // not guest, self
    if (!req.user && req.user.role !== 'admin' && req.user._id !== req.params.id)
        return res.status(403);

    try {
        const profile = await User.findByIdAndDelete(req.params.id);
        if (profile) {
            res.status(200).send(profile);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;