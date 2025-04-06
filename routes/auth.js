import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

// User registration route
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('regid').notEmpty().withMessage('Registration ID is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('year').isNumeric().withMessage('Year must be a number'),
  ],
  async (req, res) => {
    handleValidationErrors(req, res);

    const { username, password, regid, branch, year } = req.body;
    try {
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

      const token = jwt.sign(
        { id: user._id, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// User login route
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    handleValidationErrors(req, res);

    const { username, password } = req.body;
    try {
      let user = await User.findOne({ username });
      let role = 'user';

      if (!user) {
        user = await Admin.findOne({ username });
        role = 'admin';
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user._id, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ message: 'Login successful', token, role });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Password reset route
router.post(
  '/reset-password',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    handleValidationErrors(req, res);

    const { username, newPassword } = req.body;
    try {
      let user = await User.findOne({ username });
      if (!user) {
        user = await Admin.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
