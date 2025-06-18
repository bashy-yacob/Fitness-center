import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/SubscriptionManagementPage.css';

// --- פונקציות עזר ---
const formatDate = (isoString) => new Date(isoString).toLocaleDateString('he-IL');
const formatCurrency = (number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(number);

// --- קומפוננטות UI קטנות ---
const CurrentSubscriptionCard = ({ subscription }) => (
    <div className="card subscription-card">
        <h2>המנוי הנוכחי שלי</h2>
        {subscription ? (
            <>
                <p><strong>סוג:</strong> {subscription.name}</p>
                <p><strong>תיאור:</strong> {subscription.description}</p>
                <p><strong>מחיר:</strong> {formatCurrency(subscription.price)}</p>
                <p><strong>משך:</strong> {subscription.duration_months} חודשים</p>
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

const PaymentHistoryTable = ({ payments }) => (
    <div className="card">
        <h2>היסטוריית תשלומים</h2>
        {payments.length > 0 ? (
            <table className="payment-history-table">
                <thead>
                    <tr>
                        <th>תאריך</th>
                        <th>סכום</th>
                        <th>אמצעי תשלום</th>
                        <th>סטטוס</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id}>
                            <td>{formatDate(p.payment_date)}</td>
                            <td>{formatCurrency(p.amount)}</td>
                            <td>{p.payment_method}</td>
                            <td>
                                <span className={`status-badge status-${p.status}`}>
                                    {p.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p>לא נמצאה היסטוריית תשלומים.</p>
        )}
    </div>
);

// --- הקומפוננטה הראשית ---
function SubscriptionManagementPage() {
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user?.id) return;
            try {
                // שימוש ב-Promise.all להרצת קריאות במקביל
                const [subscriptionsArray, paymentsResponse] = await Promise.all([
                    apiService.get(`/api/subscriptions/my-subscriptions`),
                    apiService.get(`/api/payments/user/${user.id}`)
                ]);

                let activeSubscription = null;
                if (subscriptionsArray && subscriptionsArray.length > 0) {
                    // Prioritize subscriptions marked as is_active
                    activeSubscription = subscriptionsArray.find(sub => sub.is_active === true);

                    if (!activeSubscription) {
                        // Fallback: find the latest subscription that hasn't ended
                        const now = new Date();
                        const sortedSubscriptions = subscriptionsArray
                            .filter(sub => new Date(sub.end_date) > now) // Filter out expired subscriptions
                            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date)); // Sort by most recent start_date

                        if (sortedSubscriptions.length > 0) {
                            activeSubscription = sortedSubscriptions[0];
                        }
                    }
                }
                setSubscription(activeSubscription);
                setPayments(paymentsResponse);

            } catch (err) {
                setError('אירעה שגיאה בטעינת נתוני המנוי.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    if (loading) return <p className="loading-message">טוען מידע על המנוי...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="subscription-page-container">
            <h1>ניהול מנוי וחיובים</h1>

            <CurrentSubscriptionCard subscription={subscription} />
            <PaymentHistoryTable payments={payments} />

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