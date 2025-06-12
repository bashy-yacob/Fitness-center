// routes/paymentRoutes.js
import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validate, updatePaymentStatusSchema } from '../middleware/validationMiddleware.js'; // נצטרך סכימת ולידציה

const router = express.Router();

// נתיבי ניהול תשלומים (רק לאדמין)
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);
router.get('/:id', verifyToken, isAdmin, paymentController.getPaymentById);
router.patch('/:id/status', verifyToken, isAdmin, validate(updatePaymentStatusSchema), paymentController.updatePaymentStatus); // שימוש ב-PATCH לעדכון חלקי
router.delete('/:id', verifyToken, isAdmin, paymentController.deletePayment);

export default router;