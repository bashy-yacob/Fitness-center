// בקובץ: src/pages/Trainee/jsx/PurchaseSubscriptionPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/apiService';
import PaymentModal from '../../../components/PaymentModal'; // שימוש חוזר במודאל שבנינו!
import '../css/PurchaseSubscriptionPage.css'; // ניצור קובץ עיצוב חדש

function PurchaseSubscriptionPage() {
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscriptionTypes = async () => {
            try {
                // קריאה לשרת כדי לקבל את כל סוגי המנויים הזמינים
                const types = await apiService.get('/subscriptions/types');
                setSubscriptionTypes(types.filter(type => type.is_active));
            } catch (err) {
                setError('Failed to load subscription plans.');
                console.error("Error fetching subscription types:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionTypes();
    }, []);

    const handleSelectSubscription = (subscriptionType) => {
        // פתיחת מודאל התשלום עם פרטי המנוי שנבחר
        // שימי לב: אנחנו מעבירים את כל האובייקט כדי שיהיה לנו שם ומחיר
        setSelectedSubscription(subscriptionType);
    };

    const handlePaymentSuccess = () => {
        // לאחר תשלום מוצלח, המודאל יקרא לפונקציה הזו
        alert('Subscription purchased successfully!'); // נודיע למשתמש
        setSelectedSubscription(null); // נסגור את המודאל
        navigate('/subscriptions/manage'); // נחזיר את המשתמש לעמוד ניהול המנוי
    };
    
    // זה הקוד שרץ מהמודאל, אבל הוא מבצע רכישת חוג ולא מנוי
    // נצטרך להתאים את המודאל או ליצור חדש
    const handlePurchase = async (subscriptionId) => {
        try {
            const paymentDetails = {
                transaction_id: `txn_sub_${Date.now()}`,
                status: 'completed'
            };
            const body = {
                subscriptionTypeId: subscriptionId,
                paymentDetails: paymentDetails
            };
            
            // הנה הקריאה הנכונה עם POST!
            await apiService.post('/subscriptions/purchase', body);
            
            handlePaymentSuccess();

        } catch (err) {
            console.error('Failed to purchase subscription:', err);
            setError(err.response?.data?.error || 'Subscription purchase failed.');
        }
    };


    if (loading) return <p className="loading-message">טוען חבילות מנויים...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="purchase-page-container">
            <h1>רכישת מנוי</h1>
            <p className="page-subtitle">בחר את החבילה המתאימה ביותר עבורך</p>
            <div className="packages-grid">
                {subscriptionTypes.map((sub) => (
                    <div key={sub.id} className="package-card">
                        <h3>{sub.name}</h3>
                        <div className="package-price">
                            <span className="currency">₪</span>
                            <span className="amount">{parseFloat(sub.price).toFixed(0)}</span>
                            <span className="period">/ {sub.duration_days} ימים</span>
                        </div>
                        <ul className="package-features">
                            {sub.description.split('\n').map((feature, idx) => (
                                <li key={idx}>✓ {feature}</li>
                            ))}
                        </ul>
                        {/* הכפתור הזה יפתח את מודאל התשלום */}
                        <button
                            className="subscribe-button"
                            onClick={() => handleSelectSubscription(sub)}
                        >
                            רכוש עכשיו
                        </button>
                    </div>
                ))}
            </div>

            {/* כאן אנחנו מציגים את המודאל. הוא יופיע רק כשנבחר מנוי */}
            {selectedSubscription && (
                // בעיה: המודאל הקיים שלנו מותאם לחוגים. נצטרך לשדרג אותו.
                // כרגע, נשתמש בכפתור פשוט כדי לאשר את הרכישה.
                <div className="simple-confirm-modal">
                     <h2>אישור רכישה</h2>
                     <p>האם אתה בטוח שברצונך לרכוש את מנוי "{selectedSubscription.name}"?</p>
                     <button onClick={() => handlePurchase(selectedSubscription.id)}>אשר ושלם</button>
                     <button onClick={() => setSelectedSubscription(null)}>ביטול</button>
                </div>
            )}
        </div>
    );
}

export default PurchaseSubscriptionPage;