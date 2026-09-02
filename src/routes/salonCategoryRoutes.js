import express from 'express';
import { getSalonCategories, createSalonCategory, updateSalonCategory, deleteSalonCategory } from '../controllers/salonCategoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getSalonCategories);
router.post('/', protect, authorize('ADMIN'), createSalonCategory);
router.put('/:id', protect, authorize('ADMIN'), updateSalonCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteSalonCategory);

export default router;