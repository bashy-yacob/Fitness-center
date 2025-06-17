import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { useAuth } from '../hooks/useAuth';

function ClassesListPage() {
//     const [classes, setClasses] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const { user } = useAuth(); // כדי לבדוק אם המשתמש הוא מתאמן

//     useEffect(() => {
//         const fetchClasses = async () => {
//             try {
//                 setLoading(true);
//                 const data = await apiService.get('/classes');
//                 // ה-API שלך מחזיר את כל החוגים, כולל פרטי המאמן והחדר (אם עשית JOIN בשרת)
//                 setClasses(data);
//             } catch (err) {
//                 setError('Failed to load classes. Please try again later.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchClasses();
//     }, []); // המערך הריק מבטיח שה-useEffect ירוץ פעם אחת בלבד, כשהקומפוננטה נטענת

//     const handleRegister = async (classId) => {
//         try {
//             const response = await apiService.post(`/classes/${classId}/register`);
//             alert(response.message || 'Successfully registered for the class!');
//             // אופציונלי: ניתן לרענן את רשימת החוגים או לעדכן את ה-UI כדי להראות שהמשתמש רשום
//         } catch (err) {
//             alert(err.response?.data?.message || 'Registration failed.');
//             console.error(err);
//         }
//     };

//     // פונקציות עזר לעיצוב התאריך והשעה
//     const formatDateTime = (isoString) => {
//         if (!isoString) return 'N/A';
//         return new Date(isoString).toLocaleString('he-IL', {
//             dateStyle: 'short',
//             timeStyle: 'short'
//         });
//     };

//     // ----- בניית ה-UI עם React.createElement -----

    if (loading) {
        return (
            <div className="page-container">
                <div className="section">
                    <div className="card">
                        <p>Loading classes...</p>
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
                <h1>Available Classes</h1>
                {classes.length === 0 ? (
                    <div className="card">
                        <p>No classes are available at the moment.</p>
                    </div>
                ) : (
                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {classes.map(classItem => (
                                <div key={classItem.id} className="section" style={{ margin: 0 }}>
                                    <h3>{classItem.name}</h3>
                                    <p>{classItem.description}</p>
                                    <p>
                                        <strong>Time: </strong>
                                        {formatDateTime(classItem.start_time)} - {formatDateTime(classItem.end_time)}
                                    </p>
                                    <p>
                                        <strong>Capacity: </strong>
                                        {classItem.registrations_count || 0} / {classItem.max_capacity}
                                    </p>
                                    {user && user.user_type === 'trainee' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleRegister(classItem.id)}
                                        >
                                            Register
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClassesListPage;