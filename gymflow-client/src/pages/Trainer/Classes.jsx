import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';

const TrainerClassesPage = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_time: '', end_time: '', room_id: '', max_capacity: '' });
  const [message, setMessage] = useState('');
  const [sendMsgClassId, setSendMsgClassId] = useState(null);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    if (!trainerId) return;
    fetchClasses();
  }, [trainerId]);

  const fetchClasses = async () => {
    if (!trainerId) return;
    try {
      const data = await apiService.get(`/trainer/${trainerId}/classes/upcoming`);
      setClasses(data);
    } catch (err) {
      console.error('fetchClasses: error', err);
    }
  };

  const fetchParticipants = async (classId) => {
    try {
      const data = await apiService.get(`/class/${classId}/registrations`);
      setParticipants(data);
      setShowParticipants(true);
    } catch (err) {
      console.error('fetchParticipants: error', err);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await apiService.post(`/trainer/${trainerId}/classes`, form);
      setShowCreateForm(false);
      fetchClasses();
    } catch (err) {
      console.error('handleCreateClass: error', err);
    }
  };

  const handleSendMessage = async (classId) => {
    try {
      await apiService.post(`/trainer/${trainerId}/messages/send-class`, { classId, messageText: msgText });
      setSendMsgClassId(null);
      setMsgText('');
      setMessage('ההודעה נשלחה בהצלחה');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('handleSendMessage: error', err);
    }
  };

  return (
    <div className="trainer-classes-page">
      <h2>ניהול חוגים</h2>
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'ביטול' : 'צור חוג חדש'}
      </button>
      {showCreateForm && (
        <form onSubmit={handleCreateClass} className="create-class-form">
          <input placeholder="שם החוג" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="תיאור" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <input type="datetime-local" placeholder="התחלה" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
          <input type="datetime-local" placeholder="סיום" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
          <input placeholder="מספר חדר" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} required />
          <input placeholder="מקסימום משתתפים" type="number" value={form.max_capacity} onChange={e => setForm({ ...form, max_capacity: e.target.value })} required />
          <button type="submit">צור</button>
        </form>
      )}
      <table className="classes-table">
        <thead>
          <tr>
            <th>שם</th>
            <th>תיאור</th>
            <th>התחלה</th>
            <th>סיום</th>
            <th>חדר</th>
            <th>משתתפים</th>
            <th>שלח הודעה</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>{c.start_time}</td>
              <td>{c.end_time}</td>
              <td>{c.room_id}</td>
              <td>
                <button onClick={() => fetchParticipants(c.id)}>צפייה</button>
              </td>
              <td>
                {sendMsgClassId === c.id ? (
                  <>
                    <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="הודעה" />
                    <button onClick={() => handleSendMessage(c.id)}>שלח</button>
                    <button onClick={() => setSendMsgClassId(null)}>ביטול</button>
                  </>
                ) : (
                  <button onClick={() => setSendMsgClassId(c.id)}>שלח הודעה</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && <div className="success-message">{message}</div>}
      {showParticipants && (
        <div className="participants-modal">
          <h3>משתתפי החוג</h3>
          <ul>
            {participants.map(p => (
              <li key={p.trainee_id}>{p.first_name} {p.last_name} ({p.email})</li>
            ))}
          </ul>
          <button onClick={() => setShowParticipants(false)}>סגור</button>
        </div>
      )}
    </div>
  );
};

export default TrainerClassesPage;
