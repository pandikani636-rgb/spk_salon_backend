import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';
import StaffProfile from '../models/StaffProfile.js';
import Service from '../models/Service.js';

import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const getOwnerSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find({ owner: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: salons });
  } catch (error) {
    next(error);
  }
};

export const createSalon = async (req, res, next) => {
  try {
    const salonData = {
      ...req.body,
      owner: req.user._id,
      isActive: false,
      status: 'pending'
    };
    const salon = await Salon.create(salonData);

    // Create Notification for Admins
    const admins = await User.find({ role: 'ADMIN' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      title: 'New Salon Registration',
      message: `${req.user.firstName} registered a new salon: ${salon.name}. Awaiting approval.`,
      type: 'SALON_REGISTRATION',
      relatedId: salon._id
    }));
    
    // Also notify the owner
    notifications.push({
      recipient: req.user._id,
      title: 'Salon Registration Submitted',
      message: `Your registration for '${salon.name}' has been submitted and is pending Admin approval.`,
      type: 'SYSTEM',
      relatedId: salon._id
    });
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: salon });
  } catch (error) {
    next(error);
  }
};

export const getOwnerStats = async (req, res, next) => {
  try {
    const salonId = req.query.salonId;
    const query = { owner: req.user._id };
    if (salonId) query._id = salonId;

    const salons = await Salon.find(query);
    if (!salons || salons.length === 0) {
      return res.status(404).json({ success: false, message: 'Salon not found for this owner' });
    }
    
    const salonIds = salons.map(s => s._id);

    // Fetch all appointments for the found salons, sorted newest first
    const appointments = await Appointment.find({ salon: { $in: salonIds } })
      .populate('customer', 'firstName lastName')
      .populate('service')
      .populate('staff')
      .sort({ createdAt: -1 });
      
    const staffCount = await StaffProfile.countDocuments({ salon: { $in: salonIds } });
    const serviceCount = await Service.countDocuments({ salon: { $in: salonIds } });

    const totalBookings = appointments.length;
    // Note: status check is case sensitive. Ensure it checks for 'COMPLETED' or 'completed'
    const revenue = appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').reduce((acc, curr) => acc + (curr.totalPrice || curr.price || 0), 0);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = appointments.filter(a => {
      const d = new Date(a.date);
      return d >= today && d < tomorrow;
    });

    res.status(200).json({
      success: true,
      data: {
        salons, // Include all salons found
        totalBookings,
        revenue,
        staffCount,
        serviceCount,
        todaysCount: todaysAppointments.length,
        appointments: appointments // Do not limit to 10 so the Manage Appointments page sees all
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('salon');
    
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.salon.owner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    appointment.status = status;
    await appointment.save();
    
    // Notify the user about the appointment status update
    let messageText = `Your appointment at ${appointment.salon.name} is now ${status}.`;
    if (status === 'CONFIRMED') {
      messageText = 'Your Booking Has Been Confirmed.';
    }

    await Notification.create({
      recipient: appointment.customer,
      title: `Appointment ${status}`,
      message: messageText,
      type: 'SYSTEM',
      relatedId: appointment._id
    });
    
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
export const updateSalon = async (req, res, next) => {
  try {
    // Prevent owner from bypassing admin approval
    const updateData = { ...req.body };
    delete updateData.status;
    delete updateData.isActive;

    const salon = await Salon.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updateData, { new: true });
    if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
    res.status(200).json({ success: true, data: salon });
  } catch (error) { next(error); }
};

export const getOwnerServices = async (req, res, next) => {
  try {
    const salons = await Salon.find({ owner: req.user._id });
    const salonIds = salons.map(s => s._id);
    const services = await Service.find({ salon: { $in: salonIds } }).populate('salon');
    res.status(200).json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const createOwnerService = async (req, res, next) => {
  try {
    const salon = await Salon.findOne({ _id: req.body.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized for this salon' });
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) { next(error); }
};

export const updateOwnerService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if(!service) return res.status(404).json({ success: false, message: 'Not found' });
    const salon = await Salon.findOne({ _id: service.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized' });
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedService });
  } catch (error) { next(error); }
};

export const deleteOwnerService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if(!service) return res.status(404).json({ success: false, message: 'Not found' });
    const salon = await Salon.findOne({ _id: service.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

export const getOwnerStaff = async (req, res, next) => {
  try {
    const salons = await Salon.find({ owner: req.user._id });
    const salonIds = salons.map(s => s._id);
    const staff = await StaffProfile.find({ salon: { $in: salonIds } }).populate('user').populate('salon');
    res.status(200).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

export const createOwnerStaff = async (req, res, next) => {
  try {
    const salon = await Salon.findOne({ _id: req.body.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    // Check if user exists by email, if not create basic user
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: 'password123', // default
        role: 'STAFF',
        phone: req.body.phone,
        avatar: req.body.image
      });
    } else {
        if(req.body.image) {
            user.avatar = req.body.image;
            await user.save();
        }
    }
    
    const staff = await StaffProfile.create({
      user: user._id,
      salon: salon._id,
      bio: req.body.bio,
      specialization: req.body.specialization ? req.body.specialization.split(',') : [],
      isActive: true
    });
    res.status(201).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

export const deleteOwnerStaff = async (req, res, next) => {
  try {
    const staff = await StaffProfile.findById(req.params.id);
    if(!staff) return res.status(404).json({ success: false, message: 'Not found' });
    const salon = await Salon.findOne({ _id: staff.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized' });
    await StaffProfile.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};
export const deleteSalon = async (req, res, next) => {
  try {
    // ADMIN can delete any salon; SALON_OWNER can only delete their own
    const query = req.user.role === 'ADMIN'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id };

    const salon = await Salon.findOne(query);
    if (!salon) return res.status(404).json({ success: false, message: 'Salon not found or unauthorized' });

    await Salon.findByIdAndDelete(req.params.id);

    // Delete associated resources
    await Service.deleteMany({ salon: req.params.id });
    await StaffProfile.deleteMany({ salon: req.params.id });
    await Appointment.deleteMany({ salon: req.params.id });

    // Create Notification for Admins (skip if the deleter is admin themselves)
    if (req.user.role !== 'ADMIN') {
      const admins = await User.find({ role: 'ADMIN' });
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        title: 'Salon Deleted',
        message: `${req.user.firstName} deleted their salon: ${salon.name}.`,
        type: 'SALON_DELETION',
        relatedId: salon._id
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({ success: true, message: 'Salon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
