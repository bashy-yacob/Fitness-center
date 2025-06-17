// src/pages/trainer/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card.jsx'; // <-- מייבאים את הקומפוננטה המשותפת
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import './Dashboard.css'; // קובץ CSS ייעודי לעמוד הזה

// --- הדמיה ---
const useAuth = () => ({ user: { id: 'trainer-1' } });
const apiService = {
  get: async (url) => {
    console.log(`Fetching from: ${url}`);
    await new Promise(res => setTimeout(res, 500));
    return {
      activeTrainees: 42,
      upcomingClasses: 5,
      notifications: [
        { id: 1, text: 'דני לוי ביטל הגעה לחוג מחר.' },
        { id: 2, text: 'הודעה חדשה מישראלה ישראלי.' }
      ]
    };
  }
};


const TrainerDashboard = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.get(`/trainer/dashboard/trainer-1`);
        setDashboardData(response);
      } catch (err) {
        setError('טעינת נתוני הדאשבורד נכשלה.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <p>טוען...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="trainer-dashboard-container">
      <h1>לוח בקרה - מאמן</h1>
      
      <div className="stats-grid">
        <Card title="מתאמנים פעילים">
          <p className="stat-number">{dashboardData?.activeTrainees}</p>
        </Card>
        <Card title="חוגים קרובים">
          <p className="stat-number">{dashboardData?.upcomingClasses}</p>
        </Card>
      </div>

      <Card title="התראות אחרונות" className="notifications-card">
        <ul className="notifications-list">
            {dashboardData?.notifications.map(note => (
                <li key={note.id}>{note.text}</li>
            ))}
        </ul>
      </Card>

      <div className="quick-actions-trainer">
        <button onClick={() => navigate('/trainer/classes')}>ניהול חוגים</button>
        <button onClick={() => navigate('/trainer/messages')}>תיבת הודעות</button>
        <button onClick={() => navigate('/trainer/programs')}>ניהול תוכניות</button>
      </div>
    </div>
  );
};

export default TrainerDashboard;