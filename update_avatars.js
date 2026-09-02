import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';
import StaffProfile from './src/models/StaffProfile.js';

const updateAvatars = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/salon_booking');
    console.log('MongoDB connected.');

    const users = await User.find();
    let count = 0;
    
    for (let user of users) {
      // randomly assign Male/Female if not assigned
      const isMale = Math.random() > 0.5;
      user.gender = isMale ? 'Male' : 'Female';
      
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      if (user.gender === 'Male') {
        user.avatar = `${baseUrl}/uploads/male_avatar.svg`;
      } else {
        user.avatar = `${baseUrl}/uploads/female_avatar.svg`;
      }
      
      await user.save();
      count++;
    }
    
    console.log(`Updated ${count} users with gender and avatars.`);
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAvatars();
