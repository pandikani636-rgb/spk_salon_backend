import Salon from '../models/Salon.js';
import Service from '../models/Service.js';
import StaffProfile from '../models/StaffProfile.js';

export const getSalons = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const salons = await Salon.find({ ...keyword });
    res.json({
      success: true,
      data: salons,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonById = async (req, res, next) => {
  try {
    const salon = await Salon.findOne({ _id: req.params.id });
    if (!salon) {
      res.status(404);
      throw new Error('Salon not found');
    }

    const services = await Service.find({ salon: salon._id });
    const staff = await StaffProfile.find({ salon: salon._id }).populate('user', 'firstName lastName avatar');

    res.json({
      success: true,
      data: {
        salon,
        services,
        staff
      },
    });
  } catch (error) {
    next(error);
  }
};
