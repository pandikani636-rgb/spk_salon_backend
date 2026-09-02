import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Salon from './src/models/Salon.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const salons = await Salon.find();
  const badSalons = salons.filter(s => !s.workingHours || !s.workingHours.monday || !s.workingHours.monday.open);
  console.log('Salons with bad workingHours:', badSalons.length);
  process.exit();
});
