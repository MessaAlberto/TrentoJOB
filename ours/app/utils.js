const {Profile, User, Organisation} = require("./models/profileModel");
const {Event} = require("./models/eventModel");
const {Announcement} = require("./models/announcementModel");
const {hash} = require("bcrypt");
const mail = require("./nodeMail");
const {sign} = require('jsonwebtoken');


const register = async (req, res, model, role) => {
    try {
        // check if email already exists
        const emailExists = await Profile.findOne({email: req.body.email})
        if (emailExists)
            return res.status(400).json({message: 'Email already exists'});

        // hashing
        req.body.password = await hash(req.body.password, 10);
        let user = new model(req.body);
        user.role = role;

        // save
        const savedUser = await user.save();
        res.status(201).json({user: savedUser._id});

        // send email confirmation mail
        const email_token = sign({_id: savedUser._id}, process.env.JWT_SECRET_MAIL, {expiresIn: process.env.JWT_EXPIRE_MAIL});
        const url = `http://localhost:${process.env.PORT}/auth/${email_token}`;
        const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
        mail(req.body.email, "Email confirmation", html);
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const newActivity = async (req, res, model) => {
    try {
        // no guest
        if (!req.user)
            return res.status(403);

        // new object
        let activity = new model(req.body);
        activity.owner = {
            username: req.user.username,
            id: req.user._id
        };

        // save in db
        const activityResult = await activity.save();
        res.status(201).json({activity_id: activityResult._id});
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const fields = '-confirmed -password -refresh_token';

const search = async (req, res, model) => {
    try {
        const { input } = req.query;
        let query = {};

        if (model === Event || model === Announcement) {
            // Check if the title query parameter exists
            if (input)
                query.title = new RegExp(input, 'i');
        } else if (model === User || model === Organisation) {
            // Check if the username query parameter exists
            if (input)
                query.username = new RegExp(input, 'i');
        }
        // Query the database with the constructed query object
        const output = await model.find(query).select(fields);

        // Return JSON response containing the announcements
        res.status(200).json(output);
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
}

const searchById = async (req, res, model) => {
    try {
        const output = await model.findById(req.params.id).select(fields);
        if (output) {
            res.status(200).json(output);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
}

const editEntity = async (req, res, model) => {
    try {
        const updatedentity = await model.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json(updatedentity);
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const erase = async (req, res, model) => {
    try {
        const output = await model.findByIdAndDelete(req.params.id);
        if (output) {
            res.status(200).json(output);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch {
        res.status(500).json({message: 'Internal Server Error'});
    }
}



module.exports = {
    register,
    newActivity,
    search,
    searchById,
    editEntity,
    erase,
};