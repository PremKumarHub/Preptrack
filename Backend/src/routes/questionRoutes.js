import { Router } from 'express';
import { getQuestionsByRole, getQuestionsByRoleAndTopic } from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:role', protect, getQuestionsByRole);
router.get('/:role/:topic', protect, getQuestionsByRoleAndTopic);

export default router;
