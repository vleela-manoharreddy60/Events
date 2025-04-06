import { config } from 'dotenv';
config();

import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import paymentRoutes from './routes/payments.js';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Serve static files from the frontend directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'frontend', 'src', 'pages')));

// Serve static assets (e.g., videos, images, CSS, JS) from the components directory
app.use('/components', express.static(path.join(__dirname, 'frontend', 'src', 'components')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);

// Dummy admin credentials (replace with a secure method in production)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // Updated password
};

// Admin Login Route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        return res.json({ redirect: 'admin.html' }); // Redirect to admin.html on success
    } else {
        return res.status(401).json({ message: 'Invalid username or password' }); // Unauthorized
    }
});

// Route to serve the landing page as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'src', 'pages', 'landing.html'));
});

// Route to serve the admin.html page
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'src', 'pages', 'admin.html'));
});

// Fallback route for unmatched routes
app.get('*', (req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();