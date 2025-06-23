import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService.js';
import AdminSendMessageForm from './AdminSendMessageForm.jsx';
import EditBroadcastMessageModal from './EditBroadcastMessageModal.jsx';

const tabStyles = {
  display: 'flex',
  borderBottom: '2px solid #eee',
  marginBottom: 24,
};
const tabBtnStyles = (active) => ({
  padding: '10px 24px',
  border: 'none',
  borderBottom: active ? '3px solid #1976d2' : '3px solid transparent',
  background: 'none',
  cursor: 'pointer',
  fontWeight: active ? 'bold' : 'normal',
  color: active ? '#1976d2' : '#333',
  outline: 'none',
  fontSize: 16,
  transition: 'border 0.2s',
});

const AdminMessagesPage = () => {
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [sentPrivateMessages, setSentPrivateMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('broadcast');
  const [sentFilter, setSentFilter] = useState('');
  const [sentSortAsc, setSentSortAsc] = useState(true);
  const [receivedFilter, setReceivedFilter] = useState('');
  const [receivedSortAsc, setReceivedSortAsc] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [broadcast, sentPrivate, received] = await Promise.all([
        apiService.get('/broadcast-messages'),
        apiService.get('/messages/sent-private'),
        apiService.get('/messages/received'),
      ]);
      setBroadcastMessages(broadcast);
      setSentPrivateMessages(sentPrivate);
      setReceivedMessages(received);
    } catch (err) {
      setError('שגיאה בטעינת הודעות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (msg) => {
    const [subject, ...textArr] = msg.message_text.split('\n');
    setEditId(msg.id);
    setEditSubject(subject);
    setEditText(textArr.join(' '));
  };

  const handleSaveEdit = async (subject, text) => {
    setEditLoading(true);
    try {
      await apiService.put(`/broadcast-messages/${editId}`, { subject, text });
      setEditId(null);
      await fetchAll();
    } catch {
      alert('שגיאה בעדכון');
    }
    setEditLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק הודעה זו?')) return;
    setDeleteLoadingId(id);
    try {
      await apiService.delete(`/broadcast-messages/${id}`);
      await fetchAll();
    } catch {
      alert('שגיאה במחיקה');
    }
    setDeleteLoadingId(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center' }}>הודעות מנהל</h2>
      <div style={{ margin: '24px 0' }}>
        <AdminSendMessageForm onSuccess={fetchAll} />
      </div>
      <div style={tabStyles}>
        <button style={tabBtnStyles(selectedTab === 'broadcast')} onClick={() => setSelectedTab('broadcast')}>הודעות כלליות</button>
        <button style={tabBtnStyles(selectedTab === 'private')} onClick={() => setSelectedTab('private')}>הודעות פרטיות שנשלחו</button>
        <button style={tabBtnStyles(selectedTab === 'received')} onClick={() => setSelectedTab('received')}>הודעות שהתקבלו</button>
      </div>
      {loading && <div>טוען...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {selectedTab === 'broadcast' && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות שנשלחו - כלליות</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {broadcastMessages.map((msg, idx) => (
              <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12, position: 'relative' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{msg.message_text.split('\n')[0]}</div>
                <div style={{ color: '#555', marginBottom: 4 }}>{msg.message_text.split('\n').slice(1).join(' ')}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                <button onClick={() => handleEdit(msg)} style={{ position: 'absolute', left: 80, top: 8, background: '#ffc107', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} disabled={editLoading || deleteLoadingId === msg.id}>ערוך</button>
                <button onClick={() => handleDelete(msg.id)} style={{ position: 'absolute', left: 8, top: 8, background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} disabled={deleteLoadingId === msg.id}>{deleteLoadingId === msg.id ? 'מוחק...' : 'מחק'}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedTab === 'private' && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות שנשלחו - פרטיות</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="סנן לפי שם/אימייל נמען..."
              value={sentFilter}
              onChange={e => setSentFilter(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', flex: 1 }}
            />
            <button onClick={() => setSentSortAsc(v => !v)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>
              מיין לפי נמען {sentSortAsc ? '▲' : '▼'}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sentPrivateMessages
              .filter(msg => {
                const name = (msg.receiver_name || msg.receiver_email || '').toLowerCase();
                return name.includes(sentFilter.toLowerCase());
              })
              .sort((a, b) => {
                const aName = (a.receiver_name || a.receiver_email || '').toLowerCase();
                const bName = (b.receiver_name || b.receiver_email || '').toLowerCase();
                if (aName < bName) return sentSortAsc ? -1 : 1;
                if (aName > bName) return sentSortAsc ? 1 : -1;
                return 0;
              })
              .map((msg, idx) => (
                <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>ל: {msg.receiver_name || msg.receiver_email || msg.receiver_id}</div>
                  <div style={{ color: '#555', marginBottom: 4 }}>{msg.message_text}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {selectedTab === 'received' && (
        <div>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות שהתקבלו</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="סנן לפי שם/אימייל שולח..."
              value={receivedFilter}
              onChange={e => setReceivedFilter(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', flex: 1 }}
            />
            <button onClick={() => setReceivedSortAsc(v => !v)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>
              מיין לפי שולח {receivedSortAsc ? '▲' : '▼'}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {receivedMessages
              .filter(msg => {
                const name = (msg.sender_name || msg.sender_email || '').toLowerCase();
                return name.includes(receivedFilter.toLowerCase());
              })
              .sort((a, b) => {
                const aName = (a.sender_name || a.sender_email || '').toLowerCase();
                const bName = (b.sender_name || b.sender_email || '').toLowerCase();
                if (aName < bName) return receivedSortAsc ? -1 : 1;
                if (aName > bName) return receivedSortAsc ? 1 : -1;
                return 0;
              })
              .map((msg, idx) => (
                <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{msg.sender_name || 'משתמש'}</div>
                  <div style={{ color: '#555', marginBottom: 4 }}>{msg.message_text}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                </li>
              ))}
          </ul>
        </div>
      )}
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

export default AdminMessagesPage;
