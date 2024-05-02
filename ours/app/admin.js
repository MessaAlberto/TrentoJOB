const express = require('express');
const router = express.Router();
const Event = require('./models/eventModel'); // get our mongoose model

const eventRouter = require('./adminEvents.js');

router.get('', printf, async (req, res) => {
    res.redirect('/admin.html');

});


router.use('/events', printf, eventRouter);


function printf(req, res, next) {
    console.log("admin.js")
    next()
}

module.exports = router;