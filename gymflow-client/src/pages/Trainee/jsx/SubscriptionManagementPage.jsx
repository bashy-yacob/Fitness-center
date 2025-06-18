import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/SubscriptionManagementPage.css';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';

// --- פונקציות עזר ---
const formatDate = (isoString) => new Date(isoString).toLocaleDateString('he-IL');

// --- קומפוננטות UI קטנות ---
const CurrentSubscriptionCard = ({ subscription }) => (
    <div className="card subscription-card">
        <h2>המנוי הנוכחי שלי</h2>
        {subscription ? (
            <>
                <p><strong>סוג:</strong> {subscription.name}</p>
                <p><strong>תאריך התחלה:</strong> {formatDate(subscription.start_date)}</p>
                <p><strong>תאריך סיום:</strong> {formatDate(subscription.end_date)}</p>
                <p><strong>סטטוס:</strong> 
                    <span className={`status-badge ${subscription.is_active ? 'status-active' : 'status-inactive'}`}>
                        {subscription.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                </p>
            </>
        ) : (
            <p>לא נמצא מנוי פעיל.</p>
        )}
    </div>
);

// --- הקומפוננטה הראשית ---
function SubscriptionManagementPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user?.id) {
                setLoading(false); // Stop loading if no user ID
                return;
            }
            setLoading(true);
            try {
                const subscriptionResponse = await apiService.get(`/users/${user.id}/active-subscription`);
                setSubscription(subscriptionResponse);
            } catch (err) {
                 // If API returns 404 or similar for no active subscription, it might be caught here.
                 // Assuming apiService might return a specific status or error that indicates "not found" vs. a server error.
                if (err.response && err.response.status === 404) {
                    setSubscription(null); // Explicitly set to null if not found
                    setError(''); // Clear any previous server errors
                } else {
                    setError('אירעה שגיאה בטעינת נתוני המנוי.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    if (loading) return <p className="loading-message">טוען מידע על המנוי...</p>;
    // Error message will be shown if actual error occurs, not for "no subscription"
    if (error && !subscription) return <p className="error-message">{error}</p>;
    // If there's an error but we have some stale subscription data, we might still show it, or prioritize error.
    // For now, if 'error' state is set, it means a real fetch error, not a "no subscription" case.

    return (
        <div className="subscription-page-container">
            <h1>ניהול מנוי וחיובים</h1>

            <CurrentSubscriptionCard subscription={subscription} />
            {/* PaymentHistoryTable removed as per subtask scope */}

            <div className="card actions-card">
                <h2>פעולות נוספות</h2>
                <div className="action-buttons">
                    <Link to="/subscriptions/list" className="action-btn">
                        {subscription ? 'חידוש / שדרוג מנוי' : 'רכישת מנוי חדש'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionManagementPage;