// server/controllers/adminController.js
import adminService from '../services/adminService.js';

const adminController = {
  getAdminDashboardData: async (req, res) => {
    try {
      console.log("🩷getAdminDashboardData🩷");

      const userCount = await adminService.getUserCounts();
      console.log("🩷userCount🩷", userCount);
      const monthlyRevenue = await adminService.getMonthlyRevenue();
      console.log("🩷monthlyRevenue🩷", monthlyRevenue);

      // TODO פה יש בעיה עם getActiveClassesCount
      const activeClassesCount = await adminService.getActiveClassesCount();
      console.log("🩷activeClassesCount🩷", activeClassesCount);
      res.json({ userCount, monthlyRevenue, activeClassesCount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
    }
  }
};

export default adminController;
