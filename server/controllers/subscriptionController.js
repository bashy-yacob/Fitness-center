// controllers/subscriptionController.js
import subscriptionService from '../services/subscriptionService.js';
import { AppError } from '../middleware/errorMiddleware.js';

export async function getSubscriptionTypeById(req, res, next) {
    try {
        const { id } = req.params;
        const subscriptionType = await subscriptionService.getById(id);
        if (!subscriptionType) {
            throw new AppError('Subscription type not found', 404);
        }
        res.status(200).json(subscriptionType);
    } catch (error) {
        next(error);
    }
}

export async function getAllSubscriptionTypes(req, res, next) {
    try {
        const subscriptionTypes = await subscriptionService.getAll();
        res.status(200).json(subscriptionTypes);
    } catch (error) {
        next(error);
    }
}

export async function updateSubscriptionType(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await subscriptionService.update(id, req.body);
        if (!updated) {
            throw new AppError('Failed to update subscription type or not found', 400);
        }
        res.status(200).json({ message: 'Subscription type updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deleteSubscriptionType(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await subscriptionService.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete subscription type or not found', 400);
        }
        res.status(200).json({ message: 'Subscription type deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// ניהול מנויים של משתמשים
export const purchaseSubscriptionHandler = async (req, res, next) => {
    try {
        const traineeId = req.user.id;
        const { subscriptionTypeId, paymentDetails } = req.body;
        const result = await subscriptionService.purchaseSubscription(traineeId, subscriptionTypeId, paymentDetails);
        res.status(201).json({ message: 'Subscription purchased successfully', ...result });
    } catch (error) {
        next(error);
    }
};

export const getUserSubscriptionsHandler = async (req, res, next) => {
    try {
        const traineeId = req.userId;
        const subscriptions = await subscriptionService.getUserSubscriptions(traineeId);
        res.status(200).json(subscriptions);
    } catch (error) {
        next(error);
    }
};

export const getActiveUserSubscriptionHandler = async (req, res, next) => {
    try {
        const traineeId = req.user.id;
        const activeSubscription = await subscriptionService.findActiveSubscriptionForUser(traineeId);
        if (!activeSubscription) {
            return res.status(200).json(null);
        }
        res.status(200).json(activeSubscription);
    } catch (error) {
        next(error);
    }
};

export const getSubscriptionsForUserHandler = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const subscriptions = await subscriptionService.getUserSubscriptions(userId);
        res.status(200).json(subscriptions);
    } catch (error) {
        next(error);
    }
};

// ניהול סוגי מנויים (רק לאדמין)
export async function createSubscriptionType(req, res, next) {
    try {
        // שימוש ב-BaseService ליצירת סוג מנוי חדש
        const subscriptionId = await subscriptionService.create(req.body);
        res.status(201).json({ message: 'Subscription type created successfully', subscriptionId });
    } catch (error) {
        next(error);
    }
}