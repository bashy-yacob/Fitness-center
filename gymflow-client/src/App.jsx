import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Import Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClassesListPage from './pages/ClassesListPage.jsx';
import MySchedulePage from './pages/MySchedulePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Import Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './layout/Navbar.jsx';

function App() {
    return (
        <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '1rem' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/classes" element={<ProtectedRoute><ClassesListPage /></ProtectedRoute>} />
                    <Route path="/my-schedule" element={<ProtectedRoute><MySchedulePage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;