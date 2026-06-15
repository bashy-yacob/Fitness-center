// בקובץ: server/controllers/traineeController.js

import * as traineeService from '../services/traineeService.js';
import { AppError } from '../middleware/errorMiddleware.js';

// --- פונקציה קיימת לדשבורד ---
// היא נשארת בדיוק כפי שהיא, ללא שינוי.
export async function getTraineeDashboard(req, res, next) {
    try {
        if (req.user.id !== parseInt(req.params.traineeId) && req.user.user_type !== 'admin') {
            throw new AppError('אין הרשאה לצפות במידע זה', 403);
        }
        const dashboardData = await traineeService.getTraineeDashboard(req.params.traineeId);

        // === כאן התיקון ===
        // אנחנו לוקחים את כל המידע מ-dashboardData ומוסיפים לו מפתח 'user'
        // שמכיל את כל המידע מהטוקן.
        const responseData = {
            ...dashboardData,
            user: req.user // שימוש ישיר ב-req.user
        };

        res.status(200).json({
            status: 'success',
            data: responseData // שליחת האובייקט המתוקן
        });
    } catch (error) {
        next(error);
    }
}


// === הוספת הפונקציה החדשה לתוכנית האימונים ===
export async function getActiveTrainingProgram(req, res, next) {
    try {
        // מזהה המתאמן נלקח מהטוקן, שהוצמד ל-req.user על ידי ה-middleware
        const traineeId = req.user.id;
        const program = await traineeService.findActiveProgramForTrainee(traineeId);
        // אם לא נמצאה תוכנית, נחזיר null. זו לא שגיאה.
        if (!program) {
            return res.status(200).json(null);
        }

        res.status(200).json(program);
    } catch (error) {
        next(error);
    }
}

// שליפת כל תוכניות האימון (GET)
export async function getAllTrainingPrograms(req, res, next) {
    try {
        const programs = await traineeService.getAllTrainingPrograms();
        res.json(programs);
    } catch (err) {
        next(err);
    }
}