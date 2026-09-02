import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Appointment.find({ customer: req.user._id })
      .populate('salon', 'name address')
      .populate('service', 'name price')
      .populate({ path: 'staff', populate: { path: 'user', select: 'firstName lastName' } })
      .sort('-date');
      
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Appointment.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot cancel a booking that is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
