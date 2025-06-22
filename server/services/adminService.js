// server/services/adminService.js
import * as User from './userService.js';
import * as Payment from './paymentService.js';
import * as Class from './classService.js';

const adminService = {
  getUserCounts: async () => {
    return await User.countUsers();
  },
  getMonthlyRevenue: async () => {
    return await Payment.getMonthlyRevenue();
  },
  getActiveClassesCount: async () => {
    return await Class.countActiveClasses();
  }
};

export default adminService;
