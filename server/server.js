const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" } // Your React App URL
});

const mongoose = require('mongoose');
const Message = require('./models/Message'); // Import the schema
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Update the Socket logic
io.on('connection', (socket) => {
    
    // Logic to fetch old messages when a user joins a room
    socket.on("join_room", async (room) => {
        socket.join(room);
        const existingMessages = await Message.find({ room: room });
        socket.emit("load_messages", existingMessages); 
    });

    socket.on("send_message", async (data) => {
        // Save message to Database
        const newMessage = new Message(data);
        await newMessage.save();
        
        // Broadcast to others in the room
        socket.to(data.room).emit("receive_message", data);
    });
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        // Broadcast the message to everyone in the room
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on('disconnect', () => console.log("User Disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));