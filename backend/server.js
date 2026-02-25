import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import TaskRoutes from './routes/taskRoutes.js';
import Task from './models/Task.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://your-frontend-url.vercel.app",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', TaskRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: "Backend is alive" });
});

setInterval(async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await Task.updateMany(
    {
      status: "completed",
      completedAt: { $lte: twentyFourHoursAgo }
    },
    {
      deletedAt: new Date()
    }
  );
}, 60 * 60 * 1000); // Run every hour

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
