const Joi = require('joi');

const registerValidation = (req,res,next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(128).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        taxIdCode: Joi.string().alphanum(),
    });
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

const loginValidation = (req,res,next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().alphanum().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

const announcementValidation = (req,res,next) => {
    const schema = Joi.object({
        title: Joi.string().alphanum().min(3).max(128).required(),
        description: Joi.string().alphanum().min(6).max(1024).required(),
        date_begin: Joi.date().required(),
        date_stop: Joi.date().required(),
        location: Joi.string().alphanum().required(),
        maxNumberParticipants: Joi.number().required(),
    })
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

const eventValidation = (req,res,next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(128).required(),
        description: Joi.string().min(6).max(1024).required(),
        date: Joi.date().required(),
        location: Joi.string().required(),
        maxNumberParticipants: Joi.number().required(),
    })
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

const resetEmailValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
    })
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

const resetPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().alphanum().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    const validation = schema.validate(req.body);
    if (validation.error)
        return res.status(401).json({message: 'validation error', error: validation.error});
    next();
}

module.exports = {
    registerValidation,
    loginValidation,
    announcementValidation,
    eventValidation,
    resetEmailValidation,
    resetPasswordValidation,
};