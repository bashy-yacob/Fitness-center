import apiService from './apiService.js';

// שירות לקריאות API של תשלומים
export async function fetchAllPayments() {
  return apiService.get('/payments');
}
