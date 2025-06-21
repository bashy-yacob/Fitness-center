// בקובץ: src/pages/Trainee/jsx/ClassesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/ClassesPage.css';

function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registeringId, setRegisteringId] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAvailableClasses = async () => {
            setLoading(true);
            try {
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
    }, []);

    const handleRegister = async (classId) => {
        if (!user) {
            setError('חובה להתחבר כדי להירשם לחוג.');
            return;
        }
        setRegisteringId(classId);
        setError('');

        try {
            await apiService.post(`/classes/${classId}/register`, {});
            setClasses(prevClasses => 
                prevClasses.map(cls => 
                    cls.id === classId 
                    ? { ...cls, availableSlots: cls.availableSlots - 1, registeredCount: cls.registeredCount + 1, isRegistered: true } 
                    : cls
                )
            );
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'ההרשמה לחוג נכשלה. ייתכן שהוא מלא או שכבר נרשמת.';
            setError(errorMessage);
        } finally {
            setRegisteringId(null);
        }
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
                                {/* ==== תיקון 1: שימוש ב-trainerName ==== */}
                                <p><strong>מאמן/ה:</strong> {cls.trainerName}</p>
                                {/* ==== תיקון 2: שימוש ב-startTime ==== */}
                                <p><strong>תאריך ושעה:</strong> {new Date(cls.startTime).toLocaleString('he-IL')}</p>
                                {/* ==== תיקון 3: שימוש ב-availableSlots ו-maxCapacity ==== */}
                                <p><strong>מקומות פנויים:</strong> {cls.availableSlots} / {cls.maxCapacity}</p>
                            </div>
                            <div className="class-actions">
                                <button 
                                    onClick={() => handleRegister(cls.id)}
                                    disabled={registeringId === cls.id || cls.availableSlots <= 0 || cls.isRegistered}
                                    className="register-btn"
                                >
                                    {registeringId === cls.id ? 'רושם...' : (cls.isRegistered ? 'נרשמת' : (cls.availableSlots <= 0 ? 'מלא' : 'הירשם'))}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ClassesPage;