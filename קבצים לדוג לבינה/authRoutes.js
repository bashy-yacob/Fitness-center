// routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
// import pkg from 'jsonwebtoken';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validationMiddleware.js'; // ייבוא ה-middleware של הולידציה

const router = express.Router();


// נתיבי אותנטיקציה
router.post('/register', validate(registerSchema), authController.register); // הוספת ולידציה
router.post('/login', validate(loginSchema), authController.login); // הוספת ולידציה
router.get('/logout', verifyToken, authController.logout);
export default router;