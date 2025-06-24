import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/MySchedulePage.css'; // ייבוא קובץ ה-CSS

function MySchedulePage() {
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unregisteringId, setUnregisteringId] = useState(null); // ID of the class being unregistered
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyClasses = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const response = await apiService.get('/classes/my-registrations');
                setMyClasses(response);
            } catch (err) {
                setError('אירעה שגיאה בטעינת מערך השיעורים שלך.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyClasses();
    }, [user]);

     const handleUnregister = async (classId) => {
    // 1. הודעת אישור משופרת
    const confirmMessage = "האם לבטל את ההרשמה לחוג?\nשים/י לב: הנהלת המכון תיצור עמך קשר לגבי ההחזר הכספי.";
    if (!window.confirm(confirmMessage)) return;

    setUnregisteringId(classId);
    setError('');

    try {
        await apiService.delete(`/classes/${classId}/unregister`);
        
        // 2. עדכון מיידי של ה-UI לסטטוס 'cancelled'
        setMyClasses(prevClasses =>
            prevClasses.map(cls =>
                cls.id === classId ? { ...cls, status: 'cancelled' } : cls
            )
        );
        
        // 3. הצגת הודעת הצלחה
        alert('ההרשמה בוטלה בהצלחה.');

    } catch (err) {
        const errorMessage = err.response?.data?.message || 'ביטול ההרשמה נכשל. אנא נסה/י שוב.';
        alert(`שגיאה: ${errorMessage}`);
        setError(errorMessage);
    } finally {
        // 4. לוודא שתמיד מפסיקים את מצב הטעינה
        setUnregisteringId(null);
    }
};

    if (loading) {
        return <p className="loading-message">טוען את מערך השיעורים שלך...</p>;
    }

    return (
        <div className="schedule-page-container">
            <h1>מערך השיעורים שלי</h1>
            
            {error && <p className="error-message">{error}</p>}
            
            {myClasses.length === 0 ? (
                <p className="no-classes-message">עדיין לא נרשמת לאף חוג. זה הזמן להתחיל!</p>
            ) : (
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>שם החוג</th>
                            <th>מאמן/ת</th>
                            <th>תאריך ושעה</th>
                            <th>סטטוס</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myClasses.map(cls => (
                            <tr key={cls.id}>
                                <td>{cls.name}</td>
                                <td>{cls.trainer_name}</td>
                                <td>
                                    {new Date(cls.start_time).toLocaleString('he-IL', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td>
                                    <span className={`status-badge status-${(cls.status || '').toLowerCase()}`}>
                                        {cls.status || 'לא ידוע'}
                                    </span>
                                </td>
                                <td>
                                    {cls.status === 'registered' && (
                                        <button 
                                            onClick={() => handleUnregister(cls.id)}
                                            disabled={unregisteringId === cls.id}
                                            className="cancel-btn"
                                        >
                                            {unregisteringId === cls.id ? 'מבטל...' : 'בטל הרשמה'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default MySchedulePage;