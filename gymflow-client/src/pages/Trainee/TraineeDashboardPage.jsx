// // src/pages/TraineeDashboardPage.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { Link } from 'react-router-dom';

// function TraineeDashboardPage() {
//     const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//     const [classesAttended, setClassesAttended] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const { user } = useAuth();

//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             try {
//                 setLoading(true);
//                 const userId = user.id;

//                 // Fetch classes attended
//                 const attendedClasses = await fetch(`/api/users/${userId}/attended-classes`, {
//                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Include JWT
//                 });
//                 if (!attendedClasses.ok) throw new Error('Failed to fetch attended classes');
//                 const attendedClassesData = await attendedClasses.json();
//                 setClassesAttended(attendedClassesData.count);

//                 // Fetch subscription status
//                 const subscription = await fetch(`/api/users/${userId}/active-subscription`, {
//                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Include JWT
//                 });
//                 if (!subscription.ok) throw new Error('Failed to fetch subscription');
//                 const subscriptionData = await subscription.json();
//                 setSubscriptionStatus(subscriptionData);

//             } catch (err) {
//                 setError('Failed to load dashboard data. Please try again.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (user) {
//             fetchDashboardData();
//         }
//     }, [user]);

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         return new Date(dateString).toLocaleDateString();
//     };

//     if (loading) {
//         return React.createElement('p', null, 'Loading dashboard data...');
//     }

//     if (error) {
//         return React.createElement('p', { style: { color: 'red' } }, error);
//     }

//     return React.createElement('div', { style: { padding: '20px' } },
//         React.createElement('h1', null, 'Trainee Dashboard'),

//         React.createElement('div', { style: { marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' } },
//             React.createElement('h2', null, 'Subscription Status'),
//             subscriptionStatus ?
//                 React.createElement('div', null,
//                     React.createElement('p', null, `Subscription Type: ${subscriptionStatus.subscription_name}`),
//                     React.createElement('p', null, `Expires: ${formatDate(subscriptionStatus.end_date)}`)
//                 ) :
//                 React.createElement('p', null, 'No active subscription')
//         ),

//         React.createElement('div', { style: { marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' } },
//             React.createElement('h2', null, 'Classes Attended'),
//             React.createElement('p', null, `You have attended ${classesAttended} classes!`)
//         ),

//         React.createElement('div', { style: { display: 'flex', gap: '20px' } },
//             React.createElement(Link, { to: '/classes', style: { padding: '10px 15px', background: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '5px' } }, 'Register for a Class'),
//             React.createElement(Link, { to: '/my-schedule', style: { padding: '10px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' } }, 'View My Schedule'),
//             React.createElement('a', { href: '/contact-trainer', style: { padding: '10px 15px', background: '#dc3545', color: 'white', textDecoration: 'none', borderRadius: '5px' } }, 'Contact Trainer (Not Implemented)')
//         )
//     );
// }

// export default TraineeDashboardPage;

// src/pages/TraineeDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

function TraineeDashboardPage() {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [classesAttended, setClassesAttended] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const userId = user.id;

                // Fetch classes attended
                const attendedClasses = await fetch(`/api/users/${userId}/attended-classes`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Include JWT
                });
                if (!attendedClasses.ok) throw new Error('Failed to fetch attended classes');
                const attendedClassesData = await attendedClasses.json();
                // attendedClassesData = await attendedClasses.json();

                if (attendedClassesData && typeof attendedClassesData.count === 'number') {
                    setClassesAttended(attendedClassesData.count);
                } else {
                    console.warn("Invalid attendedClassesData received:", attendedClassesData);
                    setError("Failed to load attended classes data.");
                    setClassesAttended(0); // ערך ברירת מחדל
                }

                // Fetch subscription status
                const subscription = await fetch(`/api/users/${userId}/active-subscription`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Include JWT
                });
                if (!subscription.ok) throw new Error('Failed to fetch subscription');
                const subscriptionData = await subscription.json();
                setSubscriptionStatus(subscriptionData);

            } catch (err) {
                setError('Failed to load dashboard data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <p>Loading dashboard data...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Trainee Dashboard</h1>

            <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h2>Subscription Status</h2>
                {subscriptionStatus ? (
                    <div>
                        <p>Subscription Type: {subscriptionStatus.subscription_name}</p>
                        <p>Expires: {formatDate(subscriptionStatus.end_date)}</p>
                    </div>
                ) : (
                    <p>No active subscription</p>
                )}
            </div>

            <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h2>Classes Attended</h2>
                <p>You have attended {classesAttended} classes!</p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/classes" style={{ padding: '10px 15px', background: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Register for a Class</Link>
                <Link to="/my-schedule" style={{ padding: '10px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>View My Schedule</Link>
                <a href="/contact-trainer" style={{ padding: '10px 15px', background: '#dc3545', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Contact Trainer (Not Implemented)</a>
            </div>
        </div>
    );
}

export default TraineeDashboardPage;