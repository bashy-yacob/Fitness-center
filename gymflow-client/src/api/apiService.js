const BASE_URL = 'http://localhost:3000/api';

// פונקציית עזר מרכזית לכל קריאות ה-API
async function request(endpoint, options = {}) {
    // הרכבת ה-URL המלא
    const url = `${BASE_URL}${endpoint}`;
    
    // הגדרות ברירת מחדל
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // הוספת טוקן אימות אם קיים
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    // המר את גוף הבקשה ל-JSON אם הוא קיים
    if (config.body) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        // fetch לא זורק שגיאה על סטטוסים כמו 4xx או 5xx, אז אנחנו צריכים לעשות זאת בעצמנו
        if (!response.ok) {
            // נסה לקרוא את גוף השגיאה מהשרת
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            // צור אובייקט שגיאה שמכיל את המידע מהשרת
            const error = new Error(errorData.message || 'An error occurred');
            error.response = { status: response.status, data: errorData };
            throw error;
        }

        // אם התגובה היא 204 (No Content), אין גוף תגובה להחזיר
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        // זרוק את השגיאה הלאה כדי שהקומפוננטה תוכל לתפוס אותה
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

// פונקציה לקבלת נתוני לוח המחוונים של המאמן
export async function fetchTrainerDashboard(trainerId) {
    return await request(`/trainer/${trainerId}/dashboard`);
}

export default apiService;