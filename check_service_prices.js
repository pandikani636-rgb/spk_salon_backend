import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const Service = mongoose.model('Service', new mongoose.Schema({}, {strict: false}));
  const bad = await Service.find({ price: null });
  const bad2 = await Service.find({ price: { $exists: false } });
  console.log('Services with null price:', bad.length);
  console.log('Services with no price:', bad2.length);
  process.exit();
});
