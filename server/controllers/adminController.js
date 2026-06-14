// server/controllers/adminController.js
import adminService from '../services/adminService.js';

const adminController = {
  getAdminDashboardData: async (req, res) => {
    try {
      const userCount = await adminService.getUserCounts();
      const monthlyRevenue = await adminService.getMonthlyRevenue();
      const activeClassesCount = await adminService.getActiveClassesCount();
      res.json({ userCount, monthlyRevenue, activeClassesCount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
    }
  }
};

export default adminController;
