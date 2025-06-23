import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import '../src/index.css'; // Assuming you have a global CSS file for styles

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import UsersManagement from './pages/admin/UsersAdminPage.jsx';
import ClassesAdminPage from './pages/admin/ClassesAdminPage.jsx';
import AdminSubscriptionsPaymentsPage from './pages/admin/AdminSubscriptionsPaymentsPage.jsx';
import AdminPackagesPage from './pages/admin/AdminPackagesPage.jsx';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage.jsx';
import AdminMessagesPage from './pages/admin/AdminMessagesPage.jsx';

// Trainer Pages
import Dashboard from './pages/all/jsx/Dashboard.jsx';
import TrainerDashboard from './pages/Trainer/Dashboard';
// import TrainerClasses from './pages/Trainer/Classes';

// Trainee Pages
import TraineeDashboard from './pages/Trainee/jsx/Dashboard.jsx';
import ClassesPage from './pages/Trainee/jsx/ClassesPage.jsx';
import MySchedulePage from './pages/Trainee/jsx/MySchedulePage.jsx';
import ProfilePage from './pages/Trainee/jsx/TraineeProfilePage.jsx';
import PurchaseSubscriptionPage from './pages/Trainee/jsx/PurchaseSubscriptionPage.jsx';
import TraineeMessagesPage from './pages/Trainee/jsx/TraineeMessagesPage.jsx';
import TrainingProgramPage from './pages/Trainee/jsx/TrainingProgramPage.jsx';
import SubscriptionManagementPage from './pages/Trainee/jsx/SubscriptionManagementPage.jsx';
import PricingPage from './pages/Trainee/jsx/PricingPage.jsx';
// ניצור את הקובץ הזה בהמשך
import ConfirmPurchasePage from './pages/Trainee/jsx/ConfirmPurchasePage.jsx'; 

// Shared Pages
import LoginPage from './pages/all/jsx/LoginPage.jsx';
import RegisterPage from './pages/all/jsx/RegisterPage.jsx';
import LandingPage from './pages/all/jsx/LandingPage.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

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
            case 'trainer':
                return '/trainer/dashboard';
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
                case 'admin':
                    links.push(<Link key="users" to="/admin/users">ניהול משתמשים</Link>);
                    links.push(<Link key="classes" to="/admin/classes">ניהול חוגים</Link>);
                    break;
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
            <Navbar onLogout={handleLogout} />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UsersManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/classes" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ClassesAdminPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/subscriptions-payments" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSubscriptionsPaymentsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/packages" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPackagesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/payments" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPaymentsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/broadcast-messages" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMessagesPage />
                        </ProtectedRoute>
                    } />

                    {/* Trainer Routes */}
                    <Route path="/trainer/dashboard" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    } />
                    {/*<Route path="/trainer/classes" element={
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
                    <Route path="/trainee/messages" element={<ProtectedRoute><TraineeMessagesPage /></ProtectedRoute>} />
                    <Route path="/trainee/training-program" element={<ProtectedRoute><TrainingProgramPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/manage" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/confirm/:packageId" element={<ProtectedRoute><ConfirmPurchasePage /></ProtectedRoute>} />
                    <Route path="/trainee/messages" element={<ProtectedRoute><TraineeMessagesPage /></ProtectedRoute>} />
                    <Route path="/trainee/training-program" element={<ProtectedRoute><TrainingProgramPage /></ProtectedRoute>} />
                    {/* Catch-all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;