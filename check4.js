import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/salon_booking');
import User from './src/models/User.js';

const run = async () => {
  const users = await User.find({}, 'email role firstName lastName');
  console.log(users);
  process.exit(0);
}
run();
