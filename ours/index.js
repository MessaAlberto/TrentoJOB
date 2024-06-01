require('dotenv').config();
const http = require('http');
const socketio = require('socket.io'); // Import socket.io

const app = require('./app');
const databaseConnect = require('./app/database');

const server = http.createServer(app);
const io = socketio(server); // Create a WebSocket server instance

const port = process.env.PORT || 8080;

// Connect to the database and start the server
databaseConnect().then(() => {
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});

// WebSocket logic
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', ({ user1, user2 }) => {
        const room = [user1, user2].sort().join('_');
        socket.join(room);
    });

    socket.on("sendMessage", (message) => {
        const room = [message.senderId, message.receiverId].sort().join("_");
        io.to(room).emit("receiveMessage", message);
    });

    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
