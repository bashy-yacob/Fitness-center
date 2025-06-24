import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { classService } from '../../api/classService';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/theme.css';

export default function TrainerMessagesPage() {
  const [tab, setTab] = useState('inbox'); // inbox | send
  const [inboxTab, setInboxTab] = useState('private'); // private | general
  const [sendTab, setSendTab] = useState('private'); // private | class
  const [trainees, setTrainees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    setLoadingData(true);
    Promise.all([
      apiService.get(`/trainer/${trainerId}/trainees`).catch(() => []),
      classService.getTrainerClasses(trainerId).catch(() => []),
      apiService.get(`/trainer/${trainerId}/messages/sent`).catch(() => []),
      apiService.get(`/users/me/messages/received`).catch(() => []),
      apiService.get('/broadcast-messages').catch(() => [])
    ]).then(([trainees, classes, sent, received, broadcast]) => {
      setTrainees(trainees);
      setClasses(classes);
      setSentMessages(sent);
      setReceivedMessages(received);
      setBroadcastMessages(broadcast);
    }).catch(() => setError('שגיאה בטעינת נתונים')).finally(() => setLoadingData(false));
  }, [trainerId]);

  const handleSelectTrainee = (id) => {
    setSelectedTrainees((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!messageText) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (sendTab === 'private') {
        if (selectedTrainees.length === 0) return;
        await apiService.post(`/trainer/${trainerId}/messages/send-batch`, {
          traineeIds: selectedTrainees,
          messageText,
        });
      } else if (sendTab === 'class') {
        if (!selectedClass) return;
        await apiService.post(`/trainer/${trainerId}/messages/send-class`, {
          classId: selectedClass,
          messageText,
        });
      }
      setMessageText('');
      setSelectedTrainees([]);
      setSelectedClass('');
      setSuccess('ההודעה נשלחה בהצלחה!');
      const msgs = await apiService.get(`/trainer/${trainerId}/messages/sent`).catch(() => []);
      setSentMessages(msgs);
    } catch {
      setError('שגיאה בשליחת הודעה');
    }
    setLoading(false);
  };

  // פילטר הודעות שהתקבלו
  const privateInbox = receivedMessages.filter(m => m.message_type === 'private');
  const generalInbox = receivedMessages.filter(m => m.message_type !== 'private');

  // חיפוש מתאמנים
  const filteredTrainees = trainees.filter(t =>
    (t.first_name + ' ' + t.last_name + ' ' + t.email).toLowerCase().includes(search.toLowerCase())
  );

  if (!trainerId) {
    return <div style={{textAlign:'center',marginTop:40}}>יש להתחבר כמאמן כדי לצפות בעמוד זה.</div>;
  }

  if (loadingData) {
    return <div style={{textAlign:'center',marginTop:40}}>טוען נתונים...</div>;
  }

  return (
    <div className="trainer-messages-container">
      <h2>הודעות מאמן</h2>
      <div className="tabs">
        <button onClick={() => setTab('inbox')} className={`tab-btn${tab==='inbox' ? ' selected' : ''}`}>הודעות שהתקבלו</button>
        <button onClick={() => setTab('send')} className={`tab-btn${tab==='send' ? ' selected' : ''}`}>שליחת הודעה</button>
      </div>
      {error && <div className="toast-error">{error}</div>}
      {success && <div className="toast-success">{success}</div>}
      {tab === 'inbox' && (
        <div className="card-section">
          <h3>הודעות שהתקבלו</h3>
          <div className="tabs" style={{marginBottom: 16}}>
            <button onClick={() => setInboxTab('private')} className={`tab-btn${inboxTab==='private' ? ' selected' : ''}`}>הודעות פרטיות</button>
            <button onClick={() => setInboxTab('general')} className={`tab-btn${inboxTab==='general' ? ' selected' : ''}`}>הודעות כלליות</button>
          </div>
          {inboxTab === 'private' ? (
            privateInbox.length === 0 ? (
              <div style={{textAlign:'center',color:'var(--text-muted)'}}>לא נמצאו הודעות.</div>
            ) : (
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>שולח</th>
                    <th>תוכן</th>
                    <th>נשלח בתאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {privateInbox.map((msg) => (
                    <tr key={msg.id}>
                      <td>{msg.sender_name || msg.sender_email || msg.sender_id}</td>
                      <td>{msg.message_text}</td>
                      <td>{new Date(msg.sent_at).toLocaleString('he-IL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            broadcastMessages.length === 0 ? (
              <div style={{textAlign:'center',color:'var(--text-muted)'}}>לא נמצאו הודעות כלליות.</div>
            ) : (
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>נושא</th>
                    {broadcastMessages.some(msg => (msg.message_text.split('\n').slice(1).join(' ').trim() !== '')) && <th>תוכן</th>}
                    <th>נשלח בתאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcastMessages.map((msg) => {
                    const subject = msg.message_text.split('\n')[0];
                    const content = msg.message_text.split('\n').slice(1).join(' ').trim();
                    return (
                      <tr key={msg.id}>
                        <td>{subject}</td>
                        {broadcastMessages.some(m => (m.message_text.split('\n').slice(1).join(' ').trim() !== '')) && <td>{content}</td>}
                        <td>{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
      {tab === 'send' && (
        <div className="card-section">
          <h3>הודעות שנשלחו</h3>
          <div className="tabs" style={{marginBottom: 16}}>
            <button onClick={() => setSendTab('private')} className={`tab-btn${sendTab==='private' ? ' selected' : ''}`}>הודעה פרטית</button>
            <button onClick={() => setSendTab('class')} className={`tab-btn${sendTab==='class' ? ' selected' : ''}`}>הודעה לחוג</button>
          </div>
          {sendTab === 'private' && (
            <div>
              <h3>בחר מתאמנים:</h3>
              <input
                type="text"
                placeholder="חפש מתאמן..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{marginBottom:8,padding:4,minWidth:200}}
                className="trainee-search-input"
              />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: 260,
                overflowY: 'auto',
                background: 'var(--section-bg)',
                borderRadius: 10,
                padding: 12,
                border: '1px solid var(--border-color)'
              }}>
                {filteredTrainees.length === 0 ? (
                  <div style={{color:'var(--text-muted)'}}>לא נמצאו מתאמנים.</div>
                ) : filteredTrainees.map((t) => (
                  <label key={t.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: selectedTrainees.includes(t.id) ? 'var(--accent-soft)' : 'transparent',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: selectedTrainees.includes(t.id) ? '#fff' : 'var(--text-color)',
                    border: selectedTrainees.includes(t.id) ? '1.5px solid var(--accent-color)' : '1.5px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTrainees.includes(t.id)}
                      onChange={() => handleSelectTrainee(t.id)}
                      style={{ accentColor: 'var(--accent-color)', width: 18, height: 18 }}
                    />
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {t.first_name} {t.last_name} <span style={{color:'var(--text-muted)',fontSize:'0.95em'}}>({t.email})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {sendTab === 'class' && (
            <div>
              <h3>בחר חוג:</h3>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">בחר חוג</option>
                {classes.length === 0 ? (
                  <option disabled>לא נמצאו חוגים</option>
                ) : classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({new Date(cls.start_time || cls.startTime).toLocaleString('he-IL')})
                  </option>
                ))}
              </select>
            </div>
          )}
          <textarea
            style={{ width: '100%', marginTop: 16 }}
            rows={4}
            placeholder="הקלד כאן את תוכן ההודעה..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !messageText || (sendTab === 'private' && selectedTrainees.length === 0) || (sendTab === 'class' && !selectedClass)}
            style={{marginTop:8,minWidth:120}}
          >
            {loading ? 'שולח...' : 'שלח הודעה'}
          </button>
          <h4 style={{ marginTop: 32 }}>הודעות שנשלחו</h4>
          {sentMessages.length === 0 ? (
            <div style={{textAlign:'center',color:'#888'}}>לא נשלחו הודעות.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>נמען</th>
                  <th>אימייל</th>
                  <th>תוכן</th>
                  <th>נשלח בתאריך</th>
                </tr>
              </thead>
              <tbody>
                {sentMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.first_name} {msg.last_name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.message_text}</td>
                    <td>{new Date(msg.sent_at).toLocaleString('he-IL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
