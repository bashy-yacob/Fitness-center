// בקובץ: src/pages/Trainee/jsx/SubscriptionManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/SubscriptionManagementPage.css';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import Alert from '../../../components/Alert';

// --- פונקציות עזר ---
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// --- קומפוננטת UI קטנה ומעודכנת ---
const CurrentSubscriptionCard = ({ subscription }) => {
    const daysLeft = calculateDaysLeft(subscription?.end_date);

    return (
        <div className="card subscription-card">
            <h2>המנוי הנוכחי שלי</h2>
            {subscription ? (
                <>
                    <p><strong>סוג המנוי:</strong> {subscription.name}</p>
                    <p><strong>תוקף עד:</strong> {formatDate(subscription.end_date)}</p>
                    <p><strong>ימים שנותרו:</strong> {daysLeft} ימים</p>
                    <p><strong>סטטוס:</strong>
                        <span className={`status-badge ${daysLeft > 0 ? 'status-active' : 'status-inactive'}`}>
                            {daysLeft > 0 ? 'פעיל' : 'פג תוקף'}
                        </span>
                    </p>
                </>
            ) : (
                <p>לא נמצא מנוי פעיל.</p>
            )}
        </div>
    );
};

// --- הקומפוננטה הראשית המעודכנת ---
function SubscriptionManagementPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError('');

            try {
                const activeSubscription = await apiService.get('/subscriptions/my-active-subscription');
                setSubscription(activeSubscription);
            } catch (err) {
                console.error("Failed to fetch subscription data:", err);
                setError('אירעה שגיאה בטעינת נתוני המנוי.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    if (loading) {
        return <div className="page-container"><p className="loading-message">טוען מידע על המנוי...</p></div>;
    }
    if (error) {
        return <div className="page-container"><Alert type="error">{error}</Alert></div>;
    }
    
    return (
        <div className="subscription-page-container">
            <h1>ניהול מנוי וחיובים</h1>

            <CurrentSubscriptionCard subscription={subscription} />

            <div className="card actions-card">
                <h2>פעולות נוספות</h2>
                <div className="action-buttons">
                    {/* === כאן השינוי === */}
                    {/* שינינו את הנתיב כדי שיתאים לתוכנית החדשה שלנו */}
                    <Link to="/trainee/subscriptions/pricing" className="action-btn">
    {subscription ? 'חידוש / שדרוג מנוי' : 'רכישת מנוי חדש'}
</Link>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionManagementPage;