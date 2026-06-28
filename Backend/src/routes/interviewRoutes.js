import { Router } from 'express';
import { feedback, getSessions, saveSession } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/feedback', feedback);
router.post('/session/save', saveSession);
router.get('/sessions/:userId', getSessions);

export default router;
