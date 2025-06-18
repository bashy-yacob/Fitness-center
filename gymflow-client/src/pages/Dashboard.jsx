
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import TraineeDashboardPage from './Trainee/jsx/Dashboard.jsx'// Import the new component
// import TrainerDashboardPage from './Trainer/jsx/Dashboard.jsx'// Import the new component
// import AdminDashboardPage from './admin/jsx/Dashboard.jsx'// Import the new component

function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="page-container">
                <div className="section">
                    <div className="card">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    const renderDashboard = () => {
        switch (user.user_type) {
            case 'admin':
                // return <AdminDashboardPage />;
            case 'trainer':
                // return <TrainerDashboardPage />;
            case 'trainee':
                return <TraineeDashboardPage />;
            default:
                return (
                    <div className="page-container">
                        <div className="section">
                            <div className="card">
                                <p>Unknown user type.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return renderDashboard();
}

export default Dashboard;