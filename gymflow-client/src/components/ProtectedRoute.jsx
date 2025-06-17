// import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuth();

    // בדיקת התחברות
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // אם יש תפקידים מורשים, בדוק שלמשתמש יש הרשאה
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.user_type)) {
        // אם למשתמש אין הרשאה, נעביר אותו לדף הבית המתאים לו
        const userHomePath = `/${user?.user_type}/dashboard` || '/login';
        return <Navigate to={userHomePath} replace />;
    }

    // אם הכל בסדר, נציג את התוכן
    return children || <Outlet />;
};

export default ProtectedRoute;