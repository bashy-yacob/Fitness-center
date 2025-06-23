import React, { useState, useEffect } from 'react';
import PackageFormModal from '../../components/PackageFormModal.jsx';
import apiService from '../../api/apiService';

const TABS = {
  SUBSCRIPTIONS: 'סוגי מנויים',
  PAYMENTS: 'תשלומים',
};

export default function AdminSubscriptionsPaymentsPage() {
  const [tab, setTab] = useState(TABS.SUBSCRIPTIONS);
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  useEffect(() => {
    if (tab === TABS.SUBSCRIPTIONS) {
      apiService.get('/pricing-packages')
        .then(data => {
          setPackages(data);
        })
        .catch(() => setPackages([]));
    } else {
      apiService.get('/payments')
        .then(setPayments)
        .catch(() => setPayments([]));
    }
  }, [tab]);

  // מחיקת מנוי
  function handleDeletePackage(id) {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המנוי?')) return;
    apiService.delete(`/pricing-packages/${id}`)
      .then(() => {
        setPackages(pkgs => pkgs.filter(pkg => pkg.id !== id));
      })
      .catch(() => alert('שגיאה במחיקת מנוי'));
  }

  // פתיחת טופס חדש
  function handleAddNew() {
    setModalInitial(null);
    setModalOpen(true);
  }
  // פתיחת טופס עריכה
  function handleEditPackage(pkg) {
    setModalInitial({
      id: pkg.id,
      name: pkg.name || '',
      price: pkg.price || '',
      description: pkg.features ? pkg.features.join(', ') : (pkg.description || ''),
      duration_days: pkg.duration_days || '',
      max_classes_per_month: pkg.max_classes_per_month !== undefined && pkg.max_classes_per_month !== null ? pkg.max_classes_per_month : ''
    });
    setModalOpen(true);
  }
  // שליחת טופס (חדש או עדכון)
  function handleModalSubmit(form) {
    const isEdit = !!modalInitial;
    if (isEdit && !modalInitial.id) {
      alert('שגיאה: לא נמצא מזהה מנוי לעריכה');
      return;
    }
    const method = isEdit ? 'put' : 'post';
    const url = isEdit ? `/pricing-packages/${modalInitial.id}` : '/pricing-packages';
    // המרת שדות למספרים עם ערכי ברירת מחדל
    const payload = {
      name: form.name || '',
      price: form.price !== undefined && form.price !== '' ? Number(form.price) : 0,
      description: form.description || '',
      duration_days: form.duration_days !== undefined && form.duration_days !== '' ? Number(form.duration_days) : 0,
      max_classes_per_month:
        form.max_classes_per_month === undefined || form.max_classes_per_month === ''
          ? null
          : Number(form.max_classes_per_month)
    };
    apiService[method](url, payload)
      .then(data => {
        setModalOpen(false);
        setModalInitial(null);
        if (method === 'post') {
          setPackages(pkgs => [...pkgs, { ...payload, id: data.id }]);
        } else {
          setPackages(pkgs => pkgs.map(p => p.id === modalInitial.id ? { ...p, ...payload } : p));
        }
      })
      .catch(e => alert(e.message || 'שגיאה בשמירת מנוי'));
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <h1>ניהול מנויים ותשלומים</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab(TABS.SUBSCRIPTIONS)} disabled={tab === TABS.SUBSCRIPTIONS}>סוגי מנויים</button>
        <button onClick={() => setTab(TABS.PAYMENTS)} disabled={tab === TABS.PAYMENTS}>תשלומים</button>
      </div>
      {tab === TABS.SUBSCRIPTIONS ? (
        <>
          <button style={{ marginBottom: 12 }} onClick={handleAddNew}>הוסף מנוי חדש</button>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>שם</th>
                <th>מחיר</th>
                <th>תיאור</th>
                <th>משך (ימים)</th>
                <th>מגבלת חוגים</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.price}</td>
                  <td>{pkg.features ? pkg.features.join(', ') : pkg.description}</td>
                  <td>{pkg.duration_days ?? ''}</td>
                  <td>{pkg.max_classes_per_month ?? ''}</td>
                  <td>
                    <button onClick={() => handleEditPackage(pkg)}>ערוך</button>
                    <button onClick={() => handleDeletePackage(pkg.id)}>מחק</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>מתאמן</th>
              <th>סכום</th>
              <th>תאריך</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.first_name} {payment.last_name}</td>
                <td>{payment.amount}</td>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <PackageFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalInitial}
      />
    </div>
  );
}
