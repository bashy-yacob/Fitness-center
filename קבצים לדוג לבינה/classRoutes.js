// routes/classRoutes.js
import express from 'express';
// ודא שהפונקציה החדשה מיובאת. אם אתה משתמש ב-* אז זה קורה אוטומטית.
import * as classController from '../controllers/classController.js';
import { verifyToken, isAdmin, isTrainer, isTrainee } from '../middleware/authMiddleware.js';
import { validate, createClassSchema, updateClassSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

// נתיבי ניהול חוגים (למנהלים ומאמנים)
router.post('/', verifyToken, isAdmin, validate(createClassSchema), classController.createClass);
router.get('/', verifyToken, classController.getAllClasses);
router.get('/:id', verifyToken, classController.getClassById);
router.put('/:id', verifyToken, isAdmin, validate(updateClassSchema), classController.updateClass);
router.delete('/:id', verifyToken, isAdmin, classController.deleteClass);

// <<< הנתיב החדש שהוספנו עבור מתאמן >>>
// נתיב זה צריך להופיע לפני נתיבים עם פרמטרים כמו '/:id' כדי למנוע בלבול.
// GET /api/classes/my-registrations - מחזיר את כל החוגים שהמשתמש הנוכחי רשום אליהם.
router.get('/my-registrations', verifyToken, isTrainee, classController.getRegisteredClassesForUser);

// נתיבי רישום לחוגים (למתאמנים)
router.post('/:classId/register', verifyToken, isTrainee, classController.registerUserForClass);
router.delete('/:classId/unregister', verifyToken, isTrainee, classController.unregisterFromClass);

// צפייה במתאמנים רשומים לחוג (למאמנים ומנהלים)
router.get('/:classId/registrations', verifyToken, isTrainer, classController.getClassRegistrations);


export default router;