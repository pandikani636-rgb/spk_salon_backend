import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  const StaffProfile = mongoose.model('StaffProfile', new mongoose.Schema({}, {strict: false}));
  
  const u = await User.find({ avatar: { $ne: 'default.jpg' } }).limit(5);
  console.log('Users:', u.map(u => ({ id: u._id, gender: u.gender, avatar: u.avatar })));
  
  const s = await StaffProfile.find().limit(5);
  console.log('Staff:', s.map(s => ({ id: s._id, image: s.image, gender: s.gender })));
  
  process.exit();
});
