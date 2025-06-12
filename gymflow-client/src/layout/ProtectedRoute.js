import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/components/hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return React.createElement(Navigate, { to: '/login', replace: true });
    }

    // אם children לא מועבר, הוא ירנדר את ה-Route הילד (nested)
    return children ? children : React.createElement(Outlet, null);
};

export default ProtectedRoute;