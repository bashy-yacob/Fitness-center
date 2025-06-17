// import React from 'react';
// import { useAuth } from '../hooks/useAuth';

// // רכיבים פונקציונליים פשוטים שמחזירים אלמנטים
// const AdminDashboard = () => React.createElement('div', null, 
//     React.createElement('h2', null, 'Admin Dashboard'),
//     React.createElement('p', null, 'Manage Users, Classes, and Subscriptions.')
// );
// const TrainerDashboard = () => React.createElement('div', null,
//     React.createElement('h2', null, 'Trainer Dashboard'),
//     React.createElement('p', null, 'Manage your classes and trainees.')
// );
// const TraineeDashboard = () => React.createElement('div', null,
//     React.createElement('h2', null, 'Trainee Dashboard'),
//     React.createElement('p', null, 'View your schedule and register for classes.')
// );

// function Dashboard() {
//     const { user } = useAuth();

//     if (!user) {
//         return React.createElement('p', null, 'Loading...');
//     }

//     const renderDashboard = () => {
//         switch (user.user_type) {
//             case 'admin':
//                 return React.createElement(AdminDashboard);
//             case 'trainer':
//                 return React.createElement(TrainerDashboard);
//             case 'trainee':
//                 return React.createElement(TraineeDashboard);
//             default:
//                 return React.createElement('p', null, 'Unknown user type.');
//         }
//     };

//     return React.createElement('div', null,
//         React.createElement('h1', null, 'Dashboard'),
//         renderDashboard()
//     );
// }

// export default Dashboard;

// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import TraineeDashboardPage from './Trainee/jsx/Dashboard.jsx'// Import the new component

const AdminDashboard = () => (
    <div className="page-container">
        <div className="section">
            <h2>Admin Dashboard</h2>
            <div className="card">
                <p>Manage Users, Classes, and Subscriptions.</p>
            </div>
        </div>
    </div>
);

const TrainerDashboard = () => (
    <div className="page-container">
        <div className="section">
            <h2>Trainer Dashboard</h2>
            <div className="card">
                <p>Manage your classes and trainees.</p>
            </div>
        </div>
    </div>
);

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
                return <AdminDashboard />;
            case 'trainer':
                return <TrainerDashboard />;
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