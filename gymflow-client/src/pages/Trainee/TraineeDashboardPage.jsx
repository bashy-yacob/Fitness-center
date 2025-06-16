// src/pages/TraineeDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js'; // Adjust the import path as necessary
import { Link } from 'react-router-dom';
import apiService from '../../api/apiService.js';

function TraineeDashboardPage() {
    // const [subscriptionStatus, setSubscriptionStatus] = useState(null);
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
                // const attendedClassesResponse = await fetch(`/api/users/${userId}/attended-classes`, {
                const attendedClassesResponse = await apiService.get(`/users/${userId}/attended-classes`);
                setClassesAttended(attendedClassesResponse.count);

                // const subscriptionResponse = await apiService.get(`/users/${userId}/active-subscription`);
                // setSubscriptionStatus(subscriptionResponse);

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
                {/* {subscriptionStatus ? (
                    <div>
                        <p>Subscription Type: {subscriptionStatus.subscription_name}</p>
                        <p>Expires: {formatDate(subscriptionStatus.end_date)}</p>
                    </div>
                ) : (
                    <p>No active subscription</p>
                )} */}
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