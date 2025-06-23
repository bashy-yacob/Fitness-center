
import apiService from './apiService';

export const pricingPackageService = {
  /**
   * קבלת כל סוגי המנויים הפעילים
   */
  getAllPricingPackages: async () => {
    try {
      // הנתיב המלא יהיה /api/subscriptions/types
      const response = await apiService.get('/subscriptions/types');
      return response;
    } catch (error) {
      console.error('Error fetching pricing packages:', error);
      throw error;
    }
  },

  /**
   * רכישת מנוי
   * @param {number} subscriptionTypeId - ID של סוג המנוי
   * @param {Object} paymentDetails - פרטי תשלום (כרגע לא בשימוש מלא)
   */
  purchaseSubscription: async (subscriptionTypeId, paymentDetails) => {
    try {
      // הנתיב המלא יהיה /api/subscriptions/purchase
      const response = await apiService.post('/subscriptions/purchase', {
        subscriptionTypeId,
        paymentDetails,
      });
      return response;
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      throw error;
    }
  },

  /**
   * קבלת כל חבילות המחיר
   */
  fetchAllPackages: async () => {
    try {
      const response = await apiService.get('/pricing-packages');
      return response;
    } catch (error) {
      console.error('Error fetching pricing packages:', error);
      throw error;
    }
  },

  /**
   * מחיקת חבילת מחיר לפי ID
   * @param {number} id - ה-ID של חבילת המחיר למחיקה
   */
  deletePackage: async (id) => {
    try {
      const response = await apiService.delete(`/pricing-packages/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting pricing package:', error);
      throw error;
    }
  },

  /**
   * יצירת חבילת מחיר חדשה
   * @param {Object} data - הנתונים של חבילת המחיר החדשה
   */
  createPackage: async (data) => {
    try {
      const response = await apiService.post('/pricing-packages', data);
      return response;
    } catch (error) {
      console.error('Error creating pricing package:', error);
      throw error;
    }
  },

  /**
   * עדכון חבילת מחיר קיימת
   * @param {number} id - ה-ID של חבילת המחיר לעדכון
   * @param {Object} data - הנתונים המעודכנים של חבילת המחיר
   */
  updatePackage: async (id, data) => {
    try {
      const response = await apiService.put(`/pricing-packages/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating pricing package:', error);
      throw error;
    }
  }
};