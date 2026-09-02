import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createAppointment, getMyAppointments, cancelAppointment } from '../controllers/appointmentController.js';
import { getAvailability } from '../controllers/availabilityController.js';

const router = express.Router();

router.get('/availability', getAvailability);

router.use(protect); // All routes below require login
router.post('/', createAppointment);
router.get('/my-appointments', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);

export default router;
