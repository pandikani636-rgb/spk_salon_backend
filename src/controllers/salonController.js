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

    const salons = await Salon.find({ ...keyword, isActive: true, status: 'approved' });
    const allSalonsCount = await Salon.countDocuments();
    
    res.json({
      success: true,
      data: salons,
      debug: {
        dbName: Salon.db.name,
        collectionName: Salon.collection.name,
        totalSalonsInDb: allSalonsCount,
        filterUsed: { ...keyword, isActive: true, status: 'approved' }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonById = async (req, res, next) => {
  try {
    const salon = await Salon.findOne({ _id: req.params.id, isActive: true, status: 'approved' });
    if (!salon) {
      res.status(404);
      throw new Error('Salon not found');
    }

    const services = await Service.find({ salon: salon._id, isActive: true });
    const staff = await StaffProfile.find({ salon: salon._id, isActive: true }).populate('user', 'firstName lastName avatar');

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
