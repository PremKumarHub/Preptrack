import { Router } from 'express';
import { login, me, register, updateRole } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/role', protect, updateRole);

export default router;
