import express from 'express';
import { getLeaves, createLeave, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('SALON_OWNER'));

router.get('/', getLeaves);
router.post('/', createLeave);
router.put('/:id/status', updateLeaveStatus);

export default router;
