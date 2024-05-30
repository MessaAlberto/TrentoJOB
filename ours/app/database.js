const mongoose = require('mongoose');

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const databaseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI, clientOptions);
        console.log("Connected to Database");
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

module.exports = databaseConnect;
