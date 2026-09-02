import express from 'express';
import { getOwnerStats, updateAppointmentStatus, getOwnerSalons, createSalon, updateSalon, deleteSalon, getOwnerServices, createOwnerService, updateOwnerService, deleteOwnerService, getOwnerStaff, createOwnerStaff, deleteOwnerStaff } from '../controllers/ownerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('SALON_OWNER', 'ADMIN'));

router.get('/salons', getOwnerSalons);
router.post('/salons', createSalon);
router.put('/salons/:id', updateSalon);
router.delete('/salons/:id', deleteSalon);

router.get('/stats', getOwnerStats);
router.put('/appointments/:id/status', updateAppointmentStatus);

router.get('/services', getOwnerServices);
router.post('/services', createOwnerService);
router.put('/services/:id', updateOwnerService);
router.delete('/services/:id', deleteOwnerService);

router.get('/staff', getOwnerStaff);
router.post('/staff', createOwnerStaff);
router.delete('/staff/:id', deleteOwnerStaff);

export default router;
