const router = require("express").Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Aggiunto per JWT
const { Profile } = require('../models/profileModel');
require('dotenv').config();

router.post('/', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Profile.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Genera il token JWT per il reset della password utilizzando l'ID dell'utente
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_MAIL, { expiresIn: process.env.JWT_EXPIRE_MAIL });

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 2 * 24 * 60 * 60 * 1000; // Token valido per 2 giorni
        await user.save();

        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAIL_SECRET,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.MAIL,
            subject: 'Password Reset',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click the following link to reset your password:</p>
                <a href="http://${req.headers.host}/password?token=${token}">Reset Password</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </body>
            </html>`
        };        

        console.log('Received reset request for email:', email);

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'A reset link has been sent to your email address' });
    } catch (err) {
        res.status(500).json({ message: 'Error in sending email', error: err });
    }
});

module.exports = router;
