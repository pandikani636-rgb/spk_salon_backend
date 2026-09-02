import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 5,
    },
    timeSlots: [{
      type: String // e.g. ["09:00", "10:00", "14:00"]
    }],
    dateOverrides: [{
      date: String, // e.g. "2026-08-28"
      slots: [{ type: String }] // e.g. ["10:00", "12:00"]
    }],
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
