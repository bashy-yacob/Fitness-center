import React, { createContext, useState, useEffect } from 'react';
import apiService from '../api/apiService.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);
    const [authError, setAuthError] = useState(null);

    const updateUserContext = (newUserData) => {
        setUser(newUserData);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    apiService.get('/users/me')
                        .then(fullUser => {
                            setUser(fullUser);
                            setAuthError(null);
                        })
                        .catch(() => {
                            setUser({ id: decodedToken.id, user_type: decodedToken.user_type, email: decodedToken.email });
                            setAuthError(null);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                    setAuthError('ההתחברות פגה, יש להתחבר מחדש.');
                    setLoading(false);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                setUser(null);
                setAuthError('ההתחברות לא תקינה, יש להתחבר מחדש.');
                setLoading(false);
            }
        } else {
            setUser(null);
            setAuthError(null);
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { token } = await apiService.post('/auth/login', { email, password });
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        const fullUser = await apiService.get('/users/me');
        setUser(fullUser);
        setAuthError(null);
        return token;
    };

    const register = async (userData) => {
        const response = await apiService.post('/auth/register', userData);
        return response;
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setAuthError(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateUserContext,
        isAuthenticated: !!user,
        loading,
        redirectPath,
        setRedirectPath,
        authError,
    };

    return React.createElement(AuthContext.Provider, { value }, !loading ? children : null);
};

