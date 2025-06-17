import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // נייבא Link למקרה שהרשימה ריקה
import apiService from '../api/apiService';

function MySchedulePage() {
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // פונקציית עזר לטעינת החוגים של המשתמש
    const fetchMySchedule = async () => {
        try {
            setLoading(true);
            // כאן אנו מניחים שיצרת את נקודת הקצה הזו בשרת
            const data = await apiService.get('/classes/my-registrations');
            setMyClasses(data);
        } catch (err) {
            setError('Failed to load your schedule. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMySchedule();
    }, []); // רץ פעם אחת כשהקומפוננטה נטענת

    const handleUnregister = async (classId) => {
        // נוודא שהמשתמש באמת רוצה לבטל
        if (window.confirm('Are you sure you want to unregister from this class?')) {
            try {
                const response = await apiService.delete(`/classes/${classId}/unregister`);
                alert(response.message || 'Successfully unregistered.');
                // הדרך הטובה ביותר לעדכן את ה-UI היא לסנן את החוג מהמערך המקומי
                setMyClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to unregister.');
                console.error(err);
            }
        }
    };

    // פונקציית עזר לעיצוב התאריך והשעה
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="section">
                    <div className="card">
                        <p>Loading your schedule...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="section">
                    <div className="alert alert-error">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="section">
                <h1>My Schedule</h1>
                {myClasses.length === 0 ? (
                    <div className="card">
                        <p>You are not registered for any classes yet.</p>
                        <Link to="/classes" className="btn btn-primary">Browse available classes</Link>
                    </div>
                ) : (
                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {myClasses.map(classItem => (
                                <div key={classItem.id} className="section" style={{ margin: 0 }}>
                                    <h3>{classItem.name}</h3>
                                    <p>{classItem.description}</p>
                                    <p>
                                        <strong>Time: </strong>
                                        {formatDateTime(classItem.start_time)} - {formatDateTime(classItem.end_time)}
                                    </p>
                                    <button
                                        onClick={() => handleUnregister(classItem.id)}
                                        className="btn"
                                        style={{ backgroundColor: 'var(--error-color)', color: 'white' }}
                                    >
                                        Unregister
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>    );
}

export default MySchedulePage;