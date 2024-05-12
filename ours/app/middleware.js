const {verify} = require("jsonwebtoken");
const {Profile, User, Organisation, Organisation} = require("./models/profileModel");
const {Event} = require("./models/eventModel");
const {Announcement} = require("./models/announcementModel");

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

const privateContent = (Model) => async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') { // Check if user is admin
            if (Model === User || Model === Organisation) { 
                // Check id of the user
                if (req.user._id !== req.params.id) {
                    return res.status(403).json({ message: 'Unauthorized access' });
                }
            } else if (Model === Event || Model === Announcement) { 
                // Check the ownerId of the entity
                const entity = await Model.findById(req.params.id);
                
                // Check if the entity exists and if the user is the owner
                if (!entity || !entity.owner.equals(req.user._id)) {
                    return res.status(403).json({ message: 'Unauthorized access' });
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in privateContent middleware:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Middleware per ottenere un evento per ID
async function getEvent(req, res, next) {
    let event;
    try {
        event = await Event.findById(req.params.id);
        if (event == null) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.event = event;
    next();
}

module.exports = {
    printf,
    verifySecretToken,
    privateAccess,
    privateContent,
    getEvent
}