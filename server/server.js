const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

const Message = require('./models/Message');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => { })
    .catch((err) => console.error("MongoDB Connection Error:", err));

const onlineUsers = new Map();

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.user.username} (${socket.id})`);

    onlineUsers.set(socket.id, {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        socketId: socket.id
    });

    io.emit('online_users', Array.from(onlineUsers.values()));

    socket.on('join_room', async (room) => {
        try {
            socket.join(room);
            console.log(`${socket.user.username} joined room: ${room}`);

            const existingMessages = await Message.find({
                room: room,
                messageType: 'public'
            })
                .sort({ createdAt: 1 })
                .limit(100)
                .lean();

            const formattedMessages = existingMessages.map(msg => ({
                room: msg.room,
                author: msg.author,
                message: msg.message,
                time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: msg.createdAt
            }));

            socket.emit('load_messages', formattedMessages);

            socket.to(room).emit('user_joined', {
                username: socket.user.username,
                message: `${socket.user.username} joined the room`
            });
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const sanitizedMessage = validator.escape(data.message.trim());

            if (!sanitizedMessage || sanitizedMessage.length === 0) {
                return socket.emit('error', { message: 'Message cannot be empty' });
            }

            if (sanitizedMessage.length > 2000) {
                return socket.emit('error', { message: 'Message too long (max 2000 characters)' });
            }

            const messageData = {
                room: data.room,
                author: socket.user.username,
                userId: socket.user._id,
                message: sanitizedMessage,
                messageType: 'public',
                time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            const newMessage = new Message({
                room: messageData.room,
                author: messageData.author,
                userId: messageData.userId,
                message: messageData.message,
                messageType: 'public'
            });

            await newMessage.save();
            io.to(data.room).emit('receive_message', messageData);

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    socket.on('send_private_message', async (data) => {
        try {
            const sanitizedMessage = validator.escape(data.message.trim());

            if (!sanitizedMessage || sanitizedMessage.length === 0) {
                return socket.emit('error', { message: 'Message cannot be empty' });
            }

            const recipientSocket = Array.from(onlineUsers.entries())
                .find(([_, user]) => user.userId === data.recipientId);

            if (!recipientSocket) {
                return socket.emit('error', { message: 'Recipient is not online' });
            }

            const messageData = {
                author: socket.user.username,
                userId: socket.user._id.toString(),
                recipientId: data.recipientId,
                message: sanitizedMessage,
                messageType: 'private',
                time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            const newMessage = new Message({
                room: 'private',
                author: messageData.author,
                userId: socket.user._id,
                message: messageData.message,
                messageType: 'private',
                recipientId: data.recipientId
            });

            await newMessage.save();

            io.to(recipientSocket[0]).emit('receive_private_message', messageData);
            socket.emit('private_message_sent', messageData);

        } catch (error) {
            console.error('Error sending private message:', error);
            socket.emit('error', { message: 'Failed to send private message' });
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('user_typing', {
            username: socket.user.username,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.user.username} (${socket.id})`);
        onlineUsers.delete(socket.id);
        io.emit('online_users', Array.from(onlineUsers.values()));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();

    console.log('\n========================================');
    console.log('   Real-Time Chat Server Started!');
    console.log('========================================\n');

    console.log('Server running on:\n');
    console.log(`   Local:    http://localhost:${PORT}`);

    const networkIPs = [];
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkIPs.push(iface.address);
            }
        });
    });

    if (networkIPs.length > 0) {
        console.log('\nNetwork Access:\n');
        networkIPs.forEach(ip => {
            console.log(`   Network:  http://${ip}:${PORT}`);
        });
        console.log('\nOthers can connect at:');
        networkIPs.forEach(ip => {
            console.log(`   -> http://${ip}:3000`);
        });
    }

    console.log('\nMongoDB Connected');
    console.log('Socket.io ready\n');
    console.log('========================================\n');
});