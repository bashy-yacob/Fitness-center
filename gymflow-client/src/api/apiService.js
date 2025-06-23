const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // הגדרות ראשוניות
    const config = {
        method: 'GET', // ברירת מחדל
        ...options,
        headers: {
            ...options.headers,
        },
    };

    // הוספת טוקן אימות אם קיים
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        // אם אין טוקן, אל תשלח בכלל Authorization
        delete config.headers['Authorization'];
    }

    // טיפול בגוף הבקשה לפי סוגו
    if (config.body) {
        if (config.body instanceof FormData) {
            // אם זה FormData (העלאת קובץ):
            // 1. אל תקבע Content-Type, תן לדפדפן לעשות זאת
            // 2. אל תמיר ל-JSON
            // הגוף כבר מוכן ב-config.body
        } else {
            // אם זה אובייקט JSON רגיל:
            // 1. קבע Content-Type מתאים
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(config.body);
        }
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const error = new Error(errorData.message || 'An error occurred');
            error.response = { status: response.status, data: errorData };
            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
// פונקציות עזר נוחות לשיטות HTTP שונות
const apiService = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
    patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiService;