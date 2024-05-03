const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.headers['auth-token'];
    if (!token) return res.status(401).send('Access denied');

    try {
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).send(verifyToken);
        next();
    } catch (err) {
        res.status(401).send('Access denied');
    }
}

// EXAMPLE USE
// const router = require("express").Router();
// const verify = require("./verifyToken");
//
// router.get("/", verify, (req, res) => {
//     // handler
// });