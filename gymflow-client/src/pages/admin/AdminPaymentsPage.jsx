import React, { useState, useEffect } from 'react';
import { fetchAllPayments } from '../../api/paymentService.js';
import './AdminPaymentsPage.css';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchAllPayments()
      .then(setPayments)
      .catch(() => setPayments([]));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <h1>ניהול תשלומים</h1>
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
    </div>
  );
}
