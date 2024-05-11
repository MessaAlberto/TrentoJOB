const {Profile} = require("./models/profileModel");
const {hash} = require("bcrypt");
const mail = require("./nodeMail");
const {sign} = require('jsonwebtoken');

// utils
const register = async (req, res, type, role) => {
    // check if email already exists
    const emailExists = await Profile.findOne({email: req.body.email})
    if (emailExists)
        return res.status(400).json({message: 'Email already exists'});

    // hashing
    req.body.password = await hash(req.body.password, 10);
    let user = new type(req.body);
    user.role = role;

    // save
    try {
        const savedUser = await user.save();
        res.status(201).json({user: savedUser._id});

        // send email confirmation mail
        const email_token = sign({_id: savedUser._id}, process.env.JWT_SECRET_MAIL, {expiresIn: process.env.JWT_EXPIRE_MAIL});
        const url = `http://localhost:${process.env.PORT}/auth/${email_token}`;
        const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
        mail(req.body.email, "Email confirmation", html);
    } catch {
        res.status(400).json({message: 'registration failed'});
    }
};

const new_activity = async (req, res, type) => {
    if (!req.user)
        return res.status(403);

    try {
        let activity = new type(req.body);
        activity.owner = {
            username: req.user.username,
            id: req.user._id
        };
        const activityResult = await activity.save();
        res.status(201).json({event: activityResult._id});
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
};



module.exports = {
    register,
    new_activity,
};