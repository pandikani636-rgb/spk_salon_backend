import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Service from './src/models/Service.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const badServices = await Service.find({ duration: { $exists: false } });
  const badServicesNull = await Service.find({ duration: null });
  console.log('Bad services (missing):', badServices.length);
  console.log('Bad services (null):', badServicesNull.length);
  process.exit();
});
