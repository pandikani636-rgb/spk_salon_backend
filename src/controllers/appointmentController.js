import Appointment from '../models/Appointment.js';
import StaffProfile from '../models/StaffProfile.js';
import Salon from '../models/Salon.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { salonId, serviceId, staffId, date, startTime, endTime } = req.body;
    
    // 1. Verify all exist
    const salon = await Salon.findOne({ _id: salonId, isActive: true, status: 'approved' });
    const service = await Service.findById(serviceId);
    const staff = await StaffProfile.findById(staffId);
    
    if (!salon || !service || !staff) {
      res.status(404);
      throw new Error('Salon, Service, or Staff not found');
    }

    // 2. Double booking check
    const existingAppointment = await Appointment.findOne({
      staff: staffId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ],
      status: { $nin: ['cancelled', 'CANCELLED'] }
    });

    if (existingAppointment) {
      res.status(400);
      throw new Error('Selected time slot is no longer available');
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      customer: req.user._id,
      salon: salonId,
      staff: staffId,
      service: serviceId,
      date: new Date(date),
      startTime,
      endTime,
      totalPrice: service.price, // ensure this matches the schema (totalPrice)
      status: 'PENDING'
    });

    // Create Notification for the Salon Owner
    await Notification.create({
      recipient: salon.owner,
      title: 'New Appointment Booking',
      message: `${req.user.firstName} has booked an appointment for ${service.name} on ${date} at ${startTime}.`,
      type: 'NEW_BOOKING',
      relatedId: appointment._id
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('CREATE APPOINTMENT CRASH:', error.stack);
    next(error);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .populate('salon', 'name address coverImage')
      .populate('service', 'name price duration')
      .populate('staff', 'user')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

  export const cancelAppointment = async (req, res, next) => {
    try {
      const appointment = await Appointment.findOne({ _id: req.params.id, customer: req.user._id }).populate('salon');
      if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
      }
      
      if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        res.status(400);
        throw new Error('Cannot cancel a completed or already cancelled appointment');
      }
  
      appointment.status = 'CANCELLED';
      appointment.cancellationReason = req.body?.reason || 'Cancelled by customer';
      await appointment.save();
  
      // Notify owner about cancellation
      await Notification.create({
        recipient: appointment.salon.owner,
        title: 'Appointment Cancelled',
        message: `Customer cancelled their appointment for ${appointment.date}`,
        type: 'SYSTEM',
        relatedId: appointment._id
      });
  
      res.status(200).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  };
