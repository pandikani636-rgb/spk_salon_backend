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
  const staffUsers = await User.find({ firstName: 'Chandran' });
  for (let u of staffUsers) {
    const profile = await StaffProfile.findOne({ user: u._id });
    if (!profile) continue;
    
    const salon = await Salon.findById(profile.salon);
    if (!salon) continue;

    console.log(`\nFound Chandran in Salon: ${salon.name} (ID: ${salon._id})`);
    console.log('Salon working hours:', salon.workingHours);
    console.log('Chandran working hours:', profile.workingHours);
  }
  process.exit();
});
