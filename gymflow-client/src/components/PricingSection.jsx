// בקובץ: src/components/PricingSection.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// === 1. שינוי הייבוא: משתמשים ב-apiService הגנרי ===
import apiService from '../api/apiService';
import './css/PricingSection.css';

const PricingSection = () => {
  // === 2. שינוי שם המשתנה לבהירות ===
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        setLoading(true);
        // === 3. שינוי קריאת ה-API לנתיב הנכון ===
        const types = await apiService.get('/subscriptions/types');

        const activeTypes = types
          .filter(type => type.is_active)
          .sort((a, b) => a.price - b.price);

        setSubscriptionTypes(activeTypes);
      } catch (err) {
        setError('Failed to load subscription plans.');
        console.error('Error fetching subscription types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionTypes();
  }, []);

  const handleSelectPackage = (packageId) => {
    if (isAuthenticated) {
      // אם מחובר, שלח לעמוד האישור (שניצור בהמשך)
      navigate(`/trainee/subscriptions/confirm/${packageId}`);
    } else {
      // אם לא מחובר, שמור את היעד והפנה ללוגין
      setRedirectPath('/trainee/subscriptions/pricing');
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="pricing-section-loading">טוען חבילות...</div>;
  }

  if (error) {
    return <div className="pricing-section-error">{error}</div>;
  }

  return (
    <section className="pricing-section" id="pricing">
      <h2 className="section-title">תוכניות מחיר</h2>
      <p className="section-subtitle">בחר את החבילה המתאימה לך</p>
      <div className="packages-grid">
        {/* === 4. שינוי שם המשתנה בלולאה === */}
        {subscriptionTypes.map((subType) => (
          <div key={subType.id} className="package-card">
            <h3>{subType.name}</h3>
            <div className="package-price">
              <span className="currency">₪</span>
              <span className="amount">{parseFloat(subType.price).toFixed(0)}</span>
              {/* === 5. התאמת שם השדה ל-duration_days === */}
              <span className="period">/ {subType.duration_days} ימים</span>
            </div>
            <ul className="package-features">
              {/* ודא שהאובייקט כולל תיאור */}
              {(subType.description || '').split('\n').map((feature, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className="subscribe-button"
              onClick={() => handleSelectPackage(subType.id)}
            >
              הצטרף עכשיו
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;