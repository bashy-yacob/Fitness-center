import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';


// todo אני רוצה להוסיף שכל פעם שמישהו רוצה הלתחבר אז אחרי הרישום הוא יחזור לאן שהוא רצה להגיע לפני הרישום
//todo אולה יש אפשרות בכל פעם שלוחצים על קישור ישלח לפונקציה גלובלית על מה הוא לחץ
//todo כלומר למה הוא רוצה להרשם ואז הוא ישלח אותו לרישום ויחזור וישלח אותו לאן שהוא רצה להגיע
const LandingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = React.useState(null);

  const features = [
    {
      icon: '💪',
      title: 'ציוד מתקדם',
      description: 'הציוד החדיש והמתקדם ביותר בתעשייה, מותאם לכל רמות האימון'
    },
    {
      icon: '👥',
      title: 'מאמנים מוסמכים',
      description: 'צוות מאמנים מקצועי עם ניסיון של שנים בליווי אישי'
    },
    {
      icon: '🎯',
      title: 'אימונים מותאמים אישית',
      description: 'תוכנית אימונים מותאמת למטרות ולקצב ההתקדמות שלך'
    },
    {
      icon: '⏰',
      title: 'פתוח 24/7',
      description: 'גישה למכון בכל שעה, כל יום, כולל סופי שבוע וחגים'
    },
    {
      icon: '📱',
      title: 'אפליקציה חכמה',
      description: 'מעקב אחר ההתקדמות והזמנת שיעורים דרך האפליקציה'
    },
    {
      icon: '🥤',
      title: 'בר משקאות בריאות',
      description: 'שייקים, מיצים טבעיים ותוספי תזונה מותאמים אישית'
    }
  ];
// todo  זה מידע שצריך להכנס לבסיס הנתונים ולשלוף אותו משם
  const classes = [
    {
      name: 'יוגה ופילאטיס',
      image: 'kelly-sikkema-IZOAOjvwhaM-unsplash.jpg',
      description: 'שיפור הגמישות והיציבה עם המדריכים הטובים ביותר',
      schedule: '6:00-22:00 | א-ו'
    },
    {
      name: 'אימוני כוח',
      image: 'samuel-girven-VJ2s0c20qCo-unsplash.jpg',
      description: 'בניית שריר וחיזוק הגוף עם מאמנים מקצועיים',
      schedule: '24/7 | כל השבוע'
    },
    {
      name: 'אירובי ו-HIIT',
      image: 'alora-griffiths-zEAX0E0KJxs-unsplash.jpg',
      description: 'שריפת קלוריות ושיפור סיבולת לב-ריאה',
      schedule: '7:00-21:00 | א-ו'
    }
  ];
