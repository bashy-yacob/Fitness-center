import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import './Classes.css'; // קובץ CSS ייעודי לעמוד
import Card from '../../components/Card'; // נשתמש בכרטיס לעיצוב הכללי

// --- הדמיה ---
const useAuth = () => ({ user: { id: 'trainer-1' } });
const apiService = {
  get: async (url) => {
    console.log(`Fetching from: ${url}`);
    await new Promise(res => setTimeout(res, 800));
    return [
      { id: 101, name: 'פילאטיס בוקר', date: new Date(Date.now() + 86400000 * 2), participants: 8, maxCapacity: 10, status: 'פעיל' },
      { id: 102, name: 'HIIT ערב', date: new Date(Date.now() + 86400000 * 3), participants: 12, maxCapacity: 12, status: 'פעיל' },
      { id: 103, name: 'יוגה למתחילים', date: new Date(Date.now() - 86400000 * 1), participants: 7, maxCapacity: 15, status: 'הושלם' },
      { id: 104, name: 'ספינינג', date: new Date(Date.now() + 86400000 * 5), participants: 0, maxCapacity: 15, status: 'מבוטל' },
    ];
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });

const TrainerClasses = () => {
    // const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // קריאת API אמיתית:
                // const response = await apiService.get(`/trainer/classes/${user.id}`);
                const response = await apiService.get(`/trainer/classes/trainer-1`);
                setClasses(response);
            } catch (err) {
                setError('טעינת רשימת החוגים נכשלה.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    if (loading) return <p className="loading-message">טוען חוגים...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="trainer-classes-page">
            <Card title="ניהול החוגים שלי">
                {classes.length > 0 ? (
                    <table className="classes-table">
                        <thead>
                            <tr>
                                <th>שם החוג</th>
                                <th>תאריך ושעה</th>
                                <th>נרשמים</th>
                                <th>סטטוס</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id}>
                                    <td>{cls.name}</td>
                                    <td>{formatDate(cls.date)}</td>
                                    <td>{cls.participants} / {cls.maxCapacity}</td>
                                    <td>
                                        <span className={`status-badge status-${cls.status}`}>
                                            {cls.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn view">צפה במשתתפים</button>
                                        <button className="action-btn edit">ערוך</button>
                                        <button className="action-btn cancel">בטל</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>לא נמצאו חוגים המשויכים אליך.</p>
                )}
            </Card>
        </div>
    );
};

export default TrainerClasses;