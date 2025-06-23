import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { useAuth } from '../hooks/useAuth';
import apiService from '../api/apiService';

const TrainerStats = () => {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [statsPerTrainee, setStatsPerTrainee] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [attendanceRes, traineeRes] = await Promise.all([
          apiService.get(`/trainer/${trainerId}/stats/attendance-summary`),
          apiService.get(`/trainer/${trainerId}/stats/by-trainee`),
        ]);
        setAttendanceSummary(attendanceRes);
        setStatsPerTrainee(traineeRes);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchStats();
  }, [trainerId]);

  if (loading) return <div>טוען נתונים...</div>;
  if (!attendanceSummary || !statsPerTrainee) return <div>לא נמצאו נתונים</div>;

  const barData = {
    labels: attendanceSummary?.classes,
    datasets: [
      {
        label: 'מספר משתתפים',
        data: attendanceSummary?.counts,
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const pieData = {
    labels: ['נוכחות', 'היעדרות'],
    datasets: [
      {
        data: attendanceSummary?.attendancePie,
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>סטטיסטיקות מאמן</h2>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>משתתפים לפי חוג</h3>
          <Bar data={barData} />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>נוכחות/היעדרות (גרף עוגה)</h3>
          <Pie data={pieData} />
        </div>
      </div>
      <h3 style={{ marginTop: 40 }}>טבלת נוכחות לפי מתאמן</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>שם מתאמן</th>
              <th>מספר חוגים</th>
              <th>נוכח</th>
              <th>היעדר</th>
            </tr>
          </thead>
          <tbody>
            {(statsPerTrainee?.trainees || []).map((t, i) => (
              <tr key={i}>
                <td>{t.name}</td>
                <td>{t.total}</td>
                <td>{t.present}</td>
                <td>{t.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainerStats;
