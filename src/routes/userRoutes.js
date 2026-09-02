import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getUserBookings, cancelBooking } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/bookings', getUserBookings);
router.put('/bookings/:id/cancel', cancelBooking);

export default router;
