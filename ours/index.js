require('dotenv').config();
const http = require('http');
const app = require('./app');
const databaseConnect = require('./app/database');
const socketHandler = require('./app/socket');

const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 8080;

// Initialize Socket.IO
socketHandler(io);

// Connect to the database and start the server
databaseConnect().then(() => {
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});
