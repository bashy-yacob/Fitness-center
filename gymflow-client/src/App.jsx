import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

// Admin Pages
// import AdminDashboard from './pages/Admin/Dashboard';
// import UsersManagement from './pages/Admin/UsersManagement';

// Trainer Pages
// import TrainerDashboard from './pages/Trainer/Dashboard';
// import TrainerClasses from './pages/Trainer/Classes';

// Trainee Pages
import TraineeDashboard from './pages/Trainee/Dashboard.jsx';
import ClassesPage from './pages/Trainee/ClassesPage.jsx';
import MySchedulePage from './pages/Trainee/MySchedulePage.jsx';
import ProfilePage from './pages/Trainee/ProfilePage.jsx';
import SubscriptionManagementPage from './pages/Trainee/SubscriptionManagementPage.jsx';

// Shared Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // פונקציה שמחזירה את הנתיב הנכון לדף הבית לפי סוג המשתמש
    const getHomePath = () => {
        if (!user) return '/login';
        switch (user.user_type) {
            // case 'admin':
            //     return '/admin/dashboard';
            // case 'trainer':
            //     return '/trainer/dashboard';
            case 'trainee':
                return '/trainee/dashboard';
            default:
                return '/login';
        }
    };

    // רשימת הקישורים בתפריט לפי סוג המשתמש
    const getNavLinks = () => {
        const links = [
            <Link key="home" to={getHomePath()}>Home</Link>
        ];

        if (isAuthenticated && user) {
            switch (user.user_type) {
                // case 'admin':
                //     links.push(<Link key="users" to="/admin/users">Users Management</Link>);
                //     break;
                // case 'trainer':
                //     links.push(<Link key="classes" to="/trainer/classes">My Classes</Link>);
                //     break;
                case 'trainee':
                    links.push(
                        <Link key="classes" to="/trainee/classes">Classes</Link>,
                        <Link key="schedule" to="/trainee/schedule">My Schedule</Link>,
                        <Link key="subscription" to="/trainee/subscription">My Subscription</Link>
                    );
                    break;
            }
            links.push(
                <Link key="profile" to={`/${user.user_type}/profile`}>Profile</Link>,
                <button key="logout" onClick={handleLogout}>Logout</button>
            );
        } else {
            links.push(<Link key="login" to="/login">Login</Link>);
        }

        return links;
    };

    return (
        <div className="app">
            <nav className="nav-bar">
                {getNavLinks()}
            </nav>
            
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Route to redirect to the correct dashboard */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Navigate to={getHomePath()} replace />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    {/* <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UsersManagement />
                        </ProtectedRoute>
                    } /> */}

                    {/* Trainer Routes */}
                    {/* <Route path="/trainer/dashboard" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer/classes" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerClasses />
                        </ProtectedRoute>
                    } /> */}

                    {/* Trainee Routes */}
                    <Route path="/trainee/dashboard" element={
                        <ProtectedRoute allowedRoles={['trainee']}>
                            <TraineeDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainee/classes" element={
                        <ProtectedRoute allowedRoles={['trainee']}>
                            <ClassesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainee/schedule" element={
                        <ProtectedRoute allowedRoles={['trainee']}>
                            <MySchedulePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainee/subscription" element={
                        <ProtectedRoute allowedRoles={['trainee']}>
                            <SubscriptionManagementPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainee/profile" element={
                        <ProtectedRoute allowedRoles={['trainee']}>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;