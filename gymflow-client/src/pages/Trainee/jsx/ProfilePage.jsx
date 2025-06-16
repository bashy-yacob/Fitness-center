import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import '../css/ProfilePage.css'; // ייבוא קובץ ה-CSS

// הדמיה של ה-hooks וה-api
const useAuth = () => ({ user: { id: '123' } }); 
const apiService = {
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { firstName: 'ישראלה', lastName: 'ישראלי', email: 'israela@gym.com', phoneNumber: '052-1234567', profilePictureUrl: 'https://via.placeholder.com/150' };
  },
  put: async (url, data) => {
    console.log('Updating profile:', url, data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'הפרופיל עודכן בהצלחה!' };
  }
};

// קומפוננטה קטנה לניהול תמונת פרופיל
const ProfilePicture = ({ imageUrl }) => (
    <div className="profile-picture-container">
        <img src={imageUrl} alt="תמונת פרופיל" className="profile-picture" />
        <button className="upload-btn">שנה תמונה</button>
        {/* לוגיקה להעלאת קובץ תתווסף כאן בעתיד */}
    </div>
);


function ProfilePage() {
    const { user } = useAuth();
    // State נפרד לנתוני הטופס
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // State חדש למצב שמירה
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const response = await apiService.get(`/user/${user.id}`);
                setProfile(response);
                // איתחול הטופס עם המידע מהשרת
                setFormData({
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    phoneNumber: response.phoneNumber,
                });
            } catch (err) {
                setError('טעינת נתוני הפרופיל נכשלה.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            await apiService.put(`/user/${user.id}`, formData);
            setSuccessMessage('הפרופיל עודכן בהצלחה!');
        } catch (err) {
            setError('עדכון הפרופיל נכשל. אנא נסה/י שוב.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) return <p className="loading-message">טוען פרופיל...</p>;
    
    return (
        <div className="profile-page-container">
            <h1>הפרופיל שלי</h1>
            <div className="profile-content">
                <ProfilePicture imageUrl={profile?.profilePictureUrl} />
                
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="firstName">שם פרטי</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">שם משפחה</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">אימייל</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">מספר טלפון</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                    </div>

                    {error && <p className="error-message form-error">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <button type="submit" className="submit-btn" disabled={isSaving}>
                        {isSaving ? 'שומר...' : 'שמור שינויים'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;