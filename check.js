import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere');

import User from './src/models/User.js';
import Salon from './src/models/Salon.js';
import Notification from './src/models/Notification.js';

const run = async () => {
  const admin = await User.findOne({ role: 'ADMIN' });
  console.log('Admin:', admin ? admin.email : 'No admin found');
  
  const pendingSalons = await Salon.find({ status: 'pending' });
  console.log('Pending Salons:', pendingSalons.length);

  const adminNotifs = await Notification.find({ recipient: admin._id });
  console.log('Admin Notifications:', adminNotifs.length);
  process.exit(0);
}
run();
