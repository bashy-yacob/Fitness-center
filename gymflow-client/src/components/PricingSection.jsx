// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { pricingPackageService } from '../api/pricingPackageService';
// import './PricingSection.css';

// const PricingSection = () => {
//   const [pricingPackages, setPricingPackages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPricingPackages();
//   }, []);

//   const fetchPricingPackages = async () => {
//     try {
//       const packages = await pricingPackageService.getAllPricingPackages();
//       // Sort packages by price for consistent display
//       setPricingPackages(packages.sort((a, b) => a.price - b.price));
//     } catch (err) {
//       setError('Failed to load pricing packages');
//       console.error('Error fetching pricing packages:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleSubscribe = async (packageId) => {
//     if (!isAuthenticated) {
//       setRedirectPath('/pricing');
//       navigate('/login');
//       return;
//     }

//     try {
//       // You would typically integrate with a payment gateway here
//       const paymentDetails = {
//         // Add payment gateway specific details
//         status: 'pending'
//       };

//       await pricingPackageService.purchaseSubscription(packageId, paymentDetails);
//       // Handle successful subscription
//       navigate('/dashboard');
//     } catch (error) {
//       console.error('Error subscribing to package:', error);
//       setError('Failed to process subscription');
//     }
//   };

//   if (loading) {
//     return <div className="pricing-section-loading">Loading pricing packages...</div>;
//   }

//   if (error) {
//     return <div className="pricing-section-error">{error}</div>;
//   }

//   return (
//     <section className="pricing-section" id="pricing">
//       <h2 className="section-title">תוכניות מחיר</h2>
//       <p className="section-subtitle">בחר את החבילה המתאימה לך</p>
//       <div className="packages-grid">
//         {pricingPackages.map((pkg, index) => (
//           <div
//             key={pkg.id || index}
//             className={`package-card ${pkg.recommended ? 'recommended' : ''}`}
//           >
//             {pkg.recommended && <div className="recommended-badge">הכי פופולרי!</div>}
//             <h3>{pkg.name}</h3>
//             <div className="package-price">
//               <span className="currency">₪</span>
//               <span className="amount">{pkg.price}</span>
//               <span className="period">/ חודש</span>
//             </div>
//             <ul className="package-features">
//               {pkg.features.map((feature, idx) => (
//                 <li key={idx}>
//                   <span className="check-icon">✓</span>
//                   {feature}
//                 </li>
//               ))}
//             </ul>
//             <button
//               className="subscribe-button"
//               onClick={() => handleSubscribe(pkg.id)}
//             >
//               הצטרף עכשיו
//             </button>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default PricingSection;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pricingPackageService } from '../api/pricingPackageService'; // ייבוא השירות החדש
import './PricingSection.css';

const PricingSection = () => {
  const [pricingPackages, setPricingPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, setRedirectPath } = useAuth(); // הוספת setRedirectPath
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPricingPackages = async () => {
      try {
        setLoading(true);
        const packages = await pricingPackageService.getAllPricingPackages();
        // נסנן רק חבילות פעילות ונמיין לפי מחיר
        const activePackages = packages
          .filter(pkg => pkg.is_active)
          .sort((a, b) => a.price - b.price);
        
        setPricingPackages(activePackages);
      } catch (err) {
        setError('Failed to load pricing packages');
        console.error('Error fetching pricing packages:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricingPackages();
  }, []);

  const handleSubscribe = async (packageId) => {
    if (!isAuthenticated) {
      // כאן אנו שומרים את הנתיב שאליו המשתמש רצה להגיע
      setRedirectPath(window.location.pathname); // או '/pricing' אם תרצה
      navigate('/login');
      return;
    }

    try {
      // בעתיד, כאן תהיה אינטגרציה עם ספק תשלומים
      const paymentDetails = {
        transaction_id: `txn_${Date.now()}`,
        status: 'completed' // כרגע נסמן שהצליח לצורך הדגמה
      };

      await pricingPackageService.purchaseSubscription(packageId, paymentDetails);
      alert('Subscription purchased successfully!');
      navigate('/dashboard'); // נשלח את המשתמש לדשבורד לאחר רכישה מוצלחת
    } catch (error) {
      console.error('Error subscribing to package:', error);
      setError('Failed to process subscription');
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
        {pricingPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card`} // הסרנו את הלוגיקה של 'recommended' זמנית
          >
            <h3>{pkg.name}</h3>
            <div className="package-price">
              <span className="currency">₪</span>
              <span className="amount">{parseFloat(pkg.price).toFixed(0)}</span>
              {/* מציגים חודשים במקום חודש קבוע */}
              <span className="period">/ {pkg.duration_months} חודשים</span>
            </div>
            <ul className="package-features">
              {/* משתמשים ב-description מה-API */}
              {pkg.description.split('\n').map((feature, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className="subscribe-button"
              onClick={() => handleSubscribe(pkg.id)}
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