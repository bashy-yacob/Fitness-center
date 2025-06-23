import React, { useState, useEffect } from 'react';
import './css/PackageFormModal.css';

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
    <div className="package-modal-backdrop">
      <form className="package-modal-form" onSubmit={handleSubmit}>
        <h2>{initialData ? 'עריכת מנוי' : 'הוספת מנוי חדש'}</h2>
        <div>
          <label>שם:<br/>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>מחיר:<br/>
            <input name="price" type="number" value={form.price} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>תיאור (רשימה מופרדת בפסיקים):<br/>
            <input name="description" value={form.description} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>משך (ימים):<br/>
            <input name="duration_days" type="number" value={form.duration_days} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>מגבלת חוגים:<br/>
            <input name="max_classes_per_month" type="number" value={form.max_classes_per_month} onChange={handleChange} required />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>ביטול</button>
          <button type="submit">{initialData ? 'עדכן' : 'הוסף'}</button>
        </div>
      </form>
    </div>
  );
}
