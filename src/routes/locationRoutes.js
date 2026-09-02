import express from 'express';
import { getLocations, createLocation, deleteLocation } from '../controllers/locationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getLocations);
router.post('/', protect, authorize('ADMIN'), createLocation);
router.delete('/:id', protect, authorize('ADMIN'), deleteLocation);

export default router;
