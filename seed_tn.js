import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Need to resolve path to .env and models since we are running from scratch dir
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: 'd:/SPK/apex/backend/.env' });

import User from './src/models/User.js';
import Salon from './src/models/Salon.js';
import Service from './src/models/Service.js';
import StaffProfile from './src/models/StaffProfile.js';
import Appointment from './src/models/Appointment.js';

const tnCities = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Ooty', 'Kanyakumari', 'Kanchipuram', 'Nagercoil', 'Cuddalore', 'Rajapalayam', 'Pudukkottai', 'Hosur', 'Ambur', 'Karaikudi'];
const tnStreets = ['Anna Salai', 'Kamarajar Road', 'Bharathiyar Street', 'Gandhi Road', 'NSK Salai', 'Periyar EVR High Road', 'Mount Road', 'Cross Cut Road', 'Avinashi Road', 'DB Road', 'East Masi Street', 'South Masi Street', 'West Pelier Street', 'Nethaji Road', 'Bypass Road'];
const ownerFirstNames = ['Karthik', 'Senthil', 'Ramesh', 'Suresh', 'Murugan', 'Muthu', 'Rajesh', 'Venkatesh', 'Prakash', 'Dinesh', 'Saravanan', 'Ganesh', 'Arun', 'Vijay', 'Ajith'];
const staffFirstNames = ['Anbu', 'Bala', 'Chandran', 'Deva', 'Elango', 'Gopi', 'Hari', 'Ilayaraja', 'Jeeva', 'Kamal', 'Mani', 'Nanda', 'Prabhu', 'Ram', 'Selvam', 'Thiru', 'Velu', 'Surya', 'Vignesh', 'Aravind', 'Manoj', 'Ashok', 'Siva', 'Pandian'];
const lastNames = ['Kumar', 'Raj', 'Rajan', 'Krishnan', 'Pillai', 'Iyer', 'Chettiar', 'Nadar', 'Gounder', 'Thevar', 'Reddy', 'Naidu'];
const salonPrefixes = ['Chennai', 'Kovai', 'Madurai', 'Royal', 'Grand', 'Elite', 'Sri', 'Golden', 'Classic', 'Modern', 'Star', 'Supreme'];
const salonSuffixes = ['Hair Styling', 'Men\'s Grooming', 'Barbershop', 'Salon & Spa', 'Beauty Care', 'Makeover Studio', 'Hair Studio', 'Cuts & Shaves'];
const categories = ['Haircut', 'Beard', 'Facial', 'Massage', 'Hair Color', 'Spa'];
const servicesData = [
  { name: 'Classic Haircut', category: 'Haircut', price: 150, duration: 30, description: 'Traditional scissors and clipper cut.' },
  { name: 'Fade Haircut', category: 'Haircut', price: 200, duration: 45, description: 'Skin fade with precision styling.' },
  { name: 'Beard Trim & Shape', category: 'Beard', price: 100, duration: 20, description: 'Beard shaping with hot towel.' },
  { name: 'Royal Shave', category: 'Beard', price: 150, duration: 30, description: 'Straight razor shave with pre-shave oil.' },
  { name: 'Gold Facial', category: 'Facial', price: 500, duration: 60, description: 'Premium facial for glowing skin.' },
  { name: 'De-Tan Treatment', category: 'Facial', price: 400, duration: 45, description: 'Removal of sun tan and dead skin.' },
  { name: 'Head Massage', category: 'Massage', price: 200, duration: 30, description: 'Relaxing hot oil head massage.' },
  { name: 'Hair Coloring (Black)', category: 'Hair Color', price: 300, duration: 45, description: 'Ammonia-free black hair color.' }
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/salon_booking');
    console.log('MongoDB connected for seeding...');
    console.log('Clearing existing data...');
    await User.deleteMany({ role: { $in: ['SALON_OWNER', 'CUSTOMER', 'STAFF'] } });
    await Salon.deleteMany();
    await Service.deleteMany();
    await StaffProfile.deleteMany();
    await Appointment.deleteMany();

    const owners = [];
    const password = await bcrypt.hash('password123', 10);
    console.log('Creating 15 Owners...');
    for (let i = 0; i < 15; i++) {
      const owner = await User.create({
        firstName: ownerFirstNames[i] || getRandom(ownerFirstNames),
        lastName: getRandom(lastNames),
        email: `owner${i + 1}@tn.com`,
        password,
        phone: `98${randomInt(10000000, 99999999)}`,
        role: 'SALON_OWNER',
        isVerified: true
      });
      owners.push(owner);
    }

    console.log('Creating Customers...');
    const customers = [];
    for (let i = 0; i < 50; i++) {
      const customer = await User.create({
        firstName: getRandom(staffFirstNames),
        lastName: getRandom(lastNames),
        email: `customer${i + 1}@tn.com`,
        password,
        phone: `99${randomInt(10000000, 99999999)}`,
        role: 'CUSTOMER',
        isVerified: true
      });
      customers.push(customer);
    }

    console.log('Creating Salons for each Owner...');
    for (const owner of owners) {
      const numSalons = randomInt(5, 10);
      for (let s = 0; s < numSalons; s++) {
        const city = getRandom(tnCities);
        const name = `${getRandom(salonPrefixes)} ${getRandom(salonSuffixes)}`;
        const salon = await Salon.create({
          name: name,
          description: `A premium grooming destination located in the heart of ${city}, Tamil Nadu. We offer the best haircuts, beard trims, and facials.`,
          owner: owner._id,
          address: { street: getRandom(tnStreets), city: city, state: 'Tamil Nadu', zipCode: `6${randomInt(0, 4)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}`, country: 'India' },
          phone: `044-${randomInt(2000000, 2999999)}`,
          email: `contact@${name.replace(/ /g, '').toLowerCase()}.com`,
          isActive: true,
          status: 'approved',
          amenities: ['AC', 'Free Wi-Fi', 'Parking', 'TV', 'Music'],
          workingHours: { monday: { open: '09:00', close: '21:00', isClosed: false }, tuesday: { open: '09:00', close: '21:00', isClosed: false }, wednesday: { open: '09:00', close: '21:00', isClosed: false }, thursday: { open: '09:00', close: '21:00', isClosed: false }, friday: { open: '09:00', close: '21:00', isClosed: false }, saturday: { open: '08:00', close: '22:00', isClosed: false }, sunday: { open: '08:00', close: '22:00', isClosed: false } }
        });

        const salonServices = [];
        for (const srvData of servicesData) {
          if (Math.random() > 0.3) {
            const srv = await Service.create({ ...srvData, salon: salon._id, isActive: true });
            salonServices.push(srv);
          }
        }

        const numStaff = randomInt(2, 5);
        const salonStaff = [];
        for (let st = 0; st < numStaff; st++) {
          const staffUser = await User.create({
            firstName: getRandom(staffFirstNames),
            lastName: getRandom(lastNames),
            email: `staff_${salon._id.toString().slice(-6)}_${st}@tn.com`,
            password,
            phone: `97${randomInt(10000000, 99999999)}`,
            role: 'STAFF'
          });
          const profile = await StaffProfile.create({
            user: staffUser._id,
            salon: salon._id,
            bio: `Expert stylist from ${city} with years of experience.`,
            specialization: [getRandom(categories), getRandom(categories)],
            isActive: true
          });
          salonStaff.push(profile);
        }

        const numBookings = randomInt(5, 15);
        for (let b = 0; b < numBookings; b++) {
          const srv = getRandom(salonServices);
          const stf = getRandom(salonStaff);
          const cust = getRandom(customers);
          if (!srv || !stf || !cust) continue;
          const date = new Date();
          date.setDate(date.getDate() + randomInt(0, 7));
          const hour = randomInt(9, 20);
          await Appointment.create({
            salon: salon._id, customer: cust._id, service: srv._id, staff: stf._id,
            date: date.toISOString().split('T')[0], startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour+1).toString().padStart(2, '0')}:00`,
            status: getRandom(['CONFIRMED', 'COMPLETED', 'PENDING']), totalPrice: srv.price, paymentStatus: 'paid'
          });
        }
      }
    }
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};
seedDB();
