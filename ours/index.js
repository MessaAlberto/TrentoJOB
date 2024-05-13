// Allows to use environment variables
require('dotenv').config();

const app = require('./app/app.js');
const mongoose = require('mongoose');

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;
const clientOptions = {serverApi: { version: '1', strict: true, deprecationErrors: true }};
app.locals.db = mongoose.connect(process.env.MONGODBURI, clientOptions)
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});