import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useAuth } from '../../hooks/useAuth';

// דשבורד מאמן - מציג סטטיסטיקות, חוגים קרובים, הודעות אחרונות וקיצורי דרך
function TrainerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    // שליפת נתוני סיכום
    apiService.get(`/trainer/${trainerId}/dashboard/summary`).then(setSummary);
    // שליפת חוגים קרובים
    apiService.get(`/trainer/${trainerId}/classes/upcoming`).then(setUpcomingClasses);
    // שליפת הודעות אחרונות
    apiService.get(`/trainer/${trainerId}/messages/recent`).then(setRecentMessages);
  }, [trainerId]);

  return (
    <div className="trainer-dashboard">
      <h2>🏠 דשבורד מאמן</h2>
      <div className="stats-cards">
        <div className="card stat">
          <div className="stat-title">כמות חוגים</div>
          <div className="stat-value">{summary?.classesCount ?? '-'}</div>
        </div>
        <div className="card stat">
          <div className="stat-title">מתאמנים פעילים</div>
          <div className="stat-value">{summary?.activeTrainees ?? '-'}</div>
        </div>
        <div className="card stat">
          <div className="stat-title">הודעות אחרונות</div>
          <div className="stat-value">{recentMessages.length}</div>
        </div>
      </div>

      <div className="section">
        <h3>לוח חוגים שבועי (מוקטן)</h3>
        <div className="mini-calendar">
          {upcomingClasses.length === 0 ? (
            <div>אין חוגים קרובים</div>
          ) : (
            <ul>
              {upcomingClasses.map(cls => (
                <li key={cls.id}>
                  {cls.day} {cls.time} - {cls.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="section shortcuts">
        <h3>קיצורי דרך</h3>
        <div className="shortcut-links">
          <Link to="/trainer/classes" className="btn btn-secondary">הוסף חוג</Link>
          <Link to="/trainer/messages" className="btn btn-secondary">הודעות</Link>
          <Link to="/trainer/trainees" className="btn btn-secondary">רשימת מתאמנים</Link>
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboardPage;
