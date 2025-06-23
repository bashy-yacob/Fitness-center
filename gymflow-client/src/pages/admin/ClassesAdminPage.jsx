import React, { useEffect, useState } from 'react';
import './ClassesAdminPage.css';
import apiService from '../../api/apiService';

const initialFormState = {
  name: '',
  description: '',
  start_time: '',
  end_time: '',
  room_id: '',
  trainer_id: '',
  max_capacity: '',
  is_active: true,
};

export default function ClassesAdminPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  // אפשר להוסיף בהמשך: selectedRoom, selectedActive, selectedDate וכו'

  useEffect(() => {
    fetchClasses();
    fetchRooms();
    fetchTrainers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/classes');
      setClasses(data);
    } catch (err) {
      setError('שגיאה בטעינת החוגים');
    }
    setLoading(false);
  };

  const fetchRooms = async () => {
    try {
      const data = await apiService.get('/rooms');
      setRooms(data);
    } catch {}
  };

  const fetchTrainers = async () => {
    try {
      const data = await apiService.get('/users/filter/by-type?type=trainer');
      setTrainers(data);
    } catch {}
  };

  const handleEdit = (cls) => {
    setForm({ ...cls, start_time: cls.startTime, end_time: cls.endTime });
    setEditId(cls.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק את החוג?')) return;
    try {
      await apiService.delete(`/classes/${id}`);
      fetchClasses();
    } catch {
      setError('שגיאה במחיקה');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const {
          name,
          description,
          start_time,
          end_time,
          room_id,
          trainer_id,
          max_capacity,
          is_active
        } = form;
        const updateData = {
          name: name ?? '',
          description: description ?? '',
          start_time: start_time ?? '',
          end_time: end_time ?? '',
          room_id: room_id ?? null,
          trainer_id: trainer_id ?? null,
          max_capacity: max_capacity ?? null,
          is_active: typeof is_active === 'boolean' ? is_active : true
        };
        await apiService.put(`/classes/${editId}`, updateData);
      } else {
        const { is_active, ...formWithoutIsActive } = form;
        await apiService.post('/classes', formWithoutIsActive);
      }
      setShowForm(false);
      setForm(initialFormState);
      setEditId(null);
      fetchClasses();
    } catch {
      setError('שגיאה בשמירה');
    }
  };

  // סינון חוגים לפי מאמן (בהתאם למבנה הנתונים)
  const selectedTrainerObj = trainers.find(t => String(t.id) === selectedTrainer);
  const selectedTrainerName = selectedTrainerObj ? `${selectedTrainerObj.first_name} ${selectedTrainerObj.last_name}` : '';
  const filteredClasses = selectedTrainer
    ? classes.filter(cls => cls.trainerName === selectedTrainerName)
    : classes;

  return (
    <div className="classes-admin-page">
      <h2>ניהול חוגים</h2>
      {error && <div className="error">{error}</div>}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => { setShowForm(true); setForm(initialFormState); setEditId(null); }}>הוסף חוג</button>
        <label>
          סנן לפי מאמן:
          <select value={selectedTrainer} onChange={e => setSelectedTrainer(e.target.value)}>
            <option value="">הכל</option>
            {trainers.map(t => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
        </label>
        {/* אפשר להוסיף כאן סינונים נוספים */}
      </div>
      {showForm && (
        <form className="class-form" onSubmit={handleSubmit}>
          <label>שם חוג<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>תיאור<input name="description" value={form.description} onChange={handleChange} /></label>
          <label>שעה התחלה<input name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} required /></label>
          <label>שעה סיום<input name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} required /></label>
          <label>חדר<select name="room_id" value={form.room_id} onChange={handleChange} required>
            <option value="">בחר חדר</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select></label>
          <label>מאמן<select name="trainer_id" value={form.trainer_id} onChange={handleChange} required>
            <option value="">בחר מאמן</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select></label>
          <label>מקסימום משתתפים<input name="max_capacity" type="number" value={form.max_capacity} onChange={handleChange} required min="1" /></label>
          <label>פעיל<input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} /></label>
          <button type="submit">{editId ? 'עדכן' : 'הוסף'}</button>
          <button type="button" onClick={() => setShowForm(false)}>ביטול</button>
        </form>
      )}
      {loading ? <div>טוען...</div> : (
        <table className="classes-table">
          <thead>
            <tr>
              <th>שם חוג</th>
              <th>מאמן</th>
              <th>חדר</th>
              <th>התחלה</th>
              <th>סיום</th>
              <th>משתתפים</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map(cls => (
              <tr key={cls.id}>
                <td>{cls.name}</td>
                <td>{cls.trainerName}</td>
                <td>{cls.roomName}</td>
                <td>{new Date(cls.startTime).toLocaleString('he-IL')}</td>
                <td>{new Date(cls.endTime).toLocaleString('he-IL')}</td>
                <td>{cls.registeredCount} / {cls.maxCapacity}</td>
                <td>
                  <button onClick={() => handleEdit(cls)}>ערוך</button>
                  <button onClick={() => handleDelete(cls.id)}>מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
