import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  coordinatorName: { type: String, required: true },
  coordinatorContact: { type: String, required: true },
  poster: { type: String, required: true },
  phonepeScreenshot: { type: String, required: true }, // Fixed typo
  whatsappLink: { type: String, required: true }, // Fixed capitalization
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', eventSchema);