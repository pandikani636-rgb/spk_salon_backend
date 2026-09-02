import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';

export const createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Verify appointment belongs to user and is completed
    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      customer: req.user._id 
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    }

    const review = await Review.create({
      salon: appointment.salon,
      user: req.user._id,
      appointment: appointment._id,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this appointment' });
    }
    next(error);
  }
};

export const getSalonReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ salon: req.params.salonId })
      .populate('user', 'firstName lastName')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

import Salon from '../models/Salon.js';

export const getOwnerReviews = async (req, res, next) => {
  try {
    const salons = await Salon.find({ owner: req.user._id });
    const salonIds = salons.map(s => s._id);
    const reviews = await Review.find({ salon: { $in: salonIds } })
      .populate('user', 'firstName lastName')
      .populate('salon', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
