import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/salon_booking');
import Salon from './src/models/Salon.js';

const run = async () => {
  const salons = await Salon.find({}, 'name status isActive');
  console.log(salons);
  process.exit(0);
}
run();
