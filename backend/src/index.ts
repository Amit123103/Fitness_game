import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { startDailyEmailCron } from './cron/dailyEmails.js';

dotenv.config();

// Start the daily email cron job
startDailyEmailCron();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Rise of the Warrior API is running...');
});

// Socket.io logic for real-time multiplayer
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create_duel', (data) => {
    const roomId = `duel-${socket.id}`;
    socket.join(roomId);
    socket.emit('duel_created', { roomId });
  });

  socket.on('join_duel', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size < 2) {
      socket.join(roomId);
      io.to(roomId).emit('duel_started', { roomId });
    } else {
      socket.emit('error', { message: 'Room is full or doesn\'t exist' });
    }
  });

  socket.on('sync_fitness', (data) => {
    // Broadcast player's fitness progress to the opponent in the room
    const { roomId, reps, health } = data;
    socket.to(roomId).emit('opponent_sync', { reps, health });
  });

  socket.on('attack_player', (data) => {
    const { roomId, damage } = data;
    socket.to(roomId).emit('received_damage', { damage });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
