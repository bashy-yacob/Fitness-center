// בקובץ: src/pages/Trainee/jsx/PricingPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/apiService';
import { useAuth } from '../../../hooks/useAuth';
import '../css/PricingPage.css'; // קובץ עיצוב חדש

function PricingPage() {
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, setRedirectPath } = useAuth();

    useEffect(() => {
        const fetchSubscriptionTypes = async () => {
            setLoading(true);
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

    // פונקציה זו רק מנווטת לעמוד האישור עם ה-ID של החבילה
  const handleSelectPackage = (packageId) => {
        // בודקים אם המשתמש מחובר
        if (isAuthenticated) {
            // אם כן, מנווטים אותו ישירות לעמוד האישור
            navigate(`/trainee/subscriptions/confirm/${packageId}`);
        } else {
            // אם לא, שומרים את נתיב היעד הרצוי ב-AuthContext
            const targetPath = `/trainee/subscriptions/confirm/${packageId}`;
            setRedirectPath(targetPath);
            // ואז שולחים אותו לעמוד הלוגין
            navigate('/login');
        }
    };
    if (loading) return <div className="page-container"><p className="loading-message">טוען חבילות מנויים...</p></div>;
    if (error) return <div className="page-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="pricing-page-container">
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
                            {/* ודאי של-sub.description יש ערך לפני פיצול */}
                            {sub.description && sub.description.split('\n').map((feature, idx) => (
                                <li key={idx}>✓ {feature}</li>
                            ))}
                        </ul>
                        <button
                            className="select-button"
                            onClick={() => handleSelectPackage(sub.id)}
                        >
                            בחר חבילה
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PricingPage;