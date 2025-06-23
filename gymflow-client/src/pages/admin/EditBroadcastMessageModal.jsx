import React, { useState, useEffect } from 'react';

const EditBroadcastMessageModal = ({ open, onClose, onSave, initialSubject, initialText }) => {
  const [subject, setSubject] = useState(initialSubject || '');
  const [text, setText] = useState(initialText || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    setSubject(initialSubject || '');
    setText(initialText || '');
  }, [initialSubject, initialText, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !text.trim()) {
      setError('יש למלא נושא ותוכן');
      return;
    }
    onSave(subject, text);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 8px #aaa' }}>
        <h3 style={{ marginBottom: 16 }}>עריכת הודעה</h3>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="נושא"
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="תוכן"
          rows={4}
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
        />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" onClick={onClose} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>ביטול</button>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>שמור</button>
        </div>
      </form>
    </div>
  );
};

export default EditBroadcastMessageModal;
