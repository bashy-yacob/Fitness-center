import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ClassesListPage from './pages/ClassesListPage';
import MySchedulePage from './pages/MySchedulePage'; // <<< ייבוא העמוד החדש

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        React.createElement(Link, { key: 'home', to: '/' }, 'Home')
    ];

    if (isAuthenticated) {
        navLinks.push(' | ');
        navLinks.push(React.createElement(Link, { key: 'dashboard', to: '/dashboard' }, 'Dashboard'));
        navLinks.push(' | ');
        navLinks.push(React.createElement(Link, { key: 'classes', to: '/classes' }, 'All Classes'));
        // <<< הוספת קישור לעמוד "המערכת שלי" >>>
        if (user.user_type === 'trainee') {
            navLinks.push(' | ');
            navLinks.push(React.createElement(Link, { key: 'my-schedule', to: '/my-schedule' }, 'My Schedule'));
        }
        navLinks.push(
            React.createElement('span', { key: 'welcome', style: { float: 'right', marginRight: '20px' } },
                `Welcome, ${user.email}! `,
                React.createElement('button', { onClick: handleLogout, style: { marginLeft: '10px' } }, 'Logout')
            )
        );
    } else {
        navLinks.push(' | ');
        navLinks.push(React.createElement(Link, { key: 'login', to: '/login' }, 'Login'));
    }

    return React.createElement('div', null,
        React.createElement('nav', { style: { padding: '10px', background: '#f0f0f0' } }, ...navLinks),
        React.createElement('hr'),
        React.createElement('main', { style: { padding: '20px' } },
            React.createElement(Routes, null,
                // Public Routes
                React.createElement(Route, { path: '/login', element: React.createElement(LoginPage) }),
                React.createElement(Route, { path: '/register', element: React.createElement(RegisterPage) }),

                // Protected Routes - כל הנתיבים כאן דורשים התחברות
                React.createElement(Route, { path: '/', element: React.createElement(ProtectedRoute, null, React.createElement(Dashboard)) }),
                React.createElement(Route, { path: '/dashboard', element: React.createElement(ProtectedRoute, null, React.createElement(Dashboard)) }),
                React.createElement(Route, { path: '/classes', element: React.createElement(ProtectedRoute, null, React.createElement(ClassesListPage)) }),
                // <<< הוספת הנתיב החדש >>>
                React.createElement(Route, { path: '/my-schedule', element: React.createElement(ProtectedRoute, null, React.createElement(MySchedulePage)) }),
            )
        )
    );
}

export default App;