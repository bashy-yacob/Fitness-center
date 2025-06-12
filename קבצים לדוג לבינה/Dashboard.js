import React from 'react';
import { useAuth } from '../hooks/useAuth';

// רכיבים פונקציונליים פשוטים שמחזירים אלמנטים
const AdminDashboard = () => React.createElement('div', null, 
    React.createElement('h2', null, 'Admin Dashboard'),
    React.createElement('p', null, 'Manage Users, Classes, and Subscriptions.')
);
const TrainerDashboard = () => React.createElement('div', null,
    React.createElement('h2', null, 'Trainer Dashboard'),
    React.createElement('p', null, 'Manage your classes and trainees.')
);
const TraineeDashboard = () => React.createElement('div', null,
    React.createElement('h2', null, 'Trainee Dashboard'),
    React.createElement('p', null, 'View your schedule and register for classes.')
);

function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return React.createElement('p', null, 'Loading...');
    }

    const renderDashboard = () => {
        switch (user.user_type) {
            case 'admin':
                return React.createElement(AdminDashboard);
            case 'trainer':
                return React.createElement(TrainerDashboard);
            case 'trainee':
                return React.createElement(TraineeDashboard);
            default:
                return React.createElement('p', null, 'Unknown user type.');
        }
    };

    return React.createElement('div', null,
        React.createElement('h1', null, 'Dashboard'),
        renderDashboard()
    );
}

export default Dashboard;