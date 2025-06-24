import express from 'express';
import { verifyToken, isTrainer } from '../middleware/authMiddleware.js';
import { assignTrainingProgram } from '../controllers/assignProgramController.js';

const router = express.Router();

// שיוך תוכנית אימון למתאמן
router.post('/:trainerId/assign-program', verifyToken, isTrainer, assignTrainingProgram);

export default router;
