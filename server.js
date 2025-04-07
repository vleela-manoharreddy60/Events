import { config } from 'dotenv';
config();

import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import paymentRoutes from './routes/payments.js';
import cors from 'cors';
import path from 'path';

const app = express();

// Serve static files from the 'frontend/src/pages' directory
const __dirname = path.resolve(); // Get the directory name of the current module
app.use(express.static(path.join(__dirname, 'frontend', 'src', 'pages')));

// Handle the root route to serve landing.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'src', 'pages', 'landing.html'));
});

app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);

startServer();
