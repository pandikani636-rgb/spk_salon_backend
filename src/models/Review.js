import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // One review per appointment
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

// Prevent multiple reviews from same user for same appointment
reviewSchema.index({ appointment: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
