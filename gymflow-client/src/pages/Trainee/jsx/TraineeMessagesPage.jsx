import React, { useEffect, useState } from 'react';
import apiService from '../../../api/apiService.js';
import SendPrivateMessageForm from '../../all/jsx/SendPrivateMessageForm.jsx';
import '../../../styles/theme.css';

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
    <div className="trainer-messages-container">
      <h2>ההודעות שלי</h2>
      <div className="tabs">
        <button className={`tab-btn${selectedTab === 'broadcast' ? ' selected' : ''}`} onClick={() => setSelectedTab('broadcast')}>הודעות כלליות</button>
        <button className={`tab-btn${selectedTab === 'private' ? ' selected' : ''}`} onClick={() => setSelectedTab('private')}>הודעות פרטיות</button>
        <button className={`tab-btn${selectedTab === 'sent' ? ' selected' : ''}`} onClick={() => setSelectedTab('sent')}>הודעות שנשלחו</button>
      </div>
      <div className="card-section">
        <div style={{ margin: '24px 0' }}>
          <SendPrivateMessageForm />
        </div>
        {loading && <div style={{textAlign:'center',marginTop:40}}>טוען...</div>}
        {error && <div className="toast-error">{error}</div>}
        {!loading && !error && privateMessages.length === 0 && broadcastMessages.length === 0 && <div>לא נמצאו הודעות.</div>}
        {selectedTab === 'broadcast' && (
          <div style={{ marginBottom: 32 }}>
            <h3 className="section-title">הודעות כלליות</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {broadcastMessages.map((msg, idx) => (
                <li key={msg.id || idx} className="card" style={{ marginBottom: 18 }}>
                  <div className="class-name">{msg.message_text.split('\n')[0]}</div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text.split('\n').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedTab === 'private' && (
          <div>
            <h3 className="section-title">הודעות פרטיות</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {privateMessages.map((msg, idx) => (
                <li key={msg.id || idx} className="card" style={{ marginBottom: 18 }}>
                  <div className="class-name">מאת: {msg.sender_name || msg.sender_email || 'משתמש'}</div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedTab === 'sent' && (
          <div>
            <h3 className="section-title">הודעות פרטיות שנשלחו</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="סנן לפי שם/אימייל נמען..."
                value={sentFilter}
                onChange={e => setSentFilter(e.target.value)}
                className="input-dark"
                style={{ flex: 1 }}
              />
              <button onClick={() => setSentSortAsc(v => !v)} className="action-btn" style={{ padding: '6px 12px', fontSize: '1rem' }}>
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
                  <li key={msg.id || idx} className="card" style={{ marginBottom: 18 }}>
                    <div className="class-name">ל: {msg.receiver_name || msg.receiver_email || msg.receiver_id}</div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{msg.message_text}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-color)' }}>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraineeMessagesPage;
