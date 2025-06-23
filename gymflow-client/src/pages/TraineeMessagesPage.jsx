import React, { useEffect, useState } from 'react';
import apiService from '../api/apiService.js';
import SendPrivateMessageForm from './SendPrivateMessageForm.jsx';

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

const TraineeMessagesPage = () => {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [sentPrivateMessages, setSentPrivateMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('broadcast');
  const [sentFilter, setSentFilter] = useState('');
  const [sentSortAsc, setSentSortAsc] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const privateMsgs = await apiService.get('/trainee/messages/private').catch(e => {console.error('שגיאה בהודעות פרטיות', e); throw e;});
        const broadcastMsgs = await apiService.get('/broadcast-messages').catch(e => {console.error('שגיאה בהודעות כלליות', e); throw e;});
        const sentMsgs = await apiService.get('/messages/sent-private').catch(e => {console.error('שגיאה בהודעות פרטיות שנשלחו', e); throw e;});
        setPrivateMessages(privateMsgs);
        setBroadcastMessages(broadcastMsgs);
        setSentPrivateMessages(sentMsgs);
      } catch (err) {
        setError('שגיאה בטעינת הודעות');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center' }}>ההודעות שלי</h2>
      <div style={{ margin: '24px 0' }}>
        <SendPrivateMessageForm />
      </div>
      <div style={tabStyles}>
        <button style={tabBtnStyles(selectedTab === 'broadcast')} onClick={() => setSelectedTab('broadcast')}>הודעות כלליות</button>
        <button style={tabBtnStyles(selectedTab === 'private')} onClick={() => setSelectedTab('private')}>הודעות פרטיות</button>
        <button style={tabBtnStyles(selectedTab === 'sent')} onClick={() => setSelectedTab('sent')}>הודעות שנשלחו</button>
      </div>
      {loading && <div>טוען...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && privateMessages.length === 0 && broadcastMessages.length === 0 && <div>לא נמצאו הודעות.</div>}
      {selectedTab === 'broadcast' && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות כלליות</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {broadcastMessages.map((msg, idx) => (
              <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>הודעה שיווקית</div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{msg.message_text.split('\n')[0]}</div>
                <div style={{ color: '#555', marginBottom: 4 }}>{msg.message_text.split('\n').slice(1).join(' ')}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedTab === 'private' && (
        <div>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות פרטיות</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {privateMessages.map((msg, idx) => (
              <li key={msg.id || idx} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>מאת: {msg.sender_name || msg.sender_email || 'משתמש'}</div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{msg.message_text.split('\n')[0]}</div>
                <div style={{ color: '#555', marginBottom: 4 }}>{msg.message_text.split('\n').slice(1).join(' ')}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedTab === 'sent' && (
        <div>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 8 }}>הודעות פרטיות שנשלחו</h3>
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
    </div>
  );
};

export default TraineeMessagesPage;
