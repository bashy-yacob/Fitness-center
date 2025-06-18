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
        // שיפור עתידי: להחליף את האישור הבא בחלון מודאל מעוצב
        if (!window.confirm('האם את/ה בטוח/ה שברצונך לבטל את ההרשמה לחוג?')) return;

        setUnregisteringId(classId);
        setError('');

        try {
            await apiService.delete(`/classes/${classId}/unregister`);
            
            // עדכון הממשק מיידית עם הצלחה
            setMyClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
            // Optionally, add a success message here, e.g., using a toast notification library
            // For now, removing from list is the feedback.

        } catch (err) {
            setError('ביטול ההרשמה נכשל. אנא נסה/י שוב.');
            console.error(err);
        } finally {
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
                                <td>{cls.trainer}</td>
                                <td>{new Date(cls.date).toLocaleString('he-IL')}</td>
                                <td>
                                    <span className={`status-badge status-${cls.status.toLowerCase()}`}>
                                        {cls.status}
                                    </span>
                                </td>
                                <td>
                                    {/* הצג את כפתור הביטול רק אם הסטטוס מאפשר זאת */}
                                    {/* Assuming 'נרשם' means registered and eligible for unregistration */}
                                    {cls.status === 'נרשם' && (
                                        <button 
                                            onClick={() => handleUnregister(cls.id)}
                                            disabled={unregisteringId === cls.id}
                                            className="cancel-btn" // Consider renaming class if it's generic for actions
                                        >
                                            {unregisteringId === cls.id ? 'מבטל הרשמה...' : 'בטל הרשמה'}
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