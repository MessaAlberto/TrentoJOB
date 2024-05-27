const crypto = require('crypto');
const { Profile } = require('../models/profileModel');
const router = require("express").Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Funzione di validazione della password
const passwordSchema = Joi.string().min(8).max(255).required();

// Servire la pagina di reset della password
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../static/reset_password.html'));
});

router.patch('/:token', async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    try {
        // Validazione della password
        const { error } = passwordSchema.validate(password);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        console.log('Token:', token);
        console.log('Password:', password);

        const decoded = jwt.verify(token, process.env.JWT_SECRET_MAIL);
        const userId = decoded.userId; // Ottieni l'ID dell'utente dal token decodificato

        console.log('User ID:', userId);//664601c12104e3abf6b3d50c

        const user = await Profile.findByIdAndUpdate(userId, {
            password: password,
            $unset: {
                resetPasswordToken: '',
                resetPasswordExpires: ''
            }
        }, { new: true });

        if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.', error });
    }
});


module.exports = router;
