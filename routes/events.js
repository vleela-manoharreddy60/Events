import express from 'express';
import Event from '../models/Event.js'; // Assuming you have an Event model

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create event (assuming admin-only, add auth middleware if needed)
router.post('/', async (req, res) => {
  const { name, date, time, coordinatorName, coordinatorContact, poster, whatsappLink } = req.body;
  try {
    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'Name and date are required' });
    }
    const event = new Event({
      name,
      date,
      time,
      coordinatorName,
      coordinatorContact,
      poster,
      whatsappLink,
    });
    await event.save();
    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update event (optional, add if needed)
router.put('/:id', async (req, res) => {
  const { name, date, time, coordinatorName, coordinatorContact, poster, whatsappLink } = req.body;
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, time, coordinatorName, coordinatorContact, poster, whatsappLink },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event updated', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete event (assuming admin-only, add auth middleware if needed)
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
