import express from 'express';
import { verifyToken, isTrainee } from '../middleware/authMiddleware.js';
import * as traineeController from '../controllers/traineeController.js';

const router = express.Router();

// הדשבורד של המתאמן - נדרשת הרשאת מתאמן
router.get('/dashboard/:traineeId', verifyToken, isTrainee, traineeController.getTraineeDashboard);

export default router;
