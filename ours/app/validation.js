const Joi = require('joi');
const {Profile} = require("./models/profileModel");
const {hash} = require("bcrypt");
const mail = require("./nodeMail");

const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(128).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        taxIdCode: Joi.string().alphanum(),
    });
    return schema.validate(data);
}

// register
const register = async (req, res, type) => {
    // validate data
    const validation = registerValidation(req.body);
    if (validation.error)
        return res.status(400).json({message: 'Email or password not valid'});

    // check if email already exists
    const emailExists = await Profile.findOne({email: req.body.email})
    if (emailExists)
        return res.status(400).json({message: 'Email already exists'});

    // hashing
    req.body.password = await hash(req.body.password, 10);
    let user = new type(req.body);
    user.role = 'type'.toLowerCase();

    // save
    try {
        const savedUser = await user.save();
        res.status(201).json({user: savedUser._id});
        // send email confirmation mail
        const email_token = sign({_id: savedUser._id}, process.env.JWT_SECRET_MAIL, {expiresIn: process.env.JWT_EXPIRE_MAIL});
        const url = `http://localhost:${process.env.PORT}/auth/confirmation/${email_token}`;
        const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
        mail(req.body.email, "Email confirmation", html);
    } catch {
        res.status(400).json({message: 'registration failed'});
    }
};



module.exports = register;