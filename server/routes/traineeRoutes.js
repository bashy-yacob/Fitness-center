// בקובץ: server/routes/traineeRoutes.js

import express from 'express';
import { verifyToken, isTrainee } from '../middleware/authMiddleware.js';
import * as traineeController from '../controllers/traineeController.js';

const router = express.Router();

router.get('/dashboard/:traineeId', verifyToken, isTrainee, traineeController.getTraineeDashboard);

router.get('/my-training-program', verifyToken, isTrainee,traineeController.getActiveTrainingProgram );

router.get('/programs/all', verifyToken, traineeController.getAllTrainingPrograms);

export default router;