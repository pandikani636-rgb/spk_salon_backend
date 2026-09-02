import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

mongoose.connect('mongodb://localhost:27017/salon_booking');
import User from './src/models/User.js';

const run = async () => {
  const owner = await User.findOne({ role: 'SALON_OWNER' });
  const token = jwt.sign({ id: owner._id }, 'secret123', { expiresIn: '30d' });
  console.log(token);
  process.exit(0);
}
run();
