
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/apiService.js';
import { useAuth } from '../../../hooks/useAuth.js';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const traineeId = user?.id;

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
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
       
        const response = await apiService.get(`/trainees/dashboard/${traineeId}`);

       
        const serverData = response.data;

        const formattedData = {
          subscriptionStatus: serverData.active_subscription ? 'פעיל' : 'לא פעיל',
          subscriptionEndDate: serverData.active_subscription ? new Date(serverData.active_subscription.end_date).toLocaleDateString('he-IL') : 'N/A',
          completedClasses: serverData.attended_classes,
          // אפשר להוסיף כאן גם נתונים נוספים אם רוצים, למשל:
          // upcomingClasses: serverData.upcoming_classes 
        };
        setDashboardData(formattedData);

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
          {/* עכשיו הקוד הזה יעבוד עם הנתונים החדשים */}
          <div className="card"> {/* החלפתי ב-div פשוט כי קוד Card לא סופק */}
            <h3>סטטוס המנוי</h3>
            <p><strong>מצב:</strong> {dashboardData.subscriptionStatus}</p>
            <p><strong>תוקף עד:</strong> {dashboardData.subscriptionEndDate}</p>
          </div>
          
          <div className="card">
             <h3>חוגים שהושלמו</h3>
            <p className="completed-classes-count">{dashboardData.completedClasses}</p>
          </div>
        </div>
  
        <div className="quick-actions">
          <h2>פעולות מהירות</h2>
          <button onClick={() => navigate('/trainee/classes')}>📅 הרשמה לחוג</button>
          <button onClick={() => navigate('/trainee/training-program')}>🏋️ צפייה בתוכנית האימון</button>
          <button onClick={() => navigate('/trainee/messages')}>💬 שליחת הודעה למאמן</button>
        </div>
      </div>
    );
};

export default Dashboard;