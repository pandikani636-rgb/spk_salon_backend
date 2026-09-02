import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, {strict: false}));
  const count = await Notification.countDocuments({ type: 'NEW_BOOKING' });
  console.log('NEW_BOOKING notifications:', count);
  process.exit();
});
