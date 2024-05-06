const mongoose = require('mongoose');

const Profile = mongoose.models.Profile || mongoose.model('Profile', new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
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
    },
    sex: {
        type: String,
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
    beautiful: { // fixed typo: 'beatiful' to 'beautiful'
        type: Boolean,
        required: false,
    }
}));

module.exports = {
    User,
    Organisation,
    Admin,
    Profile // Export the Profile model as well
};
