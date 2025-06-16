import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth'; // נניח שה-Hook הזה קיים
// import apiService from '../../api/apiService'; // נניח ששירות ה-API קיים
import './ClassesPage.css'; // ייבוא קובץ ה-CSS החדש

// הדמיה של ה-hooks וה-api כדי שהקוד יעבוד
const useAuth = () => ({ user: { id: '123' } }); 
const apiService = {
  get: async (url) => {
    console.log(`Fetching from: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: 1, name: 'פילאטיס מכשירים', trainer: 'דנה כהן', category: 'גמישות', date: new Date(Date.now() + 86400000 * 1).toISOString() },
      { id: 2, name: 'יוגה ויניאסה', trainer: 'יעל לוי', category: 'רוגע', date: new Date(Date.now() + 86400000 * 2).toISOString() },
      { id: 3, name: 'אימון HIIT', trainer: 'אביב גורן', category: 'כוח', date: new Date(Date.now() + 86400000 * 2).toISOString() }
    ];
  },
  post: async (url, data) => {
    console.log(`Posting to: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // הדמיית שגיאה אפשרית
    if (data.classId === 3) {
      throw new Error("החוג מלא, לא ניתן להירשם.");
    }
    return { success: true, message: 'ההרשמה בוצעה בהצלחה!' };
  }
};


function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registeringId, setRegisteringId] = useState(null); // ID של החוג שנמצא בתהליך רישום
    const { user } = useAuth();

    useEffect(() => {
        const fetchAvailableClasses = async () => {
            try {
                const availableClasses = await apiService.get('/classes/available');
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

        setRegisteringId(classId); // הפעלת מצב טעינה עבור הכפתור הספציפי
        setError(''); // איפוס שגיאות קודמות

        try {
            const response = await apiService.post('/classes/register', { 
                classId: classId, 
                traineeId: user.id 
            });
            
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