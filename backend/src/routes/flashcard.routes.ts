import { Router } from 'express';
import { 
  createFlashcard, 
  getFlashcards, 
  getFlashcardById, 
  updateFlashcard, 
  deleteFlashcard, 
  reviewFlashcard, 
  getUserFlashcards 
} from '@/controllers/flashcard.controller';
import { authenticateToken } from '@/middleware/auth';
import { validateBody } from '@/middleware/validation';
import { createFlashcardSchema, updateFlashcardSchema, flashcardReviewSchema } from '@/utils/validation';

const router = Router();

// Public routes (for browsing flashcards)
router.get('/', getFlashcards);
router.get('/:id', getFlashcardById);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/', validateBody(createFlashcardSchema), createFlashcard);
router.put('/:id', validateBody(updateFlashcardSchema), updateFlashcard);
router.delete('/:id', deleteFlashcard);
router.post('/review', validateBody(flashcardReviewSchema), reviewFlashcard);
router.get('/user/me', getUserFlashcards);

export default router;
