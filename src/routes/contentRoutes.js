import express from 'express';
import { getContent, updateContent } from '../controllers/contentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getContent);
router.post('/', protect, authorize('ADMIN'), updateContent);

export default router;
