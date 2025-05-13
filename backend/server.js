const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io available to our routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wishlist-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-wishlist', (wishlistId) => {
    console.log('User joined wishlist:', wishlistId);
    socket.join(wishlistId);
  });

  socket.on('leave-wishlist', (wishlistId) => {
    console.log('User left wishlist:', wishlistId);
    socket.leave(wishlistId);
  });

  socket.on('wishlist-updated', (wishlistId) => {
    console.log('Wishlist updated:', wishlistId);
    socket.to(wishlistId).emit('refresh-wishlist');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 