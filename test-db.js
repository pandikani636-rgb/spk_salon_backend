import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/salon_booking');
const db = mongoose.connection;
db.once('open', async () => {
  const salons = await db.collection('salons').find({}).toArray();
  console.log(JSON.stringify(salons.map(s => ({name: s.name, bannerImage: s.bannerImage}))));
  process.exit(0);
});
