import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere');

import Notification from './src/models/Notification.js';

const run = async () => {
  try {
    await Notification.insertMany([]);
    console.log('Success with empty array');
  } catch (e) {
    console.log('Error:', e.message);
  }
  process.exit(0);
}
run();
