import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Salon from './src/models/Salon.js';
import StaffProfile from './src/models/StaffProfile.js';
import User from './src/models/User.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const salonId = '6a970a1d642c28b13fbd8071';
  const salon = await Salon.findById(salonId);
  console.log('Salon working hours:', salon.workingHours);
  
  const staffs = await StaffProfile.find({ salon: salonId }).populate('user');
  console.log('Staff count:', staffs.length);
  for (let s of staffs) {
    console.log(`Staff: ${s.user.firstName} (ID: ${s._id})`);
    console.log(`Working hours:`, s.workingHours);
  }
  process.exit();
});
