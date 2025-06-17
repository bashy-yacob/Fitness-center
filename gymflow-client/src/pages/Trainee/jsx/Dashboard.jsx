// src/pages/Trainee/jsx/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// שלב 1: ייבוא של קומפוננטת ה-Card המשותפת
import Card from '../../components/Card'; 

// שלב 2: ייבוא של הכלים האמיתיים שלך (בעתיד הקרוב נוריד מהם את ההערות)
// import { apiService } from '../../api/apiService'; // נניח שזה שם השירות שלך
// import { useAuth } from '../../context/AuthContext';

import './Dashboard.css'; // חשוב לייבא את קובץ ה-CSScaa085d4bb1fdf3850411072ce34d8b1e68f:gymflow-client/src/pages/Trainee/jsx/Dashboard.jsx

// כאן הייתה קומפוננטת DashboardCard המקומית - היא נמחקה!

const Dashboard = () => {
  const navigate = useNavigate();
  // const { user } = useAuth(); // כך נשתמש בקונטקסט האמיתי
  // const traineeId = user?.id;
  
  const traineeId = '123'; // נשאיר זמנית את ה-ID עד לחיבור מלא לקונטקסט

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!traineeId) {
        setError("לא זוהה משתמש.");
        setLoading(false);
        return;
      }

      try {
        // ----- כאן תהיה קריאת ה-API האמיתית שלך -----
        // const response = await apiService.get(`/dashboard/${traineeId}`);
        // setDashboardData(response.data);
        
        // --- קוד הדמיה זמני, רק כדי שהעמוד לא יהיה ריק עד לחיבור ---
        await new Promise(resolve => setTimeout(resolve, 500));
        setDashboardData({
          subscriptionStatus: 'פעיל',
          subscriptionEndDate: '31/12/2025',
          completedClasses: 15,
        });
        // --- סוף קוד הדמיה ---

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("אירעה שגיאה בטעינת הנתונים. אנא נסה/י שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [traineeId]);

  if (loading) {
    return <div className="loading-message">טוען נתונים...</div>;
  }

  if (error) {
    return <div className="error-message">שגיאה: {error}</div>;
  }

  if (!dashboardData) {
    return <div>לא נמצא מידע עבור לוח הבקרה.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>לוח בקרה</h1>
      
      <div className="cards-grid">
        {/* שלב 3: שימוש בקומפוננטת Card המשותפת */}
        <Card title="סטטוס המנוי">
          <p><strong>מצב:</strong> {dashboardData.subscriptionStatus}</p>
          <p><strong>תוקף עד:</strong> {dashboardData.subscriptionEndDate}</p>
        </Card>
        
        <Card title="חוגים שהושלמו">
          <p className="completed-classes-count">{dashboardData.completedClasses}</p>
        </Card>
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