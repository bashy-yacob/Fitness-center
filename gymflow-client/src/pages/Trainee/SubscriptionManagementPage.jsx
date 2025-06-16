import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import './SubscriptionManagementPage.css';

// --- הדמיה ---
const useAuth = () => ({ user: { id: '123' } });
const apiService = {
  get: async (url) => {
    await new Promise(res => setTimeout(res, 800));
    if (url.includes('/payments')) {
      return [
        { id: 1, payment_date: new Date(Date.now() - 86400000 * 30).toISOString(), amount: 250, payment_method: 'credit_card', status: 'completed' },
        { id: 2, payment_date: new Date(Date.now() - 86400000 * 60).toISOString(), amount: 250, payment_method: 'credit_card', status: 'completed' }
      ];
    }
    if (url.includes('/user-subscriptions/active')) {
      return { id: 1, name: 'מנוי חודשי', start_date: new Date(Date.now() - 86400000 * 15).toISOString(), end_date: new Date(Date.now() + 86400000 * 15).toISOString(), is_active: true };
    }
    return [];
  }
};

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
                const [subscriptionResponse, paymentsResponse] = await Promise.all([
                    apiService.get(`/user-subscriptions/active/${user.id}`), // נקודת קצה הגיונית למנוי פעיל
                    apiService.get(`/payments/${user.id}`)
                ]);

                setSubscription(subscriptionResponse);
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