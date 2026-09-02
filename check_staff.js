import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Salon from './src/models/Salon.js';
import StaffProfile from './src/models/StaffProfile.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const staff = await StaffProfile.findOne();
  console.log('STAFF HOURS:', JSON.stringify(staff.workingHours, null, 2));
  process.exit();
});
