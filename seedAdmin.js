import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salon_booking');
    
    // Delete existing if any
    await User.deleteOne({ email: 'admin@gmail.com' });

    const admin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@gmail.com',
      password: 'admmin@123',
      phone: '1234567890',
      role: 'ADMIN'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
