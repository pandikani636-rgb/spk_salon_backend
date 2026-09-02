import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['SALON_REGISTRATION', 'SALON_APPROVAL', 'SALON_REJECTION', 'SALON_DELETION', 'NEW_BOOKING', 'SYSTEM'],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Could be salon or appointment ID
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
