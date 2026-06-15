import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService.js';
import AdminSendMessageForm from './AdminSendMessageForm.jsx';
import EditBroadcastMessageModal from './EditBroadcastMessageModal.jsx';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Card,
    Text,
    Button,
    Badge,
    Stack,
    Flex,
    Spinner,
    Alert,
    Icon,
    createToaster,
} from '@chakra-ui/react';
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
    <Box className="trainer-messages-container">
      <h2>הודעות מנהל</h2>
      <Box className="tabs">
        <Button variant={selectedTab === 'broadcast' ? 'solid' : 'outline'} onClick={() => setSelectedTab('broadcast')}>הודעות כלליות</Button>
        <Button variant={selectedTab === 'private' ? 'solid' : 'outline'} onClick={() => setSelectedTab('private')}>הודעות פרטיות שנשלחו</Button>
        <Button variant={selectedTab === 'received' ? 'solid' : 'outline'} onClick={() => setSelectedTab('received')}>הודעות שהתקבלו</Button>
      </Box>
      <Box className="card-section">
        <Box style={{ margin: '24px 0' }}>
          <AdminSendMessageForm onSuccess={fetchAll} />
        </Box>
        {loading && <Box style={{textAlign:'center',marginTop:40}}>טוען...</Box>}
        {error && <Box className="toast-error">{error}</Box>}
        {selectedTab === 'broadcast' && (
          <Box style={{ marginBottom: 32 }}>
            <h3 className="section-title">הודעות שנשלחו - כלליות</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {broadcastMessages.map((msg, idx) => (
                <li key={msg.id || idx} className="card" style={{ marginBottom: 18, position: 'relative' }}>
                  <div className="class-name">{msg.message_text.split('\n')[0]}</div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text.split('\n').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                  <button onClick={() => handleEdit(msg)} className="action-btn" style={{ position: 'absolute', left: 80, top: 8, background: 'var(--accent-soft)' }} disabled={editLoading || deleteLoadingId === msg.id}>ערוך</button>
                  <button onClick={() => handleDelete(msg.id)} className="action-btn" style={{ position: 'absolute', left: 8, top: 8, background: 'var(--error-color)' }} disabled={deleteLoadingId === msg.id}>{deleteLoadingId === msg.id ? 'מוחק...' : 'מחק'}</button>
                </li>
              ))}
            </ul>
          </Box>
        )}
        {selectedTab === 'private' && (
          <Box style={{ marginBottom: 32 }}>
            <Text className="section-title">הודעות שנשלחו - פרטיות</Text>
            <Box style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Input
                type="text"
                placeholder="סנן לפי שם/אימייל נמען..."
                value={sentFilter}
                onChange={e => setSentFilter(e.target.value)}
                className="input-dark"
                style={{ flex: 1 }}
              />
              <Button onClick={() => setSentSortAsc(v => !v)} className="action-btn" style={{ padding: '6px 12px', fontSize: '1rem' }}>
                מיין לפי נמען {sentSortAsc ? '▲' : '▼'}
              </Button>
            </Box>
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
                  <li key={msg.id || idx} className="card" style={{ marginBottom: 18 }}>
                    <Box className="class-name">ל: {msg.receiver_name || msg.receiver_email || msg.receiver_id}</Box>
                    <Box style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text}</Box>
                    <Box style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</Box>
                  </li>
                ))}
            </ul>
          </Box>
        )}
        {selectedTab === 'received' && (
          <Box>
            <Text className="section-title">הודעות שהתקבלו</Text>
            <Box style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="סנן לפי שם/אימייל שולח..."
                value={receivedFilter}
                onChange={e => setReceivedFilter(e.target.value)}
                className="input-dark"
                style={{ flex: 1 }}
              />
              < Button onClick={() => setReceivedSortAsc(v => !v)} className="action-btn" style={{ padding: '6px 12px', fontSize: '1rem' }}>
                מיין לפי שולח {receivedSortAsc ? '▲' : '▼'}
              </Button>
            </Box>
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
                  <li key={msg.id || idx} className="card" style={{ marginBottom: 18 }}>
                    <Text className="class-name">{msg.sender_name || 'משתמש'}</Text>
                    <Text style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text}</Text>
                    <Text style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</Text>
                  </li>
                ))}
            </ul>
          </Box>
        )}
        <EditBroadcastMessageModal
          open={!!editId}
          onClose={() => setEditId(null)}
          onSave={handleSaveEdit}
          initialSubject={editSubject}
          initialText={editText}
        />
      </Box>
    </Box>
  );
};

export default AdminMessagesPage;
