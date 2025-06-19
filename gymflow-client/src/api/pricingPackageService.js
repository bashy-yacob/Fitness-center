// import apiService from './apiService';

// /**
//  * Service for interacting with pricing package related endpoints
//  */
// export const pricingPackageService = {
//   /**
//    * Get all available pricing packages
//    */
//   async getAllPricingPackages() {
//     try {
//       const response = await apiService.get('/subscriptions/types', { skipAuth: true });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching pricing packages:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get a specific pricing package by ID
//    */
//   async getPricingPackageById(id) {
//     try {
//       const response = await apiService.get(`/pricing-packages/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching pricing package:', error);
//       throw error;
//     }
//   },

//   /**
//    * Purchase a subscription for a pricing package
//    */
//   async purchaseSubscription(subscriptionTypeId, paymentDetails) {
//     try {
//       const response = await apiService.post('/subscriptions/purchase', {
//         subscriptionTypeId,
//         paymentDetails
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error purchasing subscription:', error);
//       throw error;
//     }
//   }
// };
// src/api/pricingPackageService.js
import apiService from './apiService'; // נניח שיש לך קובץ apiService מרכזי

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
  }
};