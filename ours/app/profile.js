// Router to handle user requests for /users
const express = require('express');
const router = express.Router();

const userURL = require('./user.js');
const organisationURL = require('./organisation.js');

router.use('/users', userURL);
router.use('/organisations', organisationURL);


module.exports = router;