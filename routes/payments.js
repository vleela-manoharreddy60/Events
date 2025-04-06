import express from 'express';
import Payment from '../models/Payment.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Relative to route file
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('screenshot'), async (req, res) => {
  const { eventName, paymentMethod } = req.body;

  try {
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all payments (optional, add if needed)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ username: req.user.username });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  });
});

export default router;
