// בקובץ: src/components/PaymentModal.jsx

import React, { useState } from 'react';
import apiService from '../api/apiService';
import './PaymentModal.css'; // ניצור את קובץ ה-CSS הזה מיד

function PaymentModal({ gymClass, onClose, onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // פרטי התשלום הם כרגע רק ל-UI, אנחנו לא שולחים אותם לשרת
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        try {
            // זו הקריאה ל-API האמיתי שבנינו בשרת!
            // היא תפעיל את הטרנזקציה של רישום ותשלום.
            await apiService.post(`/classes/${gymClass.id}/pay-and-register`, {});

            // אם הקריאה הצליחה, אנחנו קוראים לפונקציית ה-onSuccess
            // שהגיעה מהקומפוננטה האבא (ClassesPage)
            onSuccess(gymClass.id);

        } catch (err) {
            // הצגת הודעת שגיאה שהגיעה מהשרת
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred during payment.';
            setError(errorMessage);
        } finally {
            // בכל מקרה, מפסיקים את מצב העיבוד
            setIsProcessing(false);
        }
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

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="submit-payment-btn" disabled={isProcessing}>
                        {isProcessing ? 'מעבד תשלום...' : 'שלם עכשיו והירשם'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal;