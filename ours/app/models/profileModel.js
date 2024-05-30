const mongoose = require('mongoose');

const Profile = mongoose.model('Profile', new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255,
    },
    refresh_token: {
        type: String,
        required: false,
        default: null,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'organisation', 'admin'],
        default: 'user',
    }
}));

const User = Profile.discriminator('User', new mongoose.Schema({
    birthday: {
        type: Date,
        required: false,
        default: '',
    },
    phone: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 15,
        default: '',
    },
    sex: {
        type: String,
        required: false,
        default: '',
    },
    taxIdCode: {
        type: String,
        required: false,
        default: '',
    },
    bio: {
        type: String,
        required: false,
        maxlength: 255,
        default: '',
    },
    subscribedEventsId: {
        type: [String],
        required: false,
    },
    subscribedExpiredEventsId: {
        type: [String],
        required: false,
    },
    // TODO REVIEW
    activeAnnouncementsId: {
        type: [String],
        required: false,
    },
    expiredAnnouncementsId: {
        type: [String],
        required: false,
    }
}));

const Organisation = Profile.discriminator('Organisation', new mongoose.Schema({
    taxIdCode: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    bio: {
        type: String,
        required: false,
        maxlength: 255,
    },
    followersId: {
        type: [String],
        required: false,
    },
    // TODO REVIEW
    activeEventsId: {
        type: [String],
        required: false,
    },
    expiredEventsId: {
        type: [String],
        required: false,
    }
}));

const Admin = Profile.discriminator('Admin', new mongoose.Schema({
    // some joke fields
    beautifulnessLevel: {
        type: Number,
        required: true,
    },
    coolnessLevel: {
        type: Number,
        required: true,
    },
    cm: {
        type: Number,
        required: true,
    }
}));

module.exports = {
    User,
    Organisation,
    Admin,
    Profile // Export the Profile model as well
};
