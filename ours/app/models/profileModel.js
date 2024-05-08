const mongoose = require('mongoose');

const Profile = mongoose.models.Profile || mongoose.model('Profile', new mongoose.Schema({
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

const User = Profile.discriminator('User', new mongoose.Schema({
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
    },
    subscribedEventsId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    },
    subscribedExpiredEventsId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    },
    activeAnnouncementsId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    },
    expiredAnnouncementsId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    }
}));

const Organisation = Profile.discriminator('Organisation', new mongoose.Schema({
    codiceFiscale: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    followersId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    },
    activeEventsId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
    },
    expiredEventsId: {
        type: [mongoose.Schema.Types.ObjectId],
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
