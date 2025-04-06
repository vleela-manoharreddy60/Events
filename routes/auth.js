import express from "express";  
import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken";  
import User from '../models/User.js';  
import Admin from '../models/Admin.js';  

const router = express.Router();  

// User registration route  
router.post('/register', async (req, res) => {  
    const { username, password, regid, branch, year } = req.body;  
    try {  
        if (!username || !password || !regid || !branch || !year) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let user = await User.findOne({ username });  
        if (user) return res.status(400).json({ message: 'User already exists' });  

        user = new User({  
            username,  
            password: await bcrypt.hash(password, 10),  
            regid,  
            branch,  
            year,  
        });  

        await user.save();  

        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });  
        res.json({ message: 'User registered successfully', token });  
    } catch (error) {  
        res.status(500).json({ message: error.message });  
    }  
});  

// User login route  
router.post('/login', async (req, res) => {  
    const { username, password } = req.body;  
    try {  
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        let user = await User.findOne({ username });  
        let role = 'user';  

        if (!user) {  
            user = await Admin.findOne({ username });  
            role = 'admin';  
            if (!user) return res.status(400).json({ message: 'Invalid credentials' });  
        }  

        const isMatch = await bcrypt.compare(password, user.password);  
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });  

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });  
        res.json({ message: 'Login successful', token });  
    } catch (error) {  
        res.status(500).json({ message: error.message });  
    }  
});  

// Password reset route  
router.post('/reset-password', async (req, res) => {  
    const { username, newPassword } = req.body;  
    try {  
        if (!username || !newPassword) {
            return res.status(400).json({ message: 'Username and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        let user = await User.findOne({ username });  
        if (!user) {  
            user = await Admin.findOne({ username });  
            if (!user) return res.status(400).json({ message: 'User not found' });  
        }  

        user.password = await bcrypt.hash(newPassword, 10);  
        await user.save();  
        res.json({ message: 'Password reset successfully' });  
    } catch (error) {  
        res.status(500).json({ message: error.message });  
    }  
});  

export default router;