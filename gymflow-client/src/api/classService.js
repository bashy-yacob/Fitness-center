import apiService from './apiService';

export const classService = {
  /**
   * קבלת כל החוגים
   */
  getAllClasses: async () => {
    try {
      // הנתיב המלא יהיה /api/classes
      const response = await apiService.get('/classes');
      return response;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  /**
   * קבלת כל החוגים של מאמן
   */
  getTrainerClasses: async (trainerId) => {
    try {
      const response = await apiService.get(`/trainer/${trainerId}/classes/upcoming`);
      return response;
    } catch (error) {
      console.error('Error fetching trainer classes:', error);
      throw error;
    }
  },
};
