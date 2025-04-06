import express from 'express';
import Payment from '../models/Payment.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('screenshot'), async (req, res) => {
  const { eventName, paymentMethod } = req.body;

  try {
    if (!req.user || !req.user.username) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    if (!eventName || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'eventName and paymentMethod are required' });
    }

    const finalScreenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payment = new Payment({
      eventName,
      username: req.user.username,
      regid: req.user.regid,
      paymentMethod,
      screenshotUrl: finalScreenshotUrl,
    });

    await payment.save();
    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const payments = await Payment.find({ username: req.user.username });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
