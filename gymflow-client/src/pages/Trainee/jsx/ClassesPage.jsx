// בקובץ: src/pages/Trainee/jsx/ClassesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import PaymentModal from '../../../components/PaymentModal'; // ייבוא המודאל החדש
import '../css/ClassesPage.css';
import '../../../components/PaymentModal.css'; // ייבוא ה-CSS של המודאל

function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State חדש לניהול המודאל
    const [selectedClassForPayment, setSelectedClassForPayment] = useState(null);

    // ה-useAuth נשאר, אבל נשתמש בו רק כדי לוודא שהמשתמש מחובר
    const { user } = useAuth();

    // ה-useEffect נשאר כמעט זהה, הוא פשוט יקבל עכשיו isRegistered מהשרת
    useEffect(() => {
        const fetchAvailableClasses = async () => {
            if (!user) return; // הגנה נוספת, למרות שיש ProtectedRoute
            setLoading(true);
            try {
                // הקריאה נשארת זהה, אבל השרת יחזיר עכשיו מידע מותאם אישית
                const availableClasses = await apiService.get('/classes');
                setClasses(availableClasses);
            } catch (err) {
                setError('אירעה שגיאה בטעינת החוגים.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableClasses();
    }, [user]); // הוספת user לתלות כדי שירוץ מחדש אם המשתמש משתנה

    // פונקציה חדשה שפותחת את מודאל התשלום
    const handleOpenPaymentModal = (gymClass) => {
        setError(''); // איפוס שגיאות קודמות
        setSelectedClassForPayment(gymClass);
    };

    // פונקציה שנקראת מהמודאל אחרי תשלום מוצלח
    const handlePaymentSuccess = (paidClassId) => {
        // 1. עדכן את ה-UI מיידית כדי לתת פידבק למשתמש
        setClasses(prevClasses =>
            prevClasses.map(cls =>
                cls.id === paidClassId
                    ? {
                        ...cls,
                        availableSlots: cls.availableSlots - 1,
                        registeredCount: cls.registeredCount + 1,
                        isRegistered: true
                    }
                    : cls
            )
        );
        // 2. סגור את המודאל
        setSelectedClassForPayment(null);
    };


    if (loading) {
        return <p className="loading-message">טוען חוגים זמינים...</p>;
    }

    return (
        <div className="classes-page-container">
            <h1>חוגים פתוחים להרשמה</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="classes-list">
                {classes.length === 0 && !loading ? (
                    <p>לא נמצאו חוגים פתוחים כרגע.</p>
                ) : (
                    classes.map(cls => (
                        <div key={cls.id} className="class-card">
                            <div className="class-details">
                                <h2>{cls.name}</h2>
                                <p><strong>מאמן/ה:</strong> {cls.trainerName}</p>
                                <p><strong>תאריך ושעה:</strong> {new Date(cls.startTime).toLocaleString('he-IL')}</p>
                                <p><strong>מקומות פנויים:</strong> {cls.availableSlots} / {cls.maxCapacity}</p>
                            </div>
                            <div className="class-actions">
                                <button
                                    // שינוי הפונקציה שנקראת בלחיצה
                                    onClick={() => handleOpenPaymentModal(cls)}
                                    // הלוגיקה של ה-disabled עכשיו מתבססת על isRegistered מה-API
                                    disabled={cls.availableSlots <= 0 || cls.isRegistered}
                                    className="register-btn"
                                >
                                    {/* שימוש ב-isRegistered כדי להציג את הטקסט הנכון */}
                                    {cls.isRegistered ? 'נרשמת' : (cls.availableSlots <= 0 ? 'מלא' : 'הירשם')}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* הוספת המודאל לעמוד, הוא יוצג רק אם נבחר חוג */}
            {selectedClassForPayment && (
                <PaymentModal
                    gymClass={selectedClassForPayment}
                    onClose={() => setSelectedClassForPayment(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

export default ClassesPage;