import { Router } from 'express';
import { 
  createStudySession, 
  getStudySessions, 
  getStudySessionById 
} from '../controllers/study-session.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { studySessionInputSchema } from '../utils/validation';

const router = Router();

// All study session routes require authentication
router.use(authenticateToken);

// Create a new study session
router.post('/', validateBody(studySessionInputSchema), createStudySession);

// Get study sessions with pagination and filtering
router.get('/', getStudySessions);

// Get a specific study session by ID
router.get('/:id', getStudySessionById);

export default router;
