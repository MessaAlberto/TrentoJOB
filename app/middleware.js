const {verify} = require("jsonwebtoken");
const {Profile} = require("./models/profileModel");
const {Chat} = require("./models/chatModel");
const {Event} = require("./models/eventModel");

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

        // convert object to string
        const userObj = user.toObject();
        userObj._id = userObj._id.toString();
        userObj.chats = userObj.chats.map(chat => {
            chat.id = chat.id.toString();
            chat._id = chat._id.toString();
            chat.other.id = chat.other.id.toString();
            return chat;
        });

        req.user = userObj;
        next();
    });
}

// get access only if authorized
const privateAccess = (req, res, next) => {
    // if logged in and admin or owner --> access
    if (req.user && (req.user.role === 'admin' || String(req.user._id) === String(req.params.id)))
        return next();
    res.status(403).json({ message: 'Unauthorized access' });
}

const blockGuest = async (req, res, next) => {
    if (!req.user)
        return res.status(403).json({ message: 'Unauthorized access' });
    next();
};

const privateChat = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat || (chat.memberA.id.toString() !== req.user._id.toString() && chat.memberB.id.toString() !== req.user._id.toString()))
            return res.status(403).json({ message: 'Unauthorized access' });
        next();

    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const privateComment = async (req, res, next) => {
    try {
        const event = await Event.findById(req.body.eventId);
        if (!event)
            return res.status(400).json({message: 'Bad Request'});

        if (req.user.role === 'admin' || event.comments.some(elem => String(elem.user.id) === String(req.user._id)))
            return next();

        return res.status(403).json({ message: 'Unauthorized comment' });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

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
    privateComment,
}