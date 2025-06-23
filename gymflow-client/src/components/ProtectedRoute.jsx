// import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading, authError } = useAuth();

    if (loading) {
        return <div>טוען הרשאות...</div>;
    }

    if (authError) {
        return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{authError}</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.user_type)) {
        const userHomePath = `/${user?.user_type}/dashboard` || '/login';
        return <Navigate to={userHomePath} replace />;
    }

    return children || <Outlet />;
};

export default ProtectedRoute;