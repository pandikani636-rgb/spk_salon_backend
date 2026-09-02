import Banner from '../models/Banner.js';

export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('-createdAt');
    res.status(200).json({ success: true, data: banners });
  } catch (error) { next(error); }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) { next(error); }
};

export const deleteBanner = async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
