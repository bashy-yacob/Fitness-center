import React, { useEffect, useState } from 'react';
import {
  fetchAllUsers,
  fetchUsersByType,
  createUser,
  updateUser,
  deleteUser
} from '../../api/userService';
import ClassesAdminPage from './ClassesAdminPage';

const USER_TYPES = [
  { value: '', label: 'הכל' },
  { value: 'trainee', label: 'מתאמן' },
  { value: 'trainer', label: 'מאמן' },
  { value: 'admin', label: 'מנהל' }
];

function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    user_type: '',
    password: '',
    date_of_birth: '',
    gender: '',
    specialization: ''
  });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    
    setLoading(true);
    try {
      let data;
      if (filter) {
        const data = await fetchUsersByType(filter);
        setUsers(data);
      } else {
        const data = await fetchAllUsers();
        setUsers(data);
      }
    } catch (e) {
      alert('שגיאה בטעינת משתמשים');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      user_type: user.user_type,
      password: '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      specialization: user.specialization || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק משתמש זה?')) return;
    await deleteUser(id);
    loadUsers();
  };

  const handleAdd = () => {
    setEditUser(null);
    setForm({ first_name: '', last_name: '', email: '', phone_number: '', user_type: '', password: '', date_of_birth: '', gender: '', specialization: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ולידציה בסיסית בקליינט
    const errors = [];
    if (!form.first_name) errors.push('שם פרטי הוא שדה חובה.');
    if (!form.last_name) errors.push('שם משפחה הוא שדה חובה.');
    if (!form.email) errors.push('אימייל הוא שדה חובה.');
    if (!form.phone_number.match(/^\d{10}$/)) errors.push('פורמט מספר טלפון אינו תקין (10 ספרות בלבד).');
    if (!form.user_type) errors.push('סוג משתמש הוא שדה חובה.');
    if (!editUser && !form.password) errors.push('סיסמה היא שדה חובה.');
    if (form.user_type === 'trainee') {
      if (!form.date_of_birth.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push('פורמט תאריך לידה חייב להיות YYYY-MM-DD.');
      if (!form.gender) errors.push('מין לא יכול להיות ריק.');
      if (!['male','female','other'].includes(form.gender)) errors.push('מין חייב להיות "male", "female" או "other".');
    }
    if (form.user_type === 'trainer') {
      if (!form.specialization) errors.push('התמחות היא שדה חובה עבור מאמן.');
    }
    setFormErrors(errors);
    if (errors.length) return;
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
      } else {
        // שלח רק שדות רלוונטיים לפי סוג המשתמש
        const userData = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          user_type: form.user_type,
          password: form.password,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          specialization: form.user_type === 'trainer' ? form.specialization : undefined
        };
        // הסר שדות ריקים/undefined
        Object.keys(userData).forEach(key => (userData[key] === '' || userData[key] === undefined) && delete userData[key]);
        await createUser(userData);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setFormErrors([err?.response?.data?.message || 'שגיאה בשמירה']);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <h2>ניהול משתמשים</h2>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {USER_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button onClick={handleAdd}>הוסף משתמש חדש</button>
      </div>
      {loading ? <div>טוען...</div> : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>שם</th>
              <th>אימייל</th>
              <th>טלפון</th>
              <th>סוג משתמש</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(users) ? users : []).map(user => (
              <tr key={user.id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.phone_number}</td>
                <td>{user.user_type}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>ערוך</button>
                  <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
            <h3>{editUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}</h3>
            {formErrors.length > 0 && (
              <ul style={{ color: 'red' }}>{formErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>
            )}
            <input placeholder="שם פרטי" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
            <input placeholder="שם משפחה" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
            <input placeholder="אימייל" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required type="email" />
            <input placeholder="טלפון (10 ספרות)" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} required />
            <input placeholder="תאריך לידה" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} type="date" />
            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="">בחר מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
            <select value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))} required>
              <option value="">בחר סוג</option>
              <option value="trainee">מתאמן</option>
              <option value="trainer">מאמן</option>
              <option value="admin">מנהל</option>
            </select>
            {form.user_type === 'trainer' && (
              <div>
                <input placeholder="התמחות" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} required />
              </div>
            )}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button type="submit">שמור</button>
              <button type="button" onClick={() => setShowModal(false)}>ביטול</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ניתן להוסיף כאן קישור לעמוד ניהול החוגים בתפריט או בנתב הראשי של האדמין
// לדוג' בנתב: <Route path="/admin/classes" element={<ClassesAdminPage />} />

export default UsersAdminPage;
