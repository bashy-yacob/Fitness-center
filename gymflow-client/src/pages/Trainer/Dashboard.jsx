// src/pages/trainer/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import { useAuth } from '../../hooks/useAuth';
import  apiService  from '../../api/apiService';
import './Dashboard.css';

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayClasses: [],
    upcomingClasses: [],
    activeTrainees: 0,
    notifications: [],
    stats: {
      totalTrainees: 0,
      averageAttendance: 0,
      completedClasses: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setError('משתמש לא מזוהה');
        setLoading(false);
        return;
      }

      try {
        const [dashboardResponse, statsResponse] = await Promise.all([
          apiService.get(`/trainer/${user.id}/dashboard`),
          apiService.get(`/trainer/${user.id}/stats`)
        ]);

        setDashboardData({
          todayClasses: dashboardResponse.todayClasses || [],
          upcomingClasses: dashboardResponse.upcomingClasses || [],
          activeTrainees: dashboardResponse.activeTrainees || 0,
          notifications: dashboardResponse.notifications || [],
          stats: statsResponse || {
            totalTrainees: 0,
            averageAttendance: 0,
            completedClasses: 0
          }
        });
      } catch (err) {
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שנית.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>טוען את לוח הבקרה...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        נסה שנית
      </button>
    </div>
  );

  const { todayClasses, upcomingClasses, activeTrainees, notifications, stats } = dashboardData;

  return (
    <div className="trainer-dashboard-container">
      <header className="dashboard-header">
        <h1>שלום, {user?.name || 'מאמן'}</h1>
        <p className="current-date">{new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="stats-grid">
        <Card title="מתאמנים פעילים" className="stat-card">
          <p className="stat-number">{activeTrainees}</p>
          <p className="stat-label">סה״כ מתאמנים רשומים: {stats.totalTrainees}</p>
        </Card>
        
        <Card title="שיעורים להיום" className="stat-card">
          <p className="stat-number">{todayClasses.length}</p>
          <p className="stat-label">מתוך {upcomingClasses.length} שיעורים השבוע</p>
        </Card>

        <Card title="סטטיסטיקה" className="stat-card">
          <p className="stat-detail">אחוז נוכחות ממוצע: {stats.averageAttendance}%</p>
          <p className="stat-detail">שיעורים שהועברו: {stats.completedClasses}</p>
        </Card>
      </div>

      <div className="dashboard-content">
        <section className="upcoming-classes">
          <h2>השיעורים הקרובים שלך</h2>
          <div className="classes-list">
            {todayClasses.map(classItem => (
              <Card key={classItem.id} className="class-card">
                <div className="class-time">{new Date(classItem.startTime).toLocaleTimeString('he-IL')}</div>
                <h3>{classItem.name}</h3>
                <p>{classItem.registeredCount} משתתפים</p>
              </Card>
            ))}
          </div>
        </section>

        <aside className="notifications-section">
          <Card title="התראות אחרונות" className="notifications-card">
            {notifications.length > 0 ? (
              <ul className="notifications-list">
                {notifications.map(note => (
                  <li key={note.id} className="notification-item">
                    <p>{note.text}</p>
                    <small>{new Date(note.timestamp).toLocaleString('he-IL')}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-notifications">אין התראות חדשות</p>
            )}
          </Card>
        </aside>
      </div>

      <div className="quick-actions">
        <button onClick={() => navigate('/trainer/classes')} className="action-button">
          ניהול שיעורים
        </button>
        <button onClick={() => navigate('/trainer/messages')} className="action-button">
          הודעות
          {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
        </button>
        <button onClick={() => navigate('/trainer/trainees')} className="action-button">
          ניהול מתאמנים
        </button>
        <button onClick={() => navigate('/trainer/schedule')} className="action-button">
          לוח זמנים
        </button>
      </div>
    </div>
  );
};

export default TrainerDashboard;