import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Appointment from './src/models/Appointment.js';
import User from './src/models/User.js';
import StaffProfile from './src/models/StaffProfile.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const staffUsers = await User.find({ firstName: 'Chandran' });
  if (staffUsers.length === 0) {
    console.log('No staff named Chandran found');
    process.exit();
  }

  for (let user of staffUsers) {
    const profile = await StaffProfile.findOne({ user: user._id });
    if (!profile) continue;

    const apps = await Appointment.find({ staff: profile._id });
    console.log(`Chandran (Staff ID: ${profile._id}) has ${apps.length} appointments`);
    if (apps.length > 0) {
      console.log('Appointments:', apps.map(a => `${a.date.toISOString().split('T')[0]} ${a.startTime}-${a.endTime}`));
    }
  }

  process.exit();
});
