// server/routes/adminRoutes.js
import express from 'express';
import adminController from '../controllers/adminController.js';
const router = express.Router();

router.get('/reports/summary', adminController.getAdminDashboardData);

export default router;
