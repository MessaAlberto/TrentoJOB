// Allows to use environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const Path = require("path");
const mongoose = require('mongoose');
const { printf, verifySecretToken } = require("./app/middleware");

// Initialize Express app and HTTP server
const app = express();
const server = require('http').createServer(app);

// Set up Socket.IO with CORS
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS requests
 */
app.use(cors());

/**
 * Serve front-end static files
 */
const FRONTEND = process.env.FRONTEND || Path.join(__dirname, '..', 'node_modules', 'easylibvue', 'dist');
app.use('/TrentoJOB/', express.static(FRONTEND));

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder

// Define your middleware function
app.use(printf, verifySecretToken);

/**
 * Resource routing
 */
const authURL = require('./app/authentication/auth');

const adminURL = require('./app/Entities/admin');
const userURL = require('./app/Entities/user.js');
const organisationURL = require('./app/Entities/organisation.js');

const eventURL = require('./app/Entities/event');
const announcementURL = require('./app/Entities/announcement.js');

const chatURL = require('./app/Entities/chat.js');

app.use('/auth', authURL);

app.use('/admin', adminURL);
app.use('/user', userURL);
app.use('/organisation', organisationURL);

app.use('/event', eventURL);
app.use('/announcement', announcementURL);

app.use('/chat', chatURL);

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", ({ user1, user2 }) => {
        const room = [user1, user2].sort().join("_");
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("sendMessage", (message) => {
        const room = [message.senderId, message.receiverId].sort().join("_");
        io.to(room).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

/* Default 404 handler */
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

/**
 * Configure mongoose
 */
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

mongoose.connect(process.env.MONGODBURI, clientOptions).then(() => {
    console.log("Connected to Database");

    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});
