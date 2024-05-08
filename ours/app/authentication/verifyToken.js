const {verify} = require("jsonwebtoken");
const {Profile} = require("../models/profileModel");

module.exports = verifySecretToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    verify(token, process.env.JWT_SECRET, (err, id) => {
        if (err || !id) return res.status(403).json({message: 'Invalid token'});

        // adding user to the request
        const user = Profile.findById(id);
        if (!user) return res.status(403).json({message: 'User does not exist'});
        req.user = user;
        next()
    });
}

// EXAMPLE USE
// const router = require("express").Router();
// const verify = require("./verifyToken");
//
// router.get("/", verify, (req, res) => {
//     // handler
// });