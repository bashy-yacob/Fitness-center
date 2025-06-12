import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { useAuth } from '../hooks/useAuth';

function ClassesListPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // כדי לבדוק אם המשתמש הוא מתאמן

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                const data = await apiService.get('/classes');
                // ה-API שלך מחזיר את כל החוגים, כולל פרטי המאמן והחדר (אם עשית JOIN בשרת)
                setClasses(data);
            } catch (err) {
                setError('Failed to load classes. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []); // המערך הריק מבטיח שה-useEffect ירוץ פעם אחת בלבד, כשהקומפוננטה נטענת

    const handleRegister = async (classId) => {
        try {
            const response = await apiService.post(`/classes/${classId}/register`);
            alert(response.message || 'Successfully registered for the class!');
            // אופציונלי: ניתן לרענן את רשימת החוגים או לעדכן את ה-UI כדי להראות שהמשתמש רשום
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed.');
            console.error(err);
        }
    };

    // פונקציות עזר לעיצוב התאריך והשעה
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    // ----- בניית ה-UI עם React.createElement -----

    if (loading) {
        return React.createElement('p', null, 'Loading classes...');
    }

    if (error) {
        return React.createElement('p', { style: { color: 'red' } }, error);
    }

    return React.createElement('div', { style: { padding: '20px' } },
        React.createElement('h1', null, 'Available Classes'),
        classes.length === 0
            ? React.createElement('p', null, 'No classes are available at the moment.')
            : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '15px' } },
                classes.map(classItem =>
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
                        React.createElement('p', null, 
                            React.createElement('strong', null, 'Capacity: '),
                            `${classItem.registrations_count || 0} / ${classItem.max_capacity}` // נניח שהשרת מחזיר ספירת רשומים
                        ),
                        // הצג כפתור הרשמה רק אם המשתמש הוא מתאמן
                        user && user.user_type === 'trainee' && React.createElement('button', {
                            onClick: () => handleRegister(classItem.id)
                        }, 'Register')
                    )
                )
            )
    );
}

export default ClassesListPage;