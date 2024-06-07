require('dotenv').config();
const http = require('http');
const socketio = require('socket.io'); // Import socket.io
const cron = require('node-cron');
const { Event } = require("./app/models/eventModel");
const { Announcement } = require("./app/models/announcementModel");

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

// Check and update expired notices
async function updateExpired() {
	try {
		const now = new Date();
		now.setHours(now.getHours() + 2);

		var response = await Event.updateMany({ date: { $lte: now }, expired: false }, { expired: true });
		console.log('Updated expired events:', response);

		response = await Announcement.updateMany({ date_begin: { $lte: now }, expired: false }, { expired: true });
		console.log('Updated expired announcements:', response);

	} catch (err) {
		console.error('Error updating expired events:', err);
	}
}


updateExpired();

// Run function every hour
cron.schedule('0 * * * *', async () => {
	console.log('Updating expired announcements and events...');
	await updateExpired();
	console.log('Expired announcements and events updated');
});