const {verify} = require("jsonwebtoken");
const {Profile} = require("./models/profileModel");

// print method and url
const printf = (req,res,next) => {
    console.log(req.method + ' ' + req.url);
    next();
}

// verify token adding user to the request
const verifySecretToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // guest
    if (!token) return next();

    verify(token, process.env.JWT_SECRET_TOKEN, (err, id) => {
        if (err || !id) return res.status(403).json({message: 'Invalid token'});

        // adding user to the request
        const user = Profile.findById(id);
        if (!user) return res.status(403).json({message: 'User does not exist'});

        req.user = user;
        next()
    });
}



module.exports = {
    printf,
    verifySecretToken,
}