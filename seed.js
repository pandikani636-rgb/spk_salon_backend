import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { Role } from './src/models/User.js';
import Salon from './src/models/Salon.js';
import Service from './src/models/Service.js';
import StaffProfile from './src/models/StaffProfile.js';
import Appointment from './src/models/Appointment.js';
import { connectDB } from './src/config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Salon.deleteMany();
    await Service.deleteMany();
    await StaffProfile.deleteMany();
    await Appointment.deleteMany();

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lumiere.com',
      password: 'password123',
      role: Role.ADMIN,
    });

    const ownerUser = await User.create({
      firstName: 'Salon',
      lastName: 'Owner',
      email: 'owner@lumiere.com',
      password: 'password123',
      role: Role.SALON_OWNER,
    });

    const customerUser = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: Role.CUSTOMER,
    });

    const staffUser = await User.create({
      firstName: 'John',
      lastName: 'Stylist',
      email: 'john@lumiere.com',
      password: 'password123',
      role: Role.STAFF,
    });

    const salon = await Salon.create({
      name: 'Lumiere Hair Studio',
      description: 'Premium hair styling and coloring.',
      owner: ownerUser._id,
      address: {
        street: '123 Beauty Ln',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      phone: '555-0100',
      email: 'hello@lumierehairstudio.com',
      workingHours: {
        monday: { open: '09:00', close: '18:00', isClosed: false },
        tuesday: { open: '09:00', close: '18:00', isClosed: false },
        wednesday: { open: '09:00', close: '18:00', isClosed: false },
        thursday: { open: '09:00', close: '20:00', isClosed: false },
        friday: { open: '09:00', close: '20:00', isClosed: false },
        saturday: { open: '10:00', close: '16:00', isClosed: false },
        sunday: { open: '', close: '', isClosed: true },
      },
    });

    const service1 = await Service.create({
      salon: salon._id,
      name: "Women's Haircut",
      description: 'Wash, cut, and blowdry',
      category: 'Hair',
      price: 65,
      duration: 60,
    });

    const service2 = await Service.create({
      salon: salon._id,
      name: 'Color & Highlights',
      description: 'Full head highlights and styling',
      category: 'Color',
      price: 150,
      duration: 120,
    });

    const staffProfile = await StaffProfile.create({
      user: staffUser._id,
      salon: salon._id,
      bio: 'Expert colorist with 10 years of experience.',
      specialization: ['Coloring', 'Balayage'],
      services: [service1._id, service2._id],
      workingHours: salon.workingHours,
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroy data
} else {
  importData();
}
