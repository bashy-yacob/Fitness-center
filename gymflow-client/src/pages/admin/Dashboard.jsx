import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import './Dashboard.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.get('/admin/reports/summary')
      .then(data => {
        setStats(data);
      })
      .catch((err) => {
        setError('שגיאה בטעינת נתוני דשבורד');
      });
  }, []);

  if (error) return <div>{error}</div>;
  if (!stats) return <div>טוען נתונים...</div>;

  const barData = {
    labels: ['משתמשים', 'הכנסות (₪)', 'חוגים פעילים'],
    datasets: [
      {
        label: 'סטטיסטיקות כלליות',
        data: [stats.userCount, stats.monthlyRevenue, stats.activeClassesCount],
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384'],
      },
    ],
  };

  const pieData = {
    labels: ['משתמשים', 'חוגים פעילים'],
    datasets: [
      {
        data: [stats.userCount, stats.activeClassesCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>דשבורד מנהל</h2>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Bar data={barData} />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Pie data={pieData} />
        </div>
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
        <button onClick={() => navigate('/admin/users')}>ניהול משתמשים</button>
        <button onClick={() => navigate('/admin/classes')}>ניהול חוגים</button>
        <button onClick={() => navigate('/admin/packages')}>ניהול סוגי מנויים</button>
        <button onClick={() => navigate('/admin/payments')}>ניהול תשלומים</button>
      </div>
    </div>
  );
}
