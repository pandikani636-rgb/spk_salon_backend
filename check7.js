import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://localhost:27017/salon_booking');
import Salon from './src/models/Salon.js';

const run = async () => {
  const salons = await Salon.find({ status: 'pending' }).populate('owner', 'firstName lastName email');
  console.log('Pending Salons with Owner:', salons.length);
  process.exit(0);
}
run();
