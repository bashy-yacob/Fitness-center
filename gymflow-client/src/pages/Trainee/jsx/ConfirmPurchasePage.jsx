import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../../api/apiService';

function ConfirmPurchasePage() {
  const { packageId } = useParams();
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPackage() {
      try {
        const types = await apiService.get('/subscriptions/types');
        const found = types.find((type) => String(type.id) === String(packageId));
        if (!found) throw new Error('חבילה לא נמצאה');
        setPackageInfo(found);
      } catch (err) {
        setError('שגיאה בטעינת החבילה');
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [packageId]);

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      await apiService.post('/subscriptions/purchase', {
        subscriptionTypeId: Number(packageId),
        paymentDetails: {
          transaction_id: `txn_sub_${Date.now()}`,
          status: 'completed',
          notes: "" // שלח מחרוזת ריקה במקום null
        },
      });
      alert('הרכישה בוצעה בהצלחה!');
      navigate('/trainee/subscriptions/manage');
    } catch (err) {
      setError('הרכישה נכשלה');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>טוען פרטי חבילה...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!packageInfo) return <div>לא נמצאה חבילה</div>;

  return (
    <div className="confirm-purchase-page">
      <h2>אישור רכישת חבילה</h2>
      <p>האם לאשר רכישת החבילה: <b>{packageInfo.name}</b>?</p>
      <p>מחיר: ₪{parseFloat(packageInfo.price).toFixed(0)} / {packageInfo.duration_days} ימים</p>
      <button onClick={handlePurchase} disabled={processing}>
        אשר ושלם
      </button>
      <button onClick={() => navigate(-1)} disabled={processing} style={{marginRight:'1em'}}>
        חזור
      </button>
    </div>
  );
}

export default ConfirmPurchasePage;
