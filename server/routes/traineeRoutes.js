// בקובץ: server/routes/traineeRoutes.js

import express from 'express';
import { verifyToken, isTrainee } from '../middleware/authMiddleware.js';
import * as traineeController from '../controllers/traineeController.js';

const router = express.Router();

// --- נתיב קיים לדשבורד ---
// הוא נשאר בדיוק כפי שהוא, ללא שינוי.
router.get('/dashboard/:traineeId', verifyToken, isTrainee, traineeController.getTraineeDashboard);

// === הוספת הראוט החדש לתוכנית האימונים ===
// הנתיב החדש מתווסף מתחתיו, והוא יטופל על ידי פונקציה נפרדת.
router.get(
    '/my-training-program', 
    verifyToken,
    isTrainee,
    traineeController.getActiveTrainingProgram // פונקציה חדשה בקונטרולר
);

export default router;