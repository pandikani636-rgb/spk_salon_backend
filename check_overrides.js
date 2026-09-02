import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Service from './src/models/Service.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const services = await Service.find();
  const withTimeSlots = services.filter(s => s.timeSlots && s.timeSlots.length > 0);
  const withOverrides = services.filter(s => s.dateOverrides && s.dateOverrides.length > 0);
  console.log('Services with timeSlots:', withTimeSlots.length);
  console.log('Services with overrides:', withOverrides.length);
  process.exit();
});
