import api from './apiService';

// קבלת כל המשתמשים
export const fetchAllUsers = () => api.get('/users');

// קבלת משתמשים לפי סוג
export const fetchUsersByType = (type) => api.get(`/users/filter/by-type?type=${type}`);

// יצירת משתמש חדש
export const createUser = (userData) => api.post('/users', userData);

// עדכון משתמש
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

// מחיקת משתמש
export const deleteUser = (id) => api.delete(`/users/${id}`);
