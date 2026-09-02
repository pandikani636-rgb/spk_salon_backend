import express from 'express';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getBanners);
router.post('/', protect, authorize('ADMIN'), createBanner);
router.delete('/:id', protect, authorize('ADMIN'), deleteBanner);

export default router;
