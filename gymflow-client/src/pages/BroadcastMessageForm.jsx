import React, { useState } from 'react';

const BroadcastMessageForm = ({ onSend, loading }) => {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !text.trim()) {
      setError('יש למלא נושא ותוכן');
      return;
    }
    await onSend(subject, text);
    setSubject('');
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 32, background: '#f9f9f9', padding: 20, borderRadius: 8, boxShadow: '0 1px 4px #eee' }}>
      <h3 style={{ marginBottom: 16 }}>שלח הודעה שיווקית חדשה</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="נושא ההודעה"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <textarea
          placeholder="תוכן ההודעה"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: '#1976d2', color: '#fff', padding: '8px 24px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? 'שולח...' : 'שלח הודעה'}
      </button>
    </form>
  );
};

export default BroadcastMessageForm;
