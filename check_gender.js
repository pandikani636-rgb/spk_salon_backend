import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  
  const hasGender = await User.countDocuments({ gender: { $exists: true } });
  console.log('Users with gender:', hasGender);
  
  process.exit();
});
