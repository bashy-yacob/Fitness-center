// controllers/paymentController.js
import * as paymentService from '../services/paymentService.js';
import { AppError } from '../middleware/errorMiddleware.js';

export async function getPaymentById(req, res, next) {
    try {
        const { id } = req.params;
        const payment = await paymentService.getPaymentById(id);
        if (!payment) {
            throw new AppError('Payment not found', 404);
        }
        res.status(200).json(payment);
    } catch (error) {
        next(error);
    }
}

export async function getAllPayments(req, res, next) {
    try {
        // ניתן להעביר פילטרים מתוך Query Parameters, לדוגמה: /api/payments?traineeId=1&status=completed
        const filters = req.query;
        const payments = await paymentService.getAllPayments(filters);
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
}

export async function updatePaymentStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // נדרשת ולידציה עבור status ו-notes
        const updated = await paymentService.updatePaymentStatus(id, status, notes);
        if (!updated) {
            throw new AppError('Failed to update payment status or payment not found', 400);
        }
        res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deletePayment(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await paymentService.deletePayment(id);
        if (!deleted) {
            throw new AppError('Failed to delete payment or payment not found', 400);
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        next(error);
    }
}