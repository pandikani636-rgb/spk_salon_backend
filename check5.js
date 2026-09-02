import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/salon_booking');
import Notification from './src/models/Notification.js';

const run = async () => {
  const notifs = await Notification.find();
  console.log('Total Notifications:', notifs.length);
  console.log(notifs.slice(0, 5));
  process.exit(0);
}
run();
