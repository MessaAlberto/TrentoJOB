const Path = require('path');
const express = require('express');
const cors = require('cors')
const {printf, verifySecretToken} = require('./middleware')

const app = express();
/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS requests
 */
app.use(cors())


/**
 * Serve front-end static files
 */
const FRONTEND = process.env.FRONTEND || Path.join( __dirname, '..', 'node_modules', 'easylibvue', 'dist' );
app.use('/TrentoJOB/', express.static( FRONTEND ));

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder


// Define your middleware function
app.use(printf, verifySecretToken);


/**
 * Resource routing
 */
const authURL = require('./auth');

const adminURL = require('./admin');
const userURL = require('./user.js');
const organisationURL = require('./organisation.js');

const eventURL = require('./event');
const announcementURL = require('./announcement.js');

app.use('/auth', authURL);

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
