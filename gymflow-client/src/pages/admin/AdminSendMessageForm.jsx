import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { fetchAllOtherUsers } from '../../api/userService';

const AdminSendMessageForm = ({ onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllOtherUsers()
      .then(users => setUsers(users))
      .catch(() => setError('שגיאה בטעינת משתמשים'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (receiverId === 'ALL') {
        await apiService.post('/broadcast-messages', { subject, text: content });
        setSuccess('הודעה כללית נשלחה בהצלחה');
      } else {
        await apiService.post('/messages/private', { receiver_id: receiverId, content });
        setSuccess('הודעה פרטית נשלחה בהצלחה');
      }
      setContent('');
      setSubject('');
      setReceiverId('ALL');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת הודעה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', direction: 'rtl' }}>
      <h3>שליחת הודעה</h3>
      <div>
        <label>נמען:</label>
        <select value={receiverId} onChange={e => setReceiverId(e.target.value)} required
          style={{ color: receiverId !== 'ALL' ? '#111' : '#007bff', background: '#fff', border: '2px solid #111', padding: '10px', minWidth: 270, fontWeight: 900, fontSize: 18 }}>
          <option value="ALL" style={{ color: '#007bff', fontWeight: 900 }}>כולם (הודעה כללית)</option>
          {users.map(user => (
            <option key={user.id} value={user.id} style={{ color: '#111', fontWeight: 900 }}>
              {(user.first_name || '') + ' ' + (user.last_name || '') || user.username || user.email} ({user.user_type})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>נושא:</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required={receiverId === 'ALL'} disabled={receiverId !== 'ALL'} style={{ width: '100%' }} placeholder="נושא להודעה כללית" />
      </div>
      <div>
        <label>תוכן ההודעה:</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required rows={3} style={{ width: '100%' }} />
      </div>
      <button type="submit" disabled={loading}>שלח</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
};

export default AdminSendMessageForm;
