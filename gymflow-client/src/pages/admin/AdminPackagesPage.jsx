import React, { useState, useEffect } from 'react';
import { pricingPackageService } from '../../api/pricingPackageService.js';
import PackageFormModal from '../../components/PackageFormModal.jsx';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  useEffect(() => {
    pricingPackageService.fetchAllPackages()
      .then(setPackages)
      .catch(() => setPackages([]));
  }, []);

  function handleDeletePackage(id) {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המנוי?')) return;
    pricingPackageService.deletePackage(id)
      .then(() => setPackages(pkgs => pkgs.filter(pkg => pkg.id !== id)))
      .catch(() => alert('שגיאה במחיקת מנוי'));
  }

  function handleAddNew() {
    setModalInitial(null);
    setModalOpen(true);
  }
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
  function handleModalSubmit(form) {
    const isEdit = !!modalInitial;
    if (isEdit && !modalInitial.id) {
      alert('שגיאה: לא נמצא מזהה מנוי לעריכה');
      return;
    }
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
    const req = isEdit ? pricingPackageService.updatePackage(modalInitial.id, payload) : pricingPackageService.createPackage(payload);
    req
      .then(data => {
        setModalOpen(false);
        setModalInitial(null);
        if (!isEdit) {
          setPackages(pkgs => [...pkgs, { ...payload, id: data.id }]);
        } else {
          setPackages(pkgs => pkgs.map(p => p.id === modalInitial.id ? { ...p, ...payload } : p));
        }
      })
      .catch(e => alert(e.message || 'שגיאה בשמירת מנוי'));
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <h1>ניהול סוגי מנויים</h1>
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
      <PackageFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalInitial}
      />
    </div>
  );
}
