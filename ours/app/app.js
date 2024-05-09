const Path = require('path');

const express = require('express');
const app = express();
const cors = require('cors')


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



app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})



/**
 * Resource routing
 */
const authURL = require('./authentication/auth');

const adminURL = require('./admin');
const userURL = require('./user.js');
const organisationURL = require('./organisation.js');

const eventURL = require('./event');
const announcementURL = require('./announcement.js');

app.use('/auth', authURL);

app.use('/users', userURL);
app.use('/organisations', organisationURL);
app.use('/admin', adminURL);

app.use('/events', eventURL);
app.use('/announcements', announcementURL);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;
