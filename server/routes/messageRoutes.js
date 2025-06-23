import express from 'express';
import messageController from '../controllers/messageController.js';
import { verifyToken, isAdmin, isTrainee } from '../middleware/authMiddleware.js';

const router = express.Router();

// שליחת הודעה שיווקית
router.post('/broadcast-messages', verifyToken, isAdmin, messageController.broadcastMessage);
// קבלת כל ההודעות שנשלחו (פתוח לכל משתמש מחובר)
router.get('/broadcast-messages', verifyToken, messageController.getSentMessages);
// עריכת הודעה שיווקית
router.put('/broadcast-messages/:id', verifyToken, isAdmin, messageController.updateBroadcastMessage);
// מחיקת הודעה שיווקית
router.delete('/broadcast-messages/:id', verifyToken, isAdmin, messageController.deleteBroadcastMessage);
// הודעות פרטיות למתאמן
router.get('/trainee/messages/private', verifyToken, isTrainee, messageController.getPrivateMessagesForTrainee);
// שליחת הודעה פרטית למתאמן
router.post('/trainee/messages/private', verifyToken, isAdmin, messageController.sendPrivateMessageToTrainee);
// שליחת הודעה פרטית לכל משתמש (מתאמן, מאמן, מנהל)
router.post('/messages/private', verifyToken, messageController.sendPrivateMessageToAnyUser);
// הודעות פרטיות שהתקבלו ע"י משתמש מחובר
router.get('/messages/received', verifyToken, messageController.getReceivedPrivateMessages);
// הודעות פרטיות שנשלחו ע"י המשתמש המחובר
router.get('/messages/sent-private', verifyToken, messageController.getSentPrivateMessages);

export default router;
