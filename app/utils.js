const {Profile, User, Organisation, Admin} = require("./models/profileModel");
const {Event} = require("./models/eventModel");
const {Announcement} = require("./models/announcementModel");
const {hash} = require("bcrypt");
const mail = require("./nodeMail");
const {emailConfirm} = require("./mailBody");
const {sign} = require('jsonwebtoken');


const register = async (req, res, model, role) => {
    try {
        // check if email already exists
        const emailExists = await Profile.findOne({ email: req.body.email })
        if (emailExists)
            return res.status(400).json({ message: 'Email already exists' });

        // hashing
        req.body.password = await hash(req.body.password, 10);
        let user = new model(req.body);
        user.role = role;
        // save
        const savedUser = await user.save();
        res.status(201).json({ user: savedUser._id });

        // send email confirmation mail
        const email_token = sign({ _id: savedUser._id }, process.env.JWT_SECRET_MAIL, { expiresIn: process.env.JWT_EXPIRE_MAIL });
        const url = `http://trentojob.onrender.com/auth/${email_token}`;
        const html = emailConfirm(savedUser.username, url);
        mail(req.body.email, "Email confirmation", html);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
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
            id: req.user._id,
            role: req.user.role
        };

        // save in db
        const activityResult = await activity.save();
        res.status(201).json({ activity_id: activityResult._id });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const search = async (req, res, model) => {
    const fields = '-password -refresh_token -confirmed -verified -chats -taxIdCode -comments -subscribedEventsId -subscribedExpiredEventsId -activeAnnouncementsId -expiredAnnouncementsId -followersId -activeEventsId -expiredEventsId';
    try {
        let query = { ...req.query };
        let sort = {};

        if (query.input) {
            const searchTerm = new RegExp(query.input, 'i');
            delete query.input;

            if (model === Event || model === Announcement)
                query.title = searchTerm;
            else if (model === User || model === Organisation)
                query.username = searchTerm;
        }

        if (query.score)
            query.score = { $gte: Number(query.score) };

        if (model === Event || model === Announcement) {
            if (query.maxNumberParticipants)
                query.maxNumberParticipants = { $lte: Number(query.maxNumberParticipants) };

            if (model === Event) {
                if (query.date)
                    query.date = { $gte: query.date };
            } else {
                if (query.daterange) {
                    const [startDateStr, endDateStr] = query.daterange.split(' - ');

                    // Function to convert 'DD/MM/YYYY' to 'MM/DD/YYYY'
                    const convertDateFormat = (dateStr) => {
                        const [day, month, year] = dateStr.split('/');
                        return `${month}/${day}/${year}`;
                    };

                    const startDate = new Date(convertDateFormat(startDateStr));
                    const endDate = new Date(convertDateFormat(endDateStr));
                    delete query.daterange;

                    if (startDate) {
                        query.date_begin = { $gte: startDate };
                    }

                    if (endDate) {
                        query.date_stop = { $lte: endDate };
                    }
                }

            }
        }

        if (model === User) {
            query.confirmed = true;

            if (query.minAge || query.maxAge) {
                query.birthday = {};

                if (query.minAge) {
                    query.birthday.$lte = new Date(new Date().getFullYear() - Number(query.minAge), 0, 1);
                    delete query.minAge;
                }

                if (query.maxAge) {
                    query.birthday.$gte = new Date(new Date().getFullYear() - Number(query.maxAge), 0, 1);
                    delete query.maxAge;
                }
            }
        } else if (model === Organisation) {
            query.confirmed = true;
            query.verified = true;
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
            delete query.sortBy;
        }

        // Query the database with the constructed query object, sort criteria, and selected fields
        const output = await model.find(query).sort(sort).select(fields);

        res.status(200).json(output);
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const searchById = async (req, res, model) => {
    let fields = '-password -refresh_token -confirmed -verified -comments';
    try {
        if (!req.user // not guest
            || (req.user.role !== 'admin' // admin
                && req.user._id !== req.params.id))  // self
            fields += ' -chats';
            
        const output = await model.findById(req.params.id).select(fields);

        if (output) {
            if (!fields.includes(' -chats') && output.chats) {
                // Sort chats by last message date
                output.chats = output.chats.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
            }
            res.status(200).json(output);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const editEntity = async (req, res, model) => {
    try {
        const entity = await model.findById(req.params.id);
        if (!entity)
            return res.status(404).json({ message: 'Not found' });

        if (model === Event || model === Announcement) {
            if (req.body.action === 'join') {
                if (entity.owner.id === req.user._id)
                    return res.status(400).json({ message: 'Owner cannot join' });

                if (entity.participants.some(participant => participant.id === req.user._id))
                    return res.status(400).json({ message: 'Already joined' });

                entity.participants.push({ username: req.user.username, id: req.user._id, role: req.user.role });
                await entity.save();
                return res.status(200).json({ message: 'Joined' });
            } else if (req.body.action === 'leave') {
                if (!entity.participants.some(participant => participant.id === req.user._id))
                    return res.status(400).json({ message: 'Not joined' });

                entity.participants = entity.participants.filter(participant => participant.id !== req.user._id);
                await entity.save();
                return res.status(200).json({ message: 'Left' });
            } else {
                // For other modifications, ensure only authorized users can edit
                if (req.user.role !== 'admin' && req.user._id !== entity.owner.id)
                    return res.status(403).json({ message: 'Unauthorized access' });

                for (const key in req.body) {
                    entity[key] = req.body[key];
                }

                await entity.save();
                return res.status(200).json({ message: 'Updated' });
            }

        } else if (model === User || model === Organisation || model === Admin) {
            for (const key in req.body) {
                if (!['role', 'password', 'refresh_token'].includes(key)) {
                    entity[key] = req.body[key];
                }
            }

            await entity.save();
            return res.status(200).json({ message: 'Updated', entity: entity });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error', error: error });
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
        res.status(500).json({ message: 'Internal Server Error' });
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