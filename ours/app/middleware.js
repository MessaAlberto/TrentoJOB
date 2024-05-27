const {verify} = require("jsonwebtoken");
const {Profile} = require("./models/profileModel");
const {Chat} = require("./models/chatModel");

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
    // if logged in and admin or owner --> access
    if (req.user && (req.user.role === 'admin' || req.user._id === req.params.id))
        next();
    else
        res.status(403).json({ message: 'Unauthorized access' });
}

const blockGuest = (model) => async (req, res, next) => {
    try {
        const entity = await model.findById(req.params.id);

        if (!entity)
            return res.status(404).json({ message: 'Entity not found' });

        if (req.user)
            next();
        else
            res.status(403).json({ message: 'Not now' });

    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const privateChat = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat || (chat.memberA.id !== req.user._id.toString() && chat.memberB.id !== req.user._id.toString()))
            return res.status(403).json({ message: 'Unauthorized access' });
        next();

    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
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
    blockGuest,
    privateChat,
    checkRole,
}