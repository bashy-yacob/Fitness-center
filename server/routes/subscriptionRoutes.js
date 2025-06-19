// routes/subscriptionRoutes.js
import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { verifyToken, isAdmin, isTrainee } from '../middleware/authMiddleware.js';
import { validate, createSubscriptionSchema, updateSubscriptionSchema, purchaseSubscriptionSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

// --- שינוי כאן ---
// נתיבים פתוחים לכולם - הצגת סוגי המנויים
// הסרנו את המידלוור של האימות כדי שגם משתמשים לא מחוברים יוכלו לראות את החבילות
router.get('/types', subscriptionController.getAllSubscriptionTypes);
router.get('/types/:id', subscriptionController.getSubscriptionTypeById);


// נתיבים לניהול סוגי מנויים (רק לאדמין)
// שינינו את הנתיב ליצירה כדי למנוע התנגשות עם /types
router.post('/types', verifyToken, isAdmin, validate(createSubscriptionSchema), subscriptionController.createSubscriptionType);
router.put('/types/:id', verifyToken, isAdmin, validate(updateSubscriptionSchema), subscriptionController.updateSubscriptionType);
router.delete('/types/:id', verifyToken, isAdmin, subscriptionController.deleteSubscriptionType);

// נתיב לאדמין לצפייה במנויים של משתמש ספציפי (לפי userId ב-URL)
router.get('/user/:userId', verifyToken, isAdmin, subscriptionController.getSubscriptionsForUser);
// נתיבים לרכישה וצפייה במנויים של משתמש
router.post('/purchase', verifyToken, isTrainee, validate(purchaseSubscriptionSchema), subscriptionController.purchaseSubscription); // רכישת מנוי ע"י מתאמן
router.get('/my-subscriptions', verifyToken, isTrainee, subscriptionController.getUserSubscriptions); // צפייה במנויים של המשתמש המחובר

// הסרנו את הנתיב הכפול router.post('/', ...) שהיה מיותר
export default router;