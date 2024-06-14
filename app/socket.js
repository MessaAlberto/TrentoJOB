module.exports = (io) => {
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
};
