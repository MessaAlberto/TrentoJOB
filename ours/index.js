require('dotenv').config();

const express = require('express');
const app = express();
//const app = require('./app/app.js');
const mongoose = require('mongoose');
console.log(process.env.MONGODBURI);

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;
app.locals.db = mongoose.connect(process.env.MONGODBURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});