import SalonCategory from '../models/SalonCategory.js';

export const getSalonCategories = async (req, res, next) => {
  try {
    const categories = await SalonCategory.find().sort('name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) { next(error); }
};

export const createSalonCategory = async (req, res, next) => {
  try {
    const category = await SalonCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};

export const updateSalonCategory = async (req, res, next) => {
  try {
    const category = await SalonCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) { next(error); }
};

export const deleteSalonCategory = async (req, res, next) => {
  try {
    await SalonCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};