import React, { useState, useEffect } from 'react';

export default function PackageFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(() => initialData || {
    name: '',
    price: '',
    description: '',
    duration_days: '',
    max_classes_per_month: ''
  });

  useEffect(() => {
    setForm(initialData || {
      name: '',
      price: '',
      description: '',
      duration_days: '',
      max_classes_per_month: ''
    });
  }, [initialData, open]);

  if (!open) return null;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
        <h2>{initialData ? 'עריכת מנוי' : 'הוספת מנוי חדש'}</h2>
        <div style={{ marginBottom: 12 }}>
          <label>שם:<br/>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>מחיר:<br/>
            <input name="price" type="number" value={form.price} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>תיאור (רשימה מופרדת בפסיקים):<br/>
            <input name="description" value={form.description} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>משך (ימים):<br/>
            <input name="duration_days" type="number" value={form.duration_days} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>מגבלת חוגים:<br/>
            <input name="max_classes_per_month" type="number" value={form.max_classes_per_month} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose}>ביטול</button>
          <button type="submit">{initialData ? 'עדכן' : 'הוסף'}</button>
        </div>
      </form>
    </div>
  );
}
