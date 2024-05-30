const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
    const validation = schema.validate(req.body);
    if (validation.error) {
        return res.status(401).json({ message: 'Validation error', error: validation.error });
    }
    next();
};

const schemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(128).required(),
        email: Joi.string().required().email(),
        password: Joi.string().alphanum().min(6).max(128).required(),
        taxIdCode: Joi.string().alphanum().optional(),
    }),

    login: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    }),

    announcement: Joi.object({
        title: Joi.string().min(3).max(128).required(),
        description: Joi.string().min(6).max(1024).required(),
        date_begin: Joi.date().required(),
        date_stop: Joi.date().required(),
        location: Joi.string().required(),
        maxNumberParticipants: Joi.number().required(),
    }),

    event: Joi.object({
        title: Joi.string().min(3).max(128).required(),
        description: Joi.string().min(6).max(1024).required(),
        date: Joi.date().required(),
        location: Joi.string().required(),
        maxNumberParticipants: Joi.number().required(),
    }),

    resetEmail: Joi.object({
        email: Joi.string().required().email(),
    }),

    resetPassword: Joi.object({
        email: Joi.string().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    }),

    comment: Joi.object({
        text: Joi.string().min(1).max(1024).required(),
    }),
};



module.exports = {
    registerValidation: validateRequest(schemas.register),
    loginValidation: validateRequest(schemas.login),
    announcementValidation: validateRequest(schemas.announcement),
    eventValidation: validateRequest(schemas.event),
    resetEmailValidation: validateRequest(schemas.resetEmail),
    resetPasswordValidation: validateRequest(schemas.resetPassword),
    commentValidation: validateRequest(schemas.comment),
};