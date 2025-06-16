import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import '../src/index.css'; // Assuming you have a global CSS file for styles

// Admin Pages
// import AdminDashboard from './pages/Admin/Dashboard';
// import UsersManagement from './pages/Admin/UsersManagement';

// Trainer Pages
// import TrainerDashboard from './pages/Trainer/Dashboard';
// import TrainerClasses from './pages/Trainer/Classes';

// Trainee Pages
import TraineeDashboard from './pages/Trainee/jsx/Dashboard.jsx';
import ClassesPage from './pages/Trainee/jsx/ClassesPage.jsx';
import MySchedulePage from './pages/Trainee/jsx/MySchedulePage.jsx';
import ProfilePage from './pages/Trainee/jsx/ProfilePage.jsx';
import SubscriptionManagementPage from './pages/Trainee/jsx/SubscriptionManagementPage.jsx';

// Shared Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/home');
    };

    // פונקציה שמחזירה את הנתיב הנכון לדף הבית לפי סוג המשתמש
    const getHomePath = () => {
        if (!user) return '/home';
        switch (user.user_type) {
            // case 'admin':
            //     return '/admin/dashboard';
            // case 'trainer':
            //     return '/trainer/dashboard';
            case 'trainee':
                return '/trainee/dashboard';
            default:
                return '/home';
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
                    <Route path="/" element={<LandingPage />} />
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
                    <Route path="/trainee/dashboard" element={<ProtectedRoute><TraineeDashboard /></ProtectedRoute>} />
                    <Route path="/trainee/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
                    <Route path="/trainee/schedule" element={<ProtectedRoute><MySchedulePage /></ProtectedRoute>} />
                    <Route path="/trainee/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/trainee/subscription" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />

                    {/* Catch-all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;