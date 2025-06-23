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
      <h2>Trainer Weekly Schedule</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="week-grid">
          {weekSchedule.map(({ day, classes }) => (
            <div key={day} className="day-column">
              <div className="day-header">{day}</div>
              {classes.length === 0 ? (
                <div className="no-classes">No classes</div>
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
                    <div className="class-room">Room: {cls.room}</div>
                    <div className="class-trainees">Trainees: {cls.traineeCount}</div>
                    <button className="details-btn">View Details</button>
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
              <b>Time:</b> {formatTime(selectedClass.start_time)} - {formatTime(selectedClass.end_time)}
            </p>
            <p><b>Room:</b> {selectedClass.room}</p>
            <p><b>Trainees:</b> {selectedClass.traineeCount}</p>
            {/* You can add more details here, e.g., list of trainees */}
            <button onClick={() => setSelectedClass(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
