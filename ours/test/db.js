const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connect() {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}

async function disconnect() {
    await mongoose.disconnect();
    await mongoServer.stop();
}

module.exports = { connect, disconnect };
