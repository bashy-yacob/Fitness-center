import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { fetchAllOtherUsers } from '../api/userService';

const SendPrivateMessageForm = ({ onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState('');
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
      await apiService.post('/messages/private', { receiver_id: receiverId, content });
      setSuccess('ההודעה נשלחה בהצלחה');
      setContent('');
      setReceiverId('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת הודעה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', direction: 'rtl' }}>
      <h3>שליחת הודעה פרטית</h3>
      <div>
        <label>בחר נמען:</label>
        <select value={receiverId} onChange={e => setReceiverId(e.target.value)} required
          style={{ color: receiverId ? '#111' : '#888', background: '#fff', border: '2px solid #111', padding: '10px', minWidth: 270, fontWeight: 900, fontSize: 20 }}>
          <option value="" style={{ color: '#888', background: '#fff', fontWeight: 900, fontSize: 20 }}>--בחר--</option>
          {users.map(user => (
            <option key={user.id} value={user.id} style={{ color: '#111', background: '#fff', fontWeight: 900, fontSize: 20 }}>
              {(user.first_name || '') + ' ' + (user.last_name || '') || user.username || user.email} ({user.user_type})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>תוכן ההודעה:</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required rows={3} />
      </div>
      <button type="submit" disabled={loading}>שלח</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
};

export default SendPrivateMessageForm;
