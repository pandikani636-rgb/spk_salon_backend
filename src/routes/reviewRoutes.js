import express from 'express';
import { createReview, getSalonReviews, getOwnerReviews } from '../controllers/reviewController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('CUSTOMER'), createReview);
router.get('/salon/:salonId', getSalonReviews);
router.get('/owner', protect, authorize('SALON_OWNER', 'ADMIN'), getOwnerReviews);

export default router;
