import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere');
import User from './src/models/User.js';

const run = async () => {
  const users = await User.find({}, 'email role firstName lastName');
  console.log(users);
  process.exit(0);
}
run();
