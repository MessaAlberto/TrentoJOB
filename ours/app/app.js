const Path = require('path');
const express = require('express');
const cors = require('cors');
const { printf, verifySecretToken } = require('./middleware');

const app = express();

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS requests
 */
app.use(cors());

/**
 * Serve front-end static files
 */
const FRONTEND = process.env.FRONTEND || Path.join(__dirname, '..', 'node_modules', 'easylibvue', 'dist');
app.use('/TrentoJOB/', express.static(FRONTEND));

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder

// Define your middleware function
app.use(printf, verifySecretToken);

/**
 * Resource routing
 */
const authURL = require('./authentication/auth');
const passwordURL = require('./authentication/password.js'); 
const forgotPasswordURL = require('./authentication/authPassword.js');
const adminURL = require('./Entities/admin');
const userURL = require('./Entities/user.js');
const organisationURL = require('./Entities/organisation.js');
const eventURL = require('./Entities/event');
const announcementURL = require('./Entities/announcement.js');
 

app.use('/auth', authURL);
app.use('/password', passwordURL); 
app.use('/reset', forgotPasswordURL); 
app.use('/admin', adminURL);
app.use('/user', userURL);
app.use('/organisation', organisationURL);
app.use('/event', eventURL);
app.use('/announcement', announcementURL);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app;
