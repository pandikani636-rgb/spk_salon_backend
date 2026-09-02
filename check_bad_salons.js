import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking').then(async () => {
  const Salon = mongoose.model('Salon', new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId }, {strict: false}));
  const badSalons = await Salon.find({ owner: null });
  console.log('Salons with null owner:', badSalons.length);
  process.exit();
});
