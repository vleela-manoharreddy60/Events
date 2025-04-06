import { config } from 'dotenv';
config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import paymentRoutes from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.RENDER_FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend', 'src', 'pages')));

// API Routes
console.log('Loading routes...');
console.log('Auth Routes:', typeof authRoutes === 'function' ? 'Valid' : 'Invalid', authRoutes);
console.log('Event Routes:', typeof eventRoutes === 'function' ? 'Valid' : 'Invalid', eventRoutes);
console.log('Payment Routes:', typeof paymentRoutes === 'function' ? 'Valid' : 'Invalid', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  console.log(`404 API route: ${req.path}`);
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Serve frontend for client-side routing with debug
app.get('*', (req, res) => {
  console.log(`Serving frontend for path: ${req.path}`);
  res.sendFile(path.join(__dirname, 'frontend', 'src', 'pages', 'landing.html'), (err) => {
    if (err) {
      console.error('File serve error:', err.message);
      res.status(404).send('Page not found');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
