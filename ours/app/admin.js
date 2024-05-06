const express = require('express');
const router = express.Router();

router.get('', printf, async (req, res) => {
    res.redirect('/admin.html');

});

function printf(req, res, next) {
    console.log("admin.js")
    next()
}

module.exports = router;