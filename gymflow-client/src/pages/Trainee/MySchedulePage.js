import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import './MySchedulePage.css'; // ייבוא קובץ ה-CSS

// הדמיה של ה-hooks וה-api
const useAuth = () => ({ user: { id: '123' } }); 
const apiService = {
  get: async (url) => {
    console.log(`Fetching from: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 1, name: 'פילאטיס מכשירים', trainer: 'דנה כהן', date: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'נרשם' },
      { id: 4, name: 'זומבה', trainer: 'רוני לב', date: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'נרשם' },
      { id: 5, name: 'יוגה למתחילים', trainer: 'יעל לוי', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'השתתף' },
    ];
  },
  post: async (url, data) => {
    console.log(`Posting to: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { success: true, message: 'הביטול בוצע בהצלחה.' };
  }
};


function MySchedulePage() {
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null); // ID של החוג בתהליך ביטול
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyClasses = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                // Endpoint: GET /my-classes/:traineeId
                const response = await apiService.get(`/my-classes/${user.id}`);
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

    const handleCancel = async (classId) => {
        // שיפור עתידי: להחליף את האישור הבא בחלון מודאל מעוצב
        if (!window.confirm('האם את/ה בטוח/ה שברצונך לבטל את ההרשמה לחוג?')) return;

        setCancellingId(classId);
        setError('');

        try {
            // Endpoint: POST /classes/cancel
            await apiService.post('/classes/cancel', { classId, traineeId: user.id });
            
            // עדכון הממשק מיידית עם הצלחה
            setMyClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));

        } catch (err) {
            setError('ביטול ההרשמה נכשל. אנא נסה/י שוב.');
            console.error(err);
        } finally {
            setCancellingId(null);
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
                                    {cls.status === 'נרשם' && (
                                        <button 
                                            onClick={() => handleCancel(cls.id)}
                                            disabled={cancellingId === cls.id}
                                            className="cancel-btn"
                                        >
                                            {cancellingId === cls.id ? 'מבטל...' : 'בטל הרשמה'}
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