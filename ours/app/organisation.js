const express = require('express');
const router = express.Router();
const {User, Organisation, Admin} = require('./models/profileModel'); // get our mongoose model


router.get('/', printf, async (req, res) => {
    try {
        const { username } = req.query;
        let query = {
            role: 'organisation' // Only search for profiles with role 'organizzazione'
        };

        // Check if the username query parameter exists
        if (username) {
            // Create a regular expression to match partial usernames
            const regex = new RegExp(username, 'i');
            // Add the username regex to the query
            query.username = regex;
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

router.get('/:id', printf, async (req, res) => {
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

router.post('/', printf, async (req, res) => {
    let profile = new Organisation(req.body);

    if (profile.username === undefined || profile.username === '' || profile.username === null || typeof profile.username !== 'string') {
        res.status(400).json({ error: 'The field "username" must be a non-empty string' });
    } else {
        const profileResult = await profile.save();
        res.status(201).send(profileResult);
    }

});


router.delete('/:id', printf, async (req, res) => {
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



function printf(req, res, next) {
    console.log("organisation.js")
    next()
}

module.exports = router;