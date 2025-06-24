import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import '../../../src/pages/trainer/Schedule.css';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDayIndex(dateStr) {
  // JS: Sunday=0, Monday=1, ...
  return new Date(dateStr).getDay();
}

const Schedule = ({ trainerId }) => {
  const [schedule, setSchedule] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await apiService.get(`/trainer/${trainerId}/schedule`);
        setSchedule(data);
      } catch (err) {
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchSchedule();
  }, [trainerId]);

  // Group classes by day
  const weekSchedule = daysOfWeek.map((day, idx) => ({
    day,
    classes: schedule.filter(cls => getDayIndex(cls.start_time) === idx),
  }));

  return (
    <div className="trainer-schedule-container">
            <h2>מערכת שעות שבועית של המאמן</h2>
            {loading ? (
                <div style={{textAlign:'center',marginTop:40}}>טוען נתונים...</div>
            ) : error ? (
                <div className="toast-error">{error}</div>
            ) : (
                <div className="week-grid">
                    {weekSchedule.map(({ day, classes }) => (
                        <div key={day} className="day-column">
                            <div className="day-header">{day}</div>
                            {classes.length === 0 ? (
                                <div className="no-classes">אין חוגים</div>
                            ) : (
                                classes.map(cls => (
                                    <div
                                        key={cls.id}
                                        className="class-block"
                                        onClick={() => setSelectedClass(cls)}
                                    >
                                        <div className="class-name">{cls.name}</div>
                                        <div className="class-time">
                                            {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                        </div>
                                        <div className="class-room">חדר: {cls.room}</div>
                                        <div className="class-trainees">מתאמנים: {cls.traineeCount}</div>
                                        <button className="details-btn">פרטים</button>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* Modal for class details */}
            {selectedClass && (
                <div className="modal-overlay" onClick={() => setSelectedClass(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{selectedClass.name}</h3>
                        <p>
                            <b>שעה:</b> {formatTime(selectedClass.start_time)} - {formatTime(selectedClass.end_time)}
                        </p>
                        <p><b>חדר:</b> {selectedClass.room}</p>
                        <p><b>מתאמנים:</b> {selectedClass.traineeCount}</p>
                        {/* אפשר להוסיף כאן עוד פרטים */}
                        <button onClick={() => setSelectedClass(null)}>סגור</button>
                    </div>
                </div>
            )}
        </div>
  );
};

export default Schedule;
