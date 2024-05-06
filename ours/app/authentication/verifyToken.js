const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

// EXAMPLE USE
// const router = require("express").Router();
// const verify = require("./verifyToken");
//
// router.get("/", verify, (req, res) => {
//     // handler
// });