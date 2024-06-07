const express = require('express');
const cors = require('cors');
const Path = require('path');
const { printf, verifySecretToken } = require('./app/middleware');

const app = express();

// Configure Express.js parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS requests
app.use(cors());

// Serve front-end static files
const FRONTEND = process.env.FRONTEND || Path.join(__dirname, '..', 'node_modules', 'easylibvue', 'dist');
app.use('/TrentoJOB/', express.static(FRONTEND));
app.use('/', express.static('static')); // expose also this folder

// Define your middleware function
app.use(printf);
app.use(verifySecretToken);

// Resource routing
const authURL = require('./app/authentication/auth');
const passwordURL = require('./app/authentication/password');
const adminURL = require('./app/Entities/admin');
const userURL = require('./app/Entities/user');
const organisationURL = require('./app/Entities/organisation');
const eventURL = require('./app/Entities/event');
const announcementURL = require('./app/Entities/announcement');
const chatURL = require('./app/Entities/chat');
const commentURL = require('./app/Entities/comment');

app.use('/auth', authURL);
app.use('/password', passwordURL);
app.use('/admin', adminURL);
app.use('/user', userURL);
app.use('/organisation', organisationURL);
app.use('/event', eventURL);
app.use('/announcement', announcementURL);
app.use('/chat', chatURL);
app.use('/comment', commentURL);

// Default 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app;