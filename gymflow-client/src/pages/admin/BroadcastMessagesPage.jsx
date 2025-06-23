import React, { useEffect, useState } from 'react';
import BroadcastMessageForm from './BroadcastMessageForm.jsx';
import EditBroadcastMessageModal from './EditBroadcastMessageModal.jsx';
import PrivateMessageForm from '../PrivateMessageForm.jsx';
import apiService from '../../api/apiService.js';

const BroadcastMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get('/broadcast-messages');
      setMessages(data);
    } catch (err) {
      setError('שגיאה בטעינת הודעות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (subject, text) => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      // DEBUG: בדוק מה ה-token ומה user
      const token = localStorage.getItem('token');
      console.log('DEBUG token', token);
      // נבצע קריאה לבדוק את המשתמש המחובר
      const me = await apiService.get('/users/me');
      console.log('DEBUG /users/me', me);
      await apiService.post('/broadcast-messages', { subject, text });
      setSuccess('ההודעה נשלחה בהצלחה!');
      await fetchMessages();
    } catch (err) {
      setError('שליחת ההודעה נכשלה');
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (msg) => {
    const [subject, ...textArr] = msg.message_text.split('\n');
    setEditId(msg.id);
    setEditSubject(subject);
    setEditText(textArr.join(' '));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק הודעה זו?')) return;
    setEditLoading(true);
    try {
      await apiService.delete(`/broadcast-messages/${id}`);
      await fetchMessages();
    } catch {
      alert('שגיאה במחיקה');
    }
    setEditLoading(false);
  };

  const handleSaveEdit = async (subject, text) => {
    setEditLoading(true);
    try {
      await apiService.put(`/broadcast-messages/${editId}`, { subject, text });
      setEditId(null);
      await fetchMessages();
    } catch {
      alert('שגיאה בעדכון');
    }
    setEditLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center' }}>הודעות שיווקיות שנשלחו</h2>
      <BroadcastMessageForm onSend={handleSend} loading={sending} />
      <div style={{ margin: '32px 0' }}>
        <PrivateMessageForm />
      </div>
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      {loading && <div>טוען...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && messages.length === 0 && <div>לא נמצאו הודעות.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((msg, idx) => (
          <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12, position: 'relative' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {msg.message_text.split('\n')[0]}
            </div>
            <div style={{ color: '#555', marginBottom: 4 }}>
              {msg.message_text.split('\n').slice(1).join(' ')}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}
            </div>
            <div style={{ position: 'absolute', left: 8, top: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(msg)} style={{ background: '#ffc107', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>ערוך</button>
              <button onClick={() => handleDelete(msg.id)} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} disabled={editLoading}>מחק</button>
            </div>
          </li>
        ))}
      </ul>
      <EditBroadcastMessageModal
        open={!!editId}
        onClose={() => setEditId(null)}
        onSave={handleSaveEdit}
        initialSubject={editSubject}
        initialText={editText}
      />
    </div>
  );
};

export default BroadcastMessagesPage;
