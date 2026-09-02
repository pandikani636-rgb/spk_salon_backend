import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    pincode: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Location', locationSchema);
