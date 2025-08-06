import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { aiLimiter } from '../middlewares/rateLimiter.middlewares.js';
import { generateAIResponse } from '../controllers/llm.controllers.js';

const router = Router();

// Secure Routes
router.route('/generateAIResponse').post(aiLimiter, verifyJWT, generateAIResponse);

export default router;
