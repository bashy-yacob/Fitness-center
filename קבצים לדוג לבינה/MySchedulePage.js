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

    // ----- בניית ה-UI עם React.createElement -----

    if (loading) {
        return React.createElement('p', null, 'Loading your schedule...');
    }

    if (error) {
        return React.createElement('p', { style: { color: 'red' } }, error);
    }

    return React.createElement('div', { style: { padding: '20px' } },
        React.createElement('h1', null, 'My Schedule'),
        myClasses.length === 0
            ? React.createElement('div', null,
                React.createElement('p', null, 'You are not registered for any classes yet.'),
                React.createElement(Link, { to: '/classes' }, 'Browse available classes')
            )
            : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '15px' } },
                myClasses.map(classItem =>
                    React.createElement('div', {
                        key: classItem.id,
                        style: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }
                    },
                        React.createElement('h3', { style: { marginTop: 0 } }, classItem.name),
                        React.createElement('p', null, classItem.description),
                        React.createElement('p', null,
                            React.createElement('strong', null, 'Time: '),
                            `${formatDateTime(classItem.start_time)} - ${formatDateTime(classItem.end_time)}`
                        ),
                        React.createElement('button', {
                            onClick: () => handleUnregister(classItem.id),
                            style: { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }
                        }, 'Unregister')
                    )
                )
            )
    );
}

export default MySchedulePage;