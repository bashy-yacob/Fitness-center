import React, { createContext, useState, useEffect } from 'react';
import apiService from '../api/apiService.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const updateUserContext = (newUserData) => {
        setUser(newUserData);
    };
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser({ id: decodedToken.id, user_type: decodedToken.user_type, email: decodedToken.email });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { token } = await apiService.post('/auth/login', { email, password });
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        setUser({ id: decodedToken.id, user_type: decodedToken.user_type, email: decodedToken.email });
        return token;
    };

    // --- הוספת הפונקציה החדשה ---
    const register = async (userData) => {
        // userData צריך להכיל: first_name, last_name, email, password
        // השרת שלך אמור להוסיף את שאר הפרטים (כמו user_type)
        const response = await apiService.post('/auth/register', userData);
        // בדרך כלל לאחר הרשמה מוצלחת, אתה רוצה להחזיר הודעה למשתמש
        // או להתחבר אוטומטית. כאן נחזיר את ההודעה מהשרת.
        return response; // response.data יכיל את { message: "User registered successfully" }
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateUserContext,
        isAuthenticated: !!user,
        loading,
    };

    // כאן ההבדל המרכזי - שימוש ב-React.createElement במקום JSX
    return React.createElement(AuthContext.Provider, { value }, !loading ? children : null);
};

// export const useAuth = () => {
//     const context = React.useContext(AuthContext);
//     if (context === null) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };

// export default useAuth;

