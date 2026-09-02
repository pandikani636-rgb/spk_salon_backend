import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking');
import Notification from './src/models/Notification.js';

const run = async () => {
  const notifs = await Notification.find({ type: 'SALON_REGISTRATION' });
  console.log(notifs.map(n => ({ id: n._id, recipient: n.recipient, msg: n.message })));
  process.exit(0);
}
run();
