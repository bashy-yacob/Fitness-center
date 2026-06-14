import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { Box } from '@chakra-ui/react';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import UsersManagement from './pages/admin/UsersAdminPage.jsx';
import ClassesAdminPage from './pages/admin/ClassesAdminPage.jsx';
import AdminSubscriptionsPaymentsPage from './pages/admin/AdminSubscriptionsPaymentsPage.jsx';
import AdminPackagesPage from './pages/admin/AdminPackagesPage.jsx';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage.jsx';
import AdminMessagesPage from './pages/admin/AdminMessagesPage.jsx';

// Trainer Pages
import Dashboard from './pages/all/Dashboard.jsx';
import TrainerDashboard from './pages/Trainer/Dashboard';
import TrainerMessagesPage from './pages/Trainer/Messages.jsx';
import TrainerClassesPage from './pages/Trainer/Classes.jsx';
import TrainerStats from './pages/TrainerStats.jsx';
import TrainerSchedulePage from './pages/trainer/TrainerSchedulePage.jsx';
import AssignProgramPage from './pages/Trainer/AssignProgramPage.jsx';

// Trainee Pages
import TraineeDashboard from './pages/Trainee/Dashboard.jsx';
import ClassesPage from './pages/Trainee/ClassesPage.jsx';
import MySchedulePage from './pages/Trainee/MySchedulePage.jsx';
import ProfilePage from './pages/all/ProfilePage.jsx';
import PurchaseSubscriptionPage from './pages/Trainee/PurchaseSubscriptionPage.jsx';
import TraineeMessagesPage from './pages/Trainee/TraineeMessagesPage.jsx';
import TrainingProgramPage from './pages/Trainee/TrainingProgramPage.jsx';
import SubscriptionManagementPage from './pages/Trainee/SubscriptionManagementPage.jsx';
import PricingPage from './pages/Trainee/PricingPage.jsx';
import ConfirmPurchasePage from './pages/Trainee/ConfirmPurchasePage.jsx';

// Shared Pages
import LoginPage from './pages/all/LoginPage.jsx';
import RegisterPage from './pages/all/RegisterPage.jsx';
import LandingPage from './pages/all/LandingPage.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import MessagesRedirector from './components/MessagesRedirector.jsx';

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

    return (
        <Box minH="100vh" bg="dark.bg">
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
                    <Route path="/trainer/messages" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerMessagesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer/classes" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerClassesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer/stats" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerStats />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer/schedule" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TrainerSchedulePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer/assign-program" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <AssignProgramPage />
                        </ProtectedRoute>
                    } />

                    {/* Trainee Routes */}
                    <Route path="/trainee/dashboard" element={<ProtectedRoute><TraineeDashboard /></ProtectedRoute>} />
                    <Route path="/trainee/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
                    <Route path="/trainee/schedule" element={<ProtectedRoute><MySchedulePage /></ProtectedRoute>} />
                    <Route path="/trainee/profile" element={<Navigate to="/profile" replace />} />
                    <Route path="/trainee/subscription" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />
                    <Route path="/trainee/messages" element={<ProtectedRoute><TraineeMessagesPage /></ProtectedRoute>} />
                    <Route path="/trainee/training-program" element={<ProtectedRoute><TrainingProgramPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/manage" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                    <Route path="/trainee/subscriptions/confirm/:packageId" element={<ProtectedRoute><ConfirmPurchasePage /></ProtectedRoute>} />

                    {/* פרופיל אחיד לכל המשתמשים */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/trainer/profile" element={<Navigate to="/profile" replace />} />
                    <Route path="/admin/profile" element={<Navigate to="/profile" replace />} />

                    {/* הודעות - הפניה אוטומטית לפי סוג המשתמש */}
                    <Route path="/messages" element={<ProtectedRoute><MessagesRedirector user={user} /></ProtectedRoute>} />

                    {/* Catch-all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </Box>
    );
}

export default App;