// src/pages/Trainee/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { api } from '../../api/apiClient'; // נניח שיש קובץ כזה לניהול API
// import { useAuth } from '../../context/AuthContext'; // בעתיד, כשיהיה קונטקסט
import '../css/Dashboard.css'; // חשוב לייבא את קובץ ה-CSS

// קומפוננטת כרטיס לשימוש חוזר
const DashboardCard = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  // const { user } = useAuth(); // כך נשתמש בקונטקסט בעתיד
  // const traineeId = user?.id;

  const traineeId = '123'; // נשאיר זמנית לצורך הפיתוח

  // ניהול שלושה מצבים: נתונים, טעינה ושגיאה
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // מומלץ להגדיר את הפונקציה הא-סינכרונית בתוך ה-useEffect
    const fetchDashboardData = async () => {
      // אם אין ID של מתאמן, אין טעם לבצע קריאה
      if (!traineeId) {
        setError("לא זוהה משתמש.");
        setLoading(false);
        return;
      }

      try {
        // const response = await api.get(`/dashboard/${traineeId}`);
        // setDashboardData(response.data);

        // הדמיית קריאת API עם עיכוב קטן לחווית טעינה מציאותית
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const mockResponse = {
          subscriptionStatus: 'פעיל',
          subscriptionEndDate: '31/12/2025', // פורמט תאריך ידידותי יותר
          completedClasses: 15,
        };
        setDashboardData(mockResponse);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("אירעה שגיאה בטעינת הנתונים. אנא נסה/י שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [traineeId]); // התלות ב-traineeId מבטיחה שהמידע ייטען מחדש אם המשתמש משתנה

  // הצגת הודעת טעינה
  if (loading) {
    return <div className="loading-message">טוען נתונים...</div>;
  }

  // הצגת הודעת שגיאה
  if (error) {
    return <div className="error-message">שגיאה: {error}</div>;
  }

  // הצגת הודעה אם אין נתונים (לא סביר שיקרה עם הלוגיקה הנוכחית, אבל טוב שיש)
  if (!dashboardData) {
    return <div>לא נמצא מידע עבור לוח הבקרה.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>לוח בקרה</h1>
      
      <div className="cards-grid">
        <DashboardCard title="סטטוס המנוי">
          <p><strong>מצב:</strong> {dashboardData.subscriptionStatus}</p>
          <p><strong>תוקף עד:</strong> {dashboardData.subscriptionEndDate}</p>
        </DashboardCard>
        
        <DashboardCard title="חוגים שהושלמו">
          <p className="completed-classes-count">{dashboardData.completedClasses}</p>
        </DashboardCard>
      </div>

      <div className="quick-actions">
        <h2>פעולות מהירות</h2>
        <button onClick={() => navigate('/classes')}>📅 הרשמה לחוג</button>
        <button onClick={() => navigate('/training-programs')}>🏋️ צפייה בתוכנית האימון</button>
        <button onClick={() => navigate('/messages')}>💬 שליחת הודעה למאמן</button>
      </div>
    </div>
  );
};

export default Dashboard;