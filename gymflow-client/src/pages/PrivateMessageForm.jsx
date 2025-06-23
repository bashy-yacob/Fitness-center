import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { fetchUsersByType } from '../api/userService';

const PrivateMessageForm = ({ onSuccess }) => {
  const [trainees, setTrainees] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsersByType('trainee')
      .then(users => setTrainees(users))
      .catch(() => setError('שגיאה בטעינת מתאמנים'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiService.post('/trainee/messages/private', { receiver_id: receiverId, content });
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
      <h3>שליחת הודעה פרטית למתאמן</h3>
      <div>
        <label>בחר מתאמן:</label>
        <select value={receiverId} onChange={e => setReceiverId(e.target.value)} required>
          <option value="">--בחר--</option>
          {trainees.map(user => (
            <option key={user.id} value={user.id}>{user.full_name || user.username}</option>
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

export default PrivateMessageForm;
