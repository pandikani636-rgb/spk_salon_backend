import express from 'express';
import { getSalons, getSalonById } from '../controllers/salonController.js';

const router = express.Router();

router.route('/').get(getSalons);
router.route('/:id').get(getSalonById);

export default router;