// todo  זה מידע שצריך להכנס לבסיס הנתונים ולשלוף אותו משם
  const packages = [
    {
      name: 'בסיסי',
      price: '199',
      features: ['גישה לאזור המשקולות', 'אזור הקרדיו','כניסה חופשית', 'שירותים ומלתחות'],
      recommended: false
    },
    {
      name: 'פרימיום',
      price: '299',
      features: ['כל התכונות של הבסיסי', 'כל השיעורים הקבוצתיים', 'ייעוץ תזונה חודשי', 'חניה חינם'],
      recommended: true
    },
    {
      name: 'VIP',
      price: '499',
      features: ['כל התכונות של הפרימיום', '2 אימונים אישיים בחודש', 'ליווי תזונאי צמוד', 'טיפולי ספא חודשיים'],
      recommended: false
    }
  ];

  const faqs = [
    {
      question: "איך מתחילים להתאמן?",
      answer: "פשוט מאוד! נרשמים באתר, קובעים פגישת היכרות עם מאמן אישי שיבנה עבורכם תוכנית אימונים מותאמת אישית, ומתחילים להתאמן. המאמן ילווה אתכם בצעדים הראשונים ויוודא שאתם מבצעים את התרגילים בצורה נכונה ובטוחה."
    },
    {
      question: "האם יש חניה במקום?",
      answer: "כן, יש לנו חניון גדול וחינם ללקוחות המכון. בנוסף, אנחנו ממוקמים במרחק הליכה מתחנת האוטובוס."
    },
    {
      question: "מה כוללת החברות במכון?",
      answer: "החברות כוללת גישה לכל מתקני המכון, כולל אזור המשקולות, אזור הקרדיו, ומלתחות. בחבילת הפרימיום מקבלים גם גישה לכל השיעורים הקבוצתיים וייעוץ תזונה חודשי."
    },
    {
      question: "האם אפשר לבטל מנוי?",
      answer: "כן, ניתן לבטל את המנוי בכל עת עם הודעה מראש של 30 יום. אנחנו מאמינים בגמישות ובשירות ללא התחייבות ארוכת טווח."
    },
    {
      question: "האם יש מקלחות ולוקרים?",
      answer: "כן, המכון מצויד במלתחות מודרניות עם מקלחות, לוקרים אישיים, ומייבשי שיער. הלוקרים מופעלים באמצעות אפליקציית המכון."
    },
    {
      question: "האם מתאים למתחילים?",
      answer: "בהחלט! הצוות שלנו מיומן בעבודה עם מתאמנים בכל הרמות, כולל מתחילים לגמרי. נבנה יחד איתכם תוכנית הדרגתית שתתאים לרמתכם ולמטרות שלכם."
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>ברוכים הבאים ל-GymFlow</h1>
          <p className="hero-subtitle">הדרך שלך לכושר מושלם מתחילה כאן</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              הצטרף עכשיו
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              התחבר
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <h2>למה לבחור בנו?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Classes Section */}
      <section className="classes-section section">
        <h2>השיעורים שלנו</h2>
        <div className="classes-grid">
          {classes.map((classItem, index) => (
            <div key={index} className="class-card card">
              <div 
                className="class-image" 
                style={{ backgroundImage: `url(/images/${classItem.image})` }}
              >
                <div className="class-overlay">
                  <h3 className='h3-card'>{classItem.name}</h3>
                  <p>{classItem.description}</p>
                  <Link to="/register" className="btn btn-primary">
                    הרשם עכשיו
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages Section */}
      <section className="packages-section section">
        <h2>חבילות מחיר</h2>
        <p className="section-subtitle">בחר את החבילה המתאימה לך</p>
        <div className="packages-grid">
          {packages.map((pkg, index) => (
            <div key={index} className={`package-card ${pkg.recommended ? 'recommended' : ''}`}>
              {pkg.recommended && <div className="recommended-badge">הכי פופולרי!</div>}
              <h3>{pkg.name}</h3>
              <div className="package-price">
                <span className="currency">₪</span>
                <span className="amount">{pkg.price}</span>
                <span className="period">/ חודש</span>
              </div>
              <ul className="package-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`btn ${pkg.recommended ? 'btn-primary' : 'btn-outline'}`}>
                הרשמה עכשיו
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section section">
        <h2>מה אומרים המתאמנים שלנו</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card card">
            <div className="testimonial-content">
              <p>"המאמנים המקצועיים והאווירה הנהדרת גורמים לי לרצות להגיע כל יום למכון!"</p>
              <footer>- דנה כהן</footer>
            </div>
          </div>
          <div className="testimonial-card card">
            <div className="testimonial-content">
              <p>"התוצאות שהשגתי ב-GymFlow עולות על כל הציפיות שלי. ממליץ בחום!"</p>
              <footer>- יוסי לוי</footer>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <h2>שאלות נפוצות</h2>
        <p className="section-subtitle">כל מה שרציתם לדעת על GymFlow</p>
        
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="faq-card" 
              data-open={openFaqIndex === index}
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-icon">{openFaqIndex === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer" style={{ maxHeight: openFaqIndex === index ? '500px' : '0' }}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>מוכנים להתחיל?</h2>
          <p>הצטרפו אלינו עוד היום והתחילו את המסע שלכם לחיים בריאים יותר</p>
          <Link to="/register" className="btn btn-primary btn-large">
            הצטרף עכשיו
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
