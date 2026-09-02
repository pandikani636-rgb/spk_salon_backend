import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';

mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const owners = await User.find({ role: 'SALON_OWNER' });
  console.log(`Found ${owners.length} salon owners.`);
  
  const newPassword = '877887$Pk';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  for (let owner of owners) {
    owner.password = hashedPassword;
    // We can use save() or updateOne()
    await User.updateOne({ _id: owner._id }, { $set: { password: hashedPassword } });
  }

  console.log('Successfully updated passwords for all salon owners to 877887$Pk.');
  process.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
