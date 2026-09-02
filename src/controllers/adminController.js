import User from '../models/User.js';
import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import StaffProfile from '../models/StaffProfile.js';

import Notification from '../models/Notification.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSalons = await Salon.countDocuments({ status: 'approved' });
    const pendingSalons = await Salon.countDocuments({ status: 'pending' });
    
    // Monthly Appointments
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const appointmentsThisMonth = await Appointment.countDocuments({
      date: { $gte: startOfMonth }
    });

    // Revenue: 10% of confirmed bookings
    const confirmedAppointments = await Appointment.find({
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    });
    const revenue = confirmedAppointments.reduce((acc, curr) => acc + ((curr.totalPrice || 0) * 0.1), 0);

    const pendingApprovalsList = await Salon.find({ status: 'pending' }).populate('owner', 'firstName lastName email');

    res.status(200).json({
      success: true,
      data: { totalUsers, activeSalons, pendingSalons, revenue, appointmentsThisMonth, pendingApprovalsList }
    });
  } catch (error) {
    next(error);
  }
};

export const approveSalon = async (req, res, next) => {
  try {
    const salon = await Salon.findByIdAndUpdate(req.params.id, { isActive: true, status: 'approved' }, { new: true });
    
    await Notification.create({
      recipient: salon.owner,
      title: 'Salon Approved',
      message: `Congratulations! Your salon '${salon.name}' has been approved and is now visible to customers.`,
      type: 'SALON_APPROVAL',
      relatedId: salon._id
    });

    res.status(200).json({ success: true, data: salon });
  } catch (error) {
    next(error);
  }
};

export const rejectSalon = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const salon = await Salon.findByIdAndUpdate(req.params.id, { isActive: false, status: 'rejected', rejectionReason: reason }, { new: true });
    
    await Notification.create({
      recipient: salon.owner,
      title: 'Salon Rejected',
      message: `Your salon registration for '${salon.name}' was rejected. Reason: ${reason || 'Incomplete information.'}`,
      type: 'SALON_REJECTION',
      relatedId: salon._id
    });

    res.status(200).json({ success: true, message: 'Salon rejected' });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // If it's a salon owner, also fetch their salons
    let salons = [];
    if (user.role === 'SALON_OWNER') {
      salons = await Salon.find({ owner: user._id });
    }
    
    res.status(200).json({ success: true, data: { user, salons } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const getAllSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find().populate('owner', 'firstName lastName email');
    res.status(200).json({ success: true, data: salons });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('customer', 'firstName lastName email')
      .populate('salon', 'name')
      .populate('service', 'name price')
      .populate('staff', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate('salon', 'name');
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await StaffProfile.find().populate('user', 'firstName lastName email').populate('salon', 'name').populate('services', 'name');
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, salon, specialization } = req.body;
    
    // Create user first
    const user = await User.create({
      firstName, lastName, email, password, role: 'STAFF'
    });

    // Create staff profile
    const staffProfile = await StaffProfile.create({
      user: user._id,
      salon,
      specialization: specialization ? specialization.split(',').map(s => s.trim()) : []
    });

    res.status(201).json({ success: true, data: staffProfile });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { firstName, lastName, salon, specialization, isActive } = req.body;
    
    const staff = await StaffProfile.findById(req.params.id).populate('user');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    if (firstName || lastName) {
      await User.findByIdAndUpdate(staff.user._id, {
        firstName: firstName || staff.user.firstName,
        lastName: lastName || staff.user.lastName
      });
    }

    if (salon) staff.salon = salon;
    if (specialization) staff.specialization = specialization.split(',').map(s => s.trim());
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await StaffProfile.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    
    await User.findByIdAndDelete(staff.user);
    await StaffProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName')
      .populate('salon', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
