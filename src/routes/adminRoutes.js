import express from 'express';
import { 
  getAdminStats, approveSalon, rejectSalon,
  getUsers, getUserDetails, deleteUser, getAllSalons, getAllAppointments,
  getAllServices, getAllStaff, createStaff, updateStaff, deleteStaff, getAllReviews
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);

router.get('/salons', getAllSalons);
router.put('/salon/:id/approve', approveSalon);
router.delete('/salon/:id/reject', rejectSalon);

router.get('/appointments', getAllAppointments);
router.get('/services', getAllServices);

router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

router.get('/reviews', getAllReviews);

console.log("Admin routes registered:", router.stack.filter(r => r.route).map(r => r.route.path));

export default router;
