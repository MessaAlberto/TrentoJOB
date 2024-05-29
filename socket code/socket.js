require("dotenv").config();

const cors = require("cors");
const path = require('path');
const express = require('express');
const chats = require("./routes/chats");

const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use("/chats", chats);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./frontend", "index.html"));
});

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

server.listen(3000, () => {
    console.log(`Server listening on port ${3000}...`);
});

