// Route to handle requests for /verification
const router = require('express').Router();
const {Profile} = require("../models/profileModel");
const { Verification } = require('../models/verificationModel');
const mail = require("../nodeMail");
const { emailVerified, emailVerificationRejected } = require('../mailBody');

router.get('/', async (req, res) => {
    // only admin can verify
    if (req.user.role !== 'admin')
        return res.status(401).json({message: "Unauthorized"});
    try {
        const verification = await Verification.find();
        res.status(200).json(verification);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

router.delete('/:id', async (req, res) => {
    // Only admin can verify
    if (req.user.role !== 'admin')
        return res.status(401).json({message: "Unauthorized"});

    try {
        // search the verification
        const verification = await Verification.findById(req.params.id);
        if (!verification)
            return res.status(404).json({message: 'Verification not found'});

        var action = req.body.action;
        if (action === 'accept') {
            const user = await Profile.findById(verification.organisation.id);
            if (!user)
                return res.status(404).json({message: 'User not found'});

            user.verified = true;
            await user.save();

            // Remove verification from the database
            await verification.deleteOne();

            // send email
            const url = `http://localhost:${process.env.PORT}/logIn.html`;
            const html = emailVerified(user.username, url);
            mail(user.email, 'Account Verification', html);

            return res.status(200).json({message: 'User verified and verification removed'});
        } else if (action === 'reject') {
            const user = await Profile.findByIdAndDelete(verification.organisation.id);
            if (!user)
                return res.status(404).json({message: 'User not found'});

            // Remove verification from the database
            await verification.deleteOne();

            // send email
            const html = emailVerificationRejected(user.username);
            mail(user.email, 'Account Verification', html);

            return res.status(200).json({message: 'User rejected and verification removed'});
        }

        return res.status(400).json({message: 'Invalid action'});
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
});


module.exports = router;