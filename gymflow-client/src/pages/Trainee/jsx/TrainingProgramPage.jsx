// בקובץ: src/pages/Trainee/jsx/TrainingProgramPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth'; // נשתמש בזה כדי לוודא שהמשתמש מחובר
import apiService from '../../../api/apiService';
import '../css/TrainingProgramPage.css'; // ניצור קובץ CSS חדש לעיצוב

// קומפוננטה קטנה להצגת שדה מידע
const InfoField = ({ label, value }) => (
    <div className="info-field">
        <span className="info-label">{label}:</span>
        <span className="info-value">{value}</span>
    </div>
);

function TrainingProgramPage() {
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchTrainingProgram = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                // קריאה ל-API החדש שבנינו בשרת!
                const programData = await apiService.get('/trainees/my-training-program');
                setProgram(programData); // התשובה תהיה אובייקט התוכנית או null
            } catch (err) {
                console.error("Failed to fetch training program:", err);
                setError('אירעה שגיאה בטעינת תוכנית האימונים.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingProgram();
    }, [user]); // ה-useEffect ירוץ מחדש אם המשתמש משתנה

    // --- הצגת תוכן בהתאם למצב ---

    if (loading) {
        return (
            <div className="page-container">
                <p className="loading-message">טוען את תוכנית האימונים שלך...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="training-program-page-container">
            <h1>תוכנית האימונים שלי</h1>

            {program ? (
                // אם נמצאה תוכנית, נציג את פרטיה
                <div className="program-card">
                    <h2 className="program-name">{program.program_name}</h2>
                    <div className="card-meta">
                        <InfoField label="מאמן/ת" value={program.trainer_name} />
                        <InfoField label="תאריך יצירה" value={new Date(program.created_at).toLocaleDateString('he-IL')} />
                    </div>
                    <div className="program-description">
                        <h3>תיאור התוכנית:</h3>
                        {/* שימוש ב-pre-wrap כדי לשמור על מעברי שורה מה-textarea */}
                        <p style={{ whiteSpace: 'pre-wrap' }}>{program.program_description}</p>
                    </div>
                </div>
            ) : (
                // אם לא נמצאה תוכנית, נציג הודעה מתאימה
                <div className="no-program-card">
                    <h2>לא הוקצתה לך תוכנית</h2>
                    <p>עדיין לא הוקצתה לך תוכנית אימונים אישית. פנה/י למאמן/ת שלך לקבלת תוכנית.</p>
                </div>
            )}
        </div>
    );
}

export default TrainingProgramPage;