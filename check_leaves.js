import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Leave from './src/models/Leave.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const leaves = await Leave.find();
  console.log('Leaves:', JSON.stringify(leaves, null, 2));
  process.exit();
});
