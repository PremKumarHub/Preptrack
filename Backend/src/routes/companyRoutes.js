import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCompany, getCompanyQuestions, listCompanies } from '../controllers/companyController.js';

const router = Router();

router.get('/', protect, listCompanies);
router.get('/:id', protect, getCompany);
router.get('/:id/questions', protect, getCompanyQuestions);

export default router;
