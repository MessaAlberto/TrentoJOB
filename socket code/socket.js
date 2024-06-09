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



server.listen(3000, () => {
    console.log(`Server listening on port ${3000}...`);
});

