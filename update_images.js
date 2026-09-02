import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Salon from './src/models/Salon.js';
import Service from './src/models/Service.js';
import User from './src/models/User.js';
import Banner from './src/models/Banner.js';

const updateImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/salon_booking');
    console.log('MongoDB connected. Updating images...');

    const salons = await Salon.find();
    console.log(`Found ${salons.length} salons.`);
    for (let i = 0; i < salons.length; i++) {
      const salon = salons[i];
      salon.logo = `https://loremflickr.com/200/200/logo,salon?lock=${i}`;
      salon.coverImage = `https://loremflickr.com/800/400/salon,interior?lock=${i}`;
      salon.bannerImage = `https://loremflickr.com/1200/400/salon,spa?lock=${i}`;
      salon.gallery = [
        `https://loremflickr.com/600/400/haircut,style?lock=${i}1`,
        `https://loremflickr.com/600/400/haircut,style?lock=${i}2`,
        `https://loremflickr.com/600/400/haircut,style?lock=${i}3`,
        `https://loremflickr.com/600/400/haircut,style?lock=${i}4`
      ];
      await salon.save();
    }

    const services = await Service.find();
    console.log(`Found ${services.length} services.`);
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      service.image = `https://loremflickr.com/400/300/beauty,spa?lock=${i}`;
      await service.save();
    }

    const users = await User.find();
    console.log(`Found ${users.length} users.`);
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user.avatar || user.avatar === 'default.jpg' || user.avatar === '') {
        user.avatar = `https://loremflickr.com/200/200/face,portrait?lock=${i}`;
        await user.save();
      }
    }

    const banners = await Banner.find();
    console.log(`Found ${banners.length} banners.`);
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      if (!banner.image) {
        banner.image = `https://loremflickr.com/1200/400/salon,offer?lock=${i}`;
        await banner.save();
      }
    }

    console.log('Image update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
};

updateImages();
