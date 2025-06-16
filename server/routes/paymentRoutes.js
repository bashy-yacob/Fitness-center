// routes/paymentRoutes.js
import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { verifyToken, isAdmin, isTrainee } from '../middleware/authMiddleware.js';
import { validate, updatePaymentStatusSchema } from '../middleware/validationMiddleware.js'; // נצטרך סכימת ולידציה

const router = express.Router();

// נתיבי ניהול תשלומים (רק לאדמין)
router.get('/', verifyToken, paymentController.getAllPayments);
router.get('/:id', verifyToken, isTrainee, paymentController.getPaymentById);
router.patch('/:id/status', verifyToken, validate(updatePaymentStatusSchema), paymentController.updatePaymentStatus); // שימוש ב-PATCH לעדכון חלקי
router.delete('/:id', verifyToken, paymentController.deletePayment);

export default router;