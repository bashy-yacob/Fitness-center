// controllers/subscriptionController.js
import * as subscriptionService from '../services/subscriptionService.js';
import { AppError } from '../middleware/errorMiddleware.js';


export async function getSubscriptionTypeById(req, res, next) {
    try {
        const { id } = req.params;
        const subscriptionType = await subscriptionService.getSubscriptionTypeById(id);
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
        const subscriptionTypes = await subscriptionService.getAllSubscriptionTypes();
        res.status(200).json(subscriptionTypes);
    } catch (error) {
        next(error);
    }
}

export async function updateSubscriptionType(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await subscriptionService.updateSubscriptionType(id, req.body);
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
        const deleted = await subscriptionService.deleteSubscriptionType(id);
        if (!deleted) {
            throw new AppError('Failed to delete subscription type or not found', 400);
        }
        res.status(200).json({ message: 'Subscription type deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// ניהול מנויים של משתמשים
export async function purchaseSubscription(req, res, next) {
    try {
        // req.userId מגיע מה-verifyToken middleware ומייצג את ה-traineeId
        const traineeId = req.userId;
        const { subscriptionTypeId, paymentDetails } = req.body;
        const result = await subscriptionService.purchaseSubscription(traineeId, subscriptionTypeId, paymentDetails);
        res.status(201).json({ message: 'Subscription purchased successfully', ...result });
    } catch (error) {
        next(error);
    }
}

export async function getUserSubscriptions(req, res, next) {
    try {
        // req.userId מגיע מה-verifyToken middleware ומייצג את ה-traineeId
        const traineeId = req.userId;
        const subscriptions = await subscriptionService.getUserSubscriptions(traineeId);
        res.status(200).json(subscriptions);
    } catch (error) {
        next(error);
    }
}

// פונקציה לאדמין לצפייה במנויים של משתמש ספציפי
export async function getSubscriptionsForUser(req, res, next) {
    try {
        const { userId } = req.params; // userId מגיע מה-URL, זהו ה-ID של המשתמש שאנו רוצים לראות את המנויים שלו
        const subscriptions = await subscriptionService.getUserSubscriptions(userId);
        res.status(200).json(subscriptions);
    } catch (error) {
        next(error);
    }
}
// ניהול סוגי מנויים (רק לאדמין)
export async function createSubscriptionType(req, res, next) {
    try {
        const subscriptionId = await subscriptionService.createSubscriptionType(req.body);
        res.status(201).json({ message: 'Subscription type created successfully', subscriptionId });
    } catch (error) {
        next(error);
    }
}
// export async function createSubscriptionType(req, res, next) {
//     try {
//         const subscriptionData = req.body;
//         const newSubscriptionId = await subscriptionService.createSubscriptionType(subscriptionData);
//         res.status(201).json({
//             message: 'Subscription type created successfully',
//             subscriptionId: newSubscriptionId
//         });
//     } catch (error) {
//         next(error);
//     }
// }