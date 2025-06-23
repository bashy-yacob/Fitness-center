import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { classService } from '../../api/classService';

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
  const [loading, setLoading] = useState(false);
  const trainerId = 1; // TODO: להחליף ל-id דינמי מה-auth

  useEffect(() => {
    apiService.get(`/trainer/${trainerId}/trainees`).then(setTrainees);
    classService.getTrainerClasses(trainerId).then(setClasses);
    apiService.get(`/trainer/${trainerId}/messages/sent`).then(setSentMessages);
    // שליפת הודעות שהתקבלו (נדרש API מתאים בשרת)
    apiService.get(`/users/me/messages/received`).then(setReceivedMessages).catch(()=>{});
  }, [trainerId]);

  const handleSelectTrainee = (id) => {
    setSelectedTrainees((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!messageText) return;
    setLoading(true);
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
      const msgs = await apiService.get(`/trainer/${trainerId}/messages/sent`);
      setSentMessages(msgs);
      alert('ההודעה נשלחה בהצלחה!');
    } catch {
      alert('שגיאה בשליחת הודעה');
    }
    setLoading(false);
  };

  // פילטר הודעות שהתקבלו
  const privateInbox = receivedMessages.filter(m => m.message_type === 'private');
  const generalInbox = receivedMessages.filter(m => m.message_type !== 'private');

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <h2>הודעות מאמן</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setTab('inbox')} style={{ fontWeight: tab==='inbox'?'bold':'normal' }}>הודעות שהתקבלו</button>
        <button onClick={() => setTab('send')} style={{ fontWeight: tab==='send'?'bold':'normal' }}>שליחת הודעה</button>
      </div>
      {tab === 'inbox' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <button onClick={() => setInboxTab('private')} style={{ fontWeight: inboxTab==='private'?'bold':'normal' }}>הודעות פרטיות</button>
            <button onClick={() => setInboxTab('general')} style={{ fontWeight: inboxTab==='general'?'bold':'normal' }}>הודעות כלליות</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>שולח</th>
                <th>תוכן</th>
                <th>נשלח בתאריך</th>
              </tr>
            </thead>
            <tbody>
              {(inboxTab === 'private' ? privateInbox : generalInbox).map((msg) => (
                <tr key={msg.id}>
                  <td>{msg.sender_name || msg.sender_email || msg.sender_id}</td>
                  <td>{msg.message_text}</td>
                  <td>{new Date(msg.sent_at).toLocaleString('he-IL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'send' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <button onClick={() => setSendTab('private')} style={{ fontWeight: sendTab==='private'?'bold':'normal' }}>הודעה פרטית</button>
            <button onClick={() => setSendTab('class')} style={{ fontWeight: sendTab==='class'?'bold':'normal' }}>הודעה לחוג</button>
          </div>
          {sendTab === 'private' && (
            <div>
              <h3>בחר מתאמנים:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trainees.map((t) => (
                  <label key={t.id} style={{ minWidth: 120 }}>
                    <input
                      type="checkbox"
                      checked={selectedTrainees.includes(t.id)}
                      onChange={() => handleSelectTrainee(t.id)}
                    />
                    {t.first_name} {t.last_name} ({t.email})
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
                {classes.map(cls => (
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
          />
          <button
            onClick={handleSend}
            disabled={loading || !messageText || (sendTab === 'private' && selectedTrainees.length === 0) || (sendTab === 'class' && !selectedClass)}
          >
            שלח הודעה
          </button>
          <h4 style={{ marginTop: 32 }}>הודעות שנשלחו</h4>
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
        </div>
      )}
    </div>
  );
}
