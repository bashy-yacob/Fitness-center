// בקובץ: src/pages/Trainee/jsx/ClassesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import PaymentModal from '../../../components/PaymentModal';
import '../css/ClassesPage.css';
import '../../../components/css/PaymentModal.css';

// קומפוננטת ההודעות נשארת כפי שהיא
const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(), 5000);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);
    return (
        <div className={`notification notification-${type}`}>
            {message}
            <button onClick={onDismiss} className="dismiss-btn">×</button>
        </div>
    );
};

function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [selectedClassForPayment, setSelectedClassForPayment] = useState(null);
    const { user } = useAuth();

    // === state חדש לניהול מצב הטעינה של כפתור ספציפי ===
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchAvailableClasses = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const availableClasses = await apiService.get('/classes');
                setClasses(availableClasses);
            } catch (err) {
                setNotification({ message: 'אירעה שגיאה בטעינת החוגים.', type: 'error' });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableClasses();
    }, [user]);

    const handleOpenPaymentModal = (gymClass) => {
        setNotification({ message: '', type: '' });
        setSelectedClassForPayment(gymClass);
    };

    // === פונקציה חדשה ומרכזית שתטפל באישור התשלום וקריאת ה-API ===
    const handleConfirmPayment = async (classId) => {
        // 1. סוגרים את המודאל מיד
        setSelectedClassForPayment(null);
        // 2. קובעים שהחוג הזה נמצא בתהליך עיבוד
        setProcessingId(classId);

        try {
            // 3. מבצעים את קריאת ה-API האמיתית
            await apiService.post(`/classes/${classId}/pay-and-register`, {});

            // 4. אם קריאת ה-API הצליחה, מעדכנים את ה-state
            setClasses(currentClasses => currentClasses.map(cls =>
                cls.id === classId ? { ...cls, isRegistered: true, availableSlots: cls.availableSlots - 1, registeredCount: cls.registeredCount + 1 } : cls
            ));

            // 5. מציגים הודעת הצלחה
            setNotification({ message: 'נרשמת בהצלחה לחוג!', type: 'success' });

        } catch (err) {
            // 6. אם קריאת ה-API נכשלה, מציגים הודעת שגיאה
            const errorMessage = err.response?.data?.error || 'ההרשמה נכשלה. אנא נסה/י שוב.';
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            // 7. בכל מקרה (הצלחה או כישלון), מסירים את מצב העיבוד מהכפתור
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="page-container"><p className="loading-message">טוען חוגים זמינים...</p></div>;
    }

    return (
        <div className="classes-page-container">
            <h1>חוגים פתוחים להרשמה</h1>

            <Notification
                message={notification.message}
                type={notification.type}
                onDismiss={() => setNotification({ message: '', type: '' })}
            />

            <div className="classes-list">
                {classes.map(cls => (
                    <div key={cls.id} className="class-card">
                        <div className="class-details">
                            <h2>{cls.name}</h2>
                            <p><strong>מאמן/ה:</strong> {cls.trainerName}</p>
                            <p><strong>תאריך ושעה:</strong> {new Date(cls.startTime).toLocaleString('he-IL')}</p>
                            <p><strong>מקומות פנויים:</strong> {cls.availableSlots} / {cls.maxCapacity}</p>
                        </div>
                        <div className="class-actions">
                            <button
                                onClick={() => handleOpenPaymentModal(cls)}
                                // === עדכון לוגיקת ה-disabled ===
                                disabled={cls.availableSlots <= 0 || cls.isRegistered || processingId === cls.id}
                                className="register-btn"
                            >
                                {/* === עדכון הטקסט שמוצג בכפתור === */}
                                {processingId === cls.id ? 'מעבד...' : (cls.isRegistered ? 'נרשמת' : (cls.availableSlots <= 0 ? 'מלא' : 'הירשם'))}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedClassForPayment && (
                <PaymentModal
                    gymClass={selectedClassForPayment}
                    onClose={() => setSelectedClassForPayment(null)}
                    // === שינוי מהותי: המודאל יקרא לפונקציה אחת שתטפל בהכל ===
                    onConfirm={handleConfirmPayment}
                />
            )}
        </div>
    );
}

export default ClassesPage;