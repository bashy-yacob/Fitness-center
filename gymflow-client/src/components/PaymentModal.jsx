// בקובץ: src/components/PaymentModal.jsx

import React, { useState } from 'react';
// apiService לא נחוץ כאן יותר
// import apiService from '../api/apiService'; 
import './css/PaymentModal.css';

// === שינוי בחתימת הפונקציה: מקבלים onConfirm במקום onSuccess/onError ===
function PaymentModal({ gymClass, onClose, onConfirm }) {
    // isProcessing נשאר כדי להציג "מעבד..." בזמן הלחיצה
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '', expiryDate: '', cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    // === פונקציית ה-handleSubmit פשוטה משמעותית ===
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // פשוט קוראים לפונקציה onConfirm שהגיעה מהאבא
        // ומעבירים לה את ה-ID של החוג.
        if (onConfirm) {
            onConfirm(gymClass.id);
        }
        
        // אין צורך ב-try/catch/finally כאן, כי העמוד הראשי מטפל בהכל.
    };

    if (!gymClass) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>
                <h2>הרשמה לחוג: {gymClass.name}</h2>
                <p><strong>מאמן/ה:</strong> {gymClass.trainerName}</p>
                <p className="payment-price"><strong>מחיר:</strong> 50.00 ₪</p>
                <hr />
                
                <form onSubmit={handleSubmit}>
                    <h4>פרטי תשלום</h4>
                    <div className="form-group">
                        <label htmlFor="cardNumber">מספר כרטיס</label>
                        <input type="text" id="cardNumber" name="cardNumber" value={paymentDetails.cardNumber} onChange={handleInputChange} placeholder="1234 5678 1234 5678" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expiryDate">תוקף</label>
                            <input type="text" id="expiryDate" name="expiryDate" value={paymentDetails.expiryDate} onChange={handleInputChange} placeholder="MM/YY" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" value={paymentDetails.cvv} onChange={handleInputChange} placeholder="123" required />
                        </div>
                    </div>

                    <button type="submit" className="submit-payment-btn" disabled={isProcessing}>
                        {isProcessing ? 'מעבד...' : 'שלם עכשיו והירשם'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal;