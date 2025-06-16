import React, { useState, useEffect } from 'react';
import apiService from '../../api/apiService'; // הנתיב לקובץ apiService
import { useAuth } from '../../hooks/useAuth'; // אם צריך פרטי משתמש מחובר
import { Link } from 'react-router-dom';

function SubscriptionManagementPage() {
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // גישה לפרטי המשתמש המחובר

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            try {
                setLoading(true);
                // קבלת היסטוריית תשלומים
                const paymentData = await apiService.get(`/payments/${user.id}`);
                setPaymentHistory(paymentData);

                // קבלת פרטי מנוי נוכחי
                // כאן יש להניח שיש נקודת קצה מתאימה בשרת
                // לדוגמה: /subscriptions/my-subscription
                // או שאפשר לחשב את המנוי הפעיל מתוך היסטוריית המנויים
                const subscriptionData = await apiService.get('/subscriptions/my-subscriptions');
                setCurrentSubscription(subscriptionData[0] || null); // מניחים שהשרת מחזיר מערך
            } catch (err) {
                setError(err.message || 'Failed to load subscription data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user.id]);

    // פונקציות עזר לעיצוב תאריכים ומספרים
    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString();
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(number);
    };

    // ----- רכיבי UI -----

    if (loading) {
        return <p>Loading subscription information...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Subscription Management</h1>

            {/* מידע על המנוי הנוכחי */}
            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Current Subscription</h2>
                {currentSubscription ? (
                    <>
                        <p><strong>Type:</strong> {currentSubscription.name}</p>
                        <p><strong>Start Date:</strong> {formatDate(currentSubscription.start_date)}</p>
                        <p><strong>End Date:</strong> {formatDate(currentSubscription.end_date)}</p>
                        <p><strong>Status:</strong> {currentSubscription.is_active ? 'Active' : 'Inactive'}</p>
                    </>
                ) : (
                    <p>No active subscription found.</p>
                )}
            </div>

            {/* היסטוריית תשלומים */}
            <div>
                <h2>Payment History</h2>
                {paymentHistory.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeaderStyle}>Date</th>
                                <th style={tableHeaderStyle}>Amount</th>
                                <th style={tableHeaderStyle}>Method</th>
                                <th style={tableHeaderStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map(payment => (
                                <tr key={payment.id}>
                                    <td style={tableCellStyle}>{formatDate(payment.payment_date)}</td>
                                    <td style={tableCellStyle}>{formatCurrency(payment.amount)}</td>
                                    <td style={tableCellStyle}>{payment.payment_method}</td>
                                    <td style={tableCellStyle}>{payment.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No payment history found.</p>
                )}
            </div>

            {/* אפשרויות רכישה/חידוש מנוי */}
            <div style={{ marginTop: '20px' }}>
                <Link to="/subscriptions/list">
                    <button style={buttonStyle}>
                        {currentSubscription ? 'Renew Subscription' : 'Purchase Subscription'}
                    </button>
                </Link>
                {currentSubscription && (
                    <Link to="/subscriptions/upgrade">
                        <button style={buttonStyle}>Upgrade Subscription</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

// ----- סגנונות CSS (אפשר להעביר לקובץ CSS נפרד) -----
const tableHeaderStyle = {
    backgroundColor: '#f2f2f2',
    padding: '8px',
    borderBottom: '1px solid #ddd',
    textAlign: 'left'
};

const tableCellStyle = {
    padding: '8px',
    borderBottom: '1px solid #ddd'
};

const buttonStyle = {
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
    borderRadius: '5px'
};

export default SubscriptionManagementPage;