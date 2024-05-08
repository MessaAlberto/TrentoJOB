const Joi = require('joi');

const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(128).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });
    return schema.validate(data);
}

const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().alphanum().min(6).max(128).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schema.validate(data);
}

module.exports = {
    registerValidation,
    loginValidation,
};