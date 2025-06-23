import express from 'express';
import * as trainerController from '../controllers/trainerController.js';
import { verifyToken, isTrainer } from '../middleware/authMiddleware.js';

const router = express.Router();

// דשבורד מאמן - סיכום
router.get('/:trainerId/dashboard/summary', verifyToken, isTrainer, trainerController.getTrainerDashboardSummary);
// חוגים קרובים
router.get('/:trainerId/classes/upcoming', verifyToken, isTrainer, trainerController.getUpcomingClasses);
// הודעות אחרונות
router.get('/:trainerId/messages/recent', verifyToken, isTrainer, trainerController.getRecentMessages);
// שליפת כל המתאמנים של מאמן
router.get('/:trainerId/trainees', verifyToken, isTrainer, trainerController.fetchTraineesByTrainerId);
// שליחת הודעה קבוצתית
router.post('/:trainerId/messages/send-batch', verifyToken, isTrainer, trainerController.sendMessagesToTrainees);
// שליחת הודעה לכל משתתפי חוג
router.post('/:trainerId/messages/send-class', verifyToken, isTrainer, trainerController.sendMessageToClass);
// שליחת הודעה למנהל
router.post('/:trainerId/messages/send-admin', verifyToken, isTrainer, trainerController.sendMessageToAdmin);
// שליפת הודעות שנשלחו
router.get('/:trainerId/messages/sent', verifyToken, isTrainer, trainerController.getSentMessages);
// יצירת חוג ע"י מאמן
router.post('/:trainerId/classes', verifyToken, isTrainer, trainerController.createClassByTrainer);
// סטטיסטיקות למאמן
router.get('/:trainerId/stats/attendance-summary', verifyToken, isTrainer, trainerController.getAttendanceSummary);
router.get('/:trainerId/stats/by-trainee', verifyToken, isTrainer, trainerController.getStatsPerTrainee);
// מערכת שעות מאמן
router.get('/:trainerId/schedule', verifyToken, isTrainer, trainerController.getTrainerSchedule);

export default router;
