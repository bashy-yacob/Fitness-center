// routes/subscriptionRoutes.js
import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { verifyToken, isAdmin, isTrainee } from '../middleware/authMiddleware.js';
import { validate, createSubscriptionSchema, updateSubscriptionSchema, purchaseSubscriptionSchema } from '../middleware/validationMiddleware.js'; // נצטרך סכימות ולידציה

const router = express.Router();

// נתיבים לניהול סוגי מנויים (רק לאדמין)
router.post( '/', verifyToken, isAdmin,validate(createSubscriptionSchema),subscriptionController.createSubscriptionType );
router.post('/types', verifyToken, isAdmin, validate(createSubscriptionSchema), subscriptionController.createSubscriptionType);
router.get('/types', verifyToken, isAdmin, subscriptionController.getAllSubscriptionTypes);
router.get('/types/:id', verifyToken, isAdmin, subscriptionController.getSubscriptionTypeById);
router.put('/types/:id', verifyToken, isAdmin, validate(updateSubscriptionSchema), subscriptionController.updateSubscriptionType);
router.delete('/types/:id', verifyToken, isAdmin, subscriptionController.deleteSubscriptionType);
// נתיב לאדמין לצפייה במנויים של משתמש ספציפי (לפי userId ב-URL)
router.get('/user/:userId', verifyToken, isAdmin, subscriptionController.getSubscriptionsForUser);

// נתיבים לרכישה וצפייה במנויים של משתמש
router.post('/purchase', verifyToken, isTrainee, validate(purchaseSubscriptionSchema), subscriptionController.purchaseSubscription); // רכישת מנוי ע"י מתאמן
router.get('/my-subscriptions', verifyToken, isTrainee, subscriptionController.getUserSubscriptions); // צפייה במנויים של המשתמש המחובר



export default router;