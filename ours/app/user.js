const express = require('express');
const router = express.Router();
const {User, Organisation, Admin} = require('./models/profileModel'); // get our mongoose model


router.get('/', printf, async (req, res) => {
    try {
        const { username } = req.query;
        let query = {
            role: 'user'
        };

        // Check if the username query parameter exists
        if (username) {
            // Create a regular expression to match partial usernames
            const regex = new RegExp(username, 'i');
            // Add the username regex to the query
            query.username = regex;
        }

        // Query the database with the constructed query object
        const user = await User.find(query);

        // Return JSON response containing the profiles
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving profiles:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:id', printf, async (req, res) => {
    try {
        const profile = await User.findById(req.params.id);
        if (profile) {
            res.status(200).send(profile);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', printf, async (req, res) => {
    let profile = new User(req.body);

    if (profile.username === undefined || profile.username === '' || profile.username === null || typeof profile.username !== 'string') {
        res.status(400).json({ error: 'The field "username" must be a non-empty string' });
    } else {
        const profileResult = await profile.save();
        res.status(201).send(profileResult);
    }

});



function printf(req, res, next) {
    console.log("user.js")
    next()
}

module.exports = router;