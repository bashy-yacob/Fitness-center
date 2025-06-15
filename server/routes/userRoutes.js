// routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validate, registerSchema, updateUserSchema } from '../middleware/validationMiddleware.js'; // נצטרך להוסיף סכימה ל-updateUserSchema
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/:userId/attended-classes', verifyToken, userController.getAttendedClasses);
router.get('/:userId/active-subscription', verifyToken, userController.getActiveSubscription);


router.post('/me/profile-picture', verifyToken, upload.single('profilePicture'), userController.uploadProfilePicture);
router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, validate(updateUserSchema), userController.updateMe); // נוסיף ולידציה גם כאן

// נתיבים לניהול משתמשים על ידי אדמין
// כל הנתיבים הללו מוגנים על ידי verifyToken ו-isAdmin
router.post('/', verifyToken, isAdmin, validate(registerSchema), userController.createUserByAdmin); // יצירת משתמש על ידי אדמין
router.get('/', verifyToken, isAdmin, userController.getAllUsers); // קבלת כל המשתמשים
router.get('/:id', verifyToken, isAdmin, userController.getUserById); // קבלת משתמש ספציפי
router.put('/:id', verifyToken, isAdmin, userController.updateUser); // עדכון משתמש (נצטרך סכימת ולידציה)
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser); // מחיקת משתמש

export default router;