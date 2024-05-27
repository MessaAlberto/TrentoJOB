const router = require("express").Router();
const mail = require('../nodeMail');
const {sign, verify} = require('jsonwebtoken');
const { Profile } = require('../models/profileModel');
const {resetPasswordValidation} = require("../validation");
const path = require('path');
const {hash} = require("bcrypt");

router.post('/', async (req, res) => {
    try {
        const user = await Profile.findOne({email: req.body.email});
        if (!user)
            return res.status(404).json({message: 'User not found'});

        // send email
        const email_token = sign({userId: user._id}, process.env.JWT_SECRET_MAIL, {expiresIn: process.env.JWT_EXPIRE_MAIL});
        const html =
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click the following link to reset your password:</p>
                <a href="http://${req.headers.host}/password?token=${email_token}">Reset Password</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </body>
            </html>`;
        mail(user.email, 'Password Reset', html);

        console.log('Received reset request for email:', user.email);

        res.status(200).json({message: 'A reset link has been sent to your email address'});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

// Servire la pagina di reset della password
router.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../../static/reset_password.html'));
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.patch('/:token', resetPasswordValidation, async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    try {
        const decoded = verify(token, process.env.JWT_SECRET_MAIL);
        const userId = decoded.userId; // Ottieni l'ID dell'utente dal token decodificato

        password = await hash(password, 10);

        const user = await Profile.findByIdAndUpdate(userId,
            {password: password},
            {new: true});

        if (!user)
            return res.status(400).json({message: 'Bad Request'});

        res.status(200).json({message: 'Password has been successfully reset.'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});





module.exports = router;
