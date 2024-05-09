const {Schema, model} = require('mongoose');

const Profile = model('Profile', new Schema({
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
    role: {
        type: String,
        required: true,
        enum: ['user', 'organisation', 'admin'],
        default: 'user',
    }
}));

const User = Profile.discriminator('User', new Schema({
    birthday: {
        type: Date,
        required: false,
    },
    phone: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 15,
    },
    sex: {
        type: String,
        required: false,
    },
    taxIdCode: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
        maxlength: 255,
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

const Organisation = Profile.discriminator('Organisation', new Schema({
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

const Admin = Profile.discriminator('Admin', new Schema({
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
