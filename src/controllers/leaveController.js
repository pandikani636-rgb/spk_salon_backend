import Leave from '../models/Leave.js';
import Salon from '../models/Salon.js';

export const getLeaves = async (req, res, next) => {
  try {
    const salons = await Salon.find({ owner: req.user._id });
    const salonIds = salons.map(s => s._id);
    const leaves = await Leave.find({ salon: { $in: salonIds } })
      .populate('salon', 'name')
      .populate({ path: 'staff', populate: { path: 'user', select: 'firstName lastName' } })
      .sort('-createdAt');
    res.status(200).json({ success: true, data: leaves });
  } catch (error) { next(error); }
};

export const createLeave = async (req, res, next) => {
  try {
    const { staff, salon, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({ staff, salon, startDate, endDate, reason });
    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Not found' });
    
    const salon = await Salon.findOne({ _id: leave.salon, owner: req.user._id });
    if (!salon) return res.status(403).json({ success: false, message: 'Not authorized' });

    leave.status = req.body.status;
    await leave.save();
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};
