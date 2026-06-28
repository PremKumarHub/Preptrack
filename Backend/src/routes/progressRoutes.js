import { Router } from 'express';
import { getProgress, markQuestion, updateStreak } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/mark', markQuestion);
router.get('/:userId', getProgress);
router.post('/streak', updateStreak);

export default router;
