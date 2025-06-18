import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/ClassesPage.css'; // ייבוא קובץ ה-CSS החדש


function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registeringId, setRegisteringId] = useState(null); // ID של החוג שנמצא בתהליך רישום
    const { user } = useAuth();

    useEffect(() => {
        const fetchAvailableClasses = async () => {
            try {
                const allClasses = await apiService.get('/classes');
                const now = new Date();
                const upcomingClasses = allClasses.filter(cls => new Date(cls.date) > now);
                setClasses(upcomingClasses);
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

        setRegisteringId(classId); // הפעלת מצב טעינה עבור הכפתור הספציפי
        setError(''); // איפוס שגיאות קודמות

        try {
            // Ensure the endpoint is correct and send an empty object as payload
            const response = await apiService.post(`/classes/${classId}/register`, {});
            
            // במקום alert, נעדכן את הממשק
            // הסרת החוג מהרשימה כדי לספק פידבק מיידי
            setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
            // אפשר להוסיף כאן הודעת "טוסט" להצלחה
            console.log(response.message);

        } catch (err) {
            // הצגת הודעת שגיאה ספציפית מהשרת, אם קיימת
            const errorMessage = err.message || 'ההרשמה לחוג נכשלה. ייתכן שהוא מלא.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setRegisteringId(null); // סיום מצב טעינה, בין אם הצליח או נכשל
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
                                <p><strong>מאמן/ה:</strong> {cls.trainer}</p>
                                <p><strong>קטגוריה:</strong> {cls.category}</p>
                                <p><strong>תאריך ושעה:</strong> {new Date(cls.date).toLocaleString('he-IL')}</p>
                            </div>
                            <div className="class-actions">
                                <button 
                                    onClick={() => handleRegister(cls.id)}
                                    disabled={registeringId === cls.id} // השבתת הכפתור בזמן רישום
                                    className="register-btn"
                                >
                                    {registeringId === cls.id ? 'רושם...' : 'הירשם'}
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