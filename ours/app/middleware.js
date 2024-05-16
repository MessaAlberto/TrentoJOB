const {verify} = require("jsonwebtoken");
const {Profile} = require("./models/profileModel");

// print method and url
const printf = (req, res, next) => {
    console.log(req.method + ' ' + req.url);
    next();
}

// verify token adding user to the request
const verifySecretToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // guest
    if (!token) return next();

    verify(token, process.env.JWT_SECRET_TOKEN, async (err, id) => {
        if (err || !id) return res.status(403).json({message: 'Invalid token'});

        // adding user to the request
        const user = await Profile.findById(id);
        if (!user) return res.status(403).json({message: 'User does not exist'});

        req.user = user;
        next()
    });
}

// get access only if authorized
const privateAccess = (req, res, next) => {
    if (  !req.user                         // not guest
        && req.user.role !== 'admin'        // admin
        && req.user._id !== req.params.id)  // self
        return res.status(403);
    next();
}

const privateContent = (model) => async (req, res, next) => {
    try {
        // Check the ownerId of the entity
        const entity = await model.findById(req.params.id);

        // Check if the entity exists and if the user is the owner
        if (!entity || !entity.owner.equals(req.user._id))
            return res.status(403).json({ message: 'Unauthorized access' });
        next();
        
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const checkRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role)
        return res.status(403).json({ message: 'Unauthorized access' });
    next();
}

module.exports = {
    printf,
    verifySecretToken,
    privateAccess,
    privateContent,
    checkRole,
}