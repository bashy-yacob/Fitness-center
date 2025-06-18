import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/ProfilePage.css'; // ייבוא קובץ ה-CSS

// קומפוננטה קטנה לניהול תמונת פרופיל
const ProfilePicture = ({ imageUrl, onImageChange }) => {
    const fileInputRef = React.useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="profile-picture-container">
            <img src={imageUrl} alt="תמונת פרופיל" className="profile-picture" />
            <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <button type="button" className="upload-btn" onClick={handleButtonClick}>שנה תמונה</button>
        </div>
    );
};


function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    // formData now includes profilePictureUrl and is the single source of truth for form fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profilePictureUrl: ''
    });

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // State חדש למצב שמירה
    const [isUploadingPicture, setIsUploadingPicture] = useState(false); // State for picture upload
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const response = await apiService.get('/users/me');
                setProfile(response);
                // איתחול הטופס עם המידע מהשרת
                setFormData({
                    firstName: response.firstName || '',
                    lastName: response.lastName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    profilePictureUrl: response.profilePictureUrl || '',
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
            await apiService.put('/users/me', formData);
            setSuccessMessage('הפרופיל עודכן בהצלחה!');
        } catch (err) {
            setError('עדכון הפרופיל נכשל. אנא נסה/י שוב.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploadingPicture(true);
            setError('');
            setSuccessMessage('');
            const imageData = new FormData();
            imageData.append('profilePicture', file);

            try {
                const response = await apiService.post('/users/me/profile-picture', imageData);
                // Assuming the server returns the updated user object or at least the new profilePictureUrl
                setProfile(prevProfile => ({ ...prevProfile, profilePictureUrl: response.profilePictureUrl }));
                setFormData(prevFormData => ({ ...prevFormData, profilePictureUrl: response.profilePictureUrl }));
                setSuccessMessage('תמונת הפרופיל עודכנה בהצלחה!');
            } catch (err) {
                setError('העלאת תמונת הפרופיל נכשלה.');
                console.error(err);
            } finally {
                setIsUploadingPicture(false);
            }
        }
    };
    
    if (loading) return <p className="loading-message">טוען פרופיל...</p>;
    
    return (
        <div className="profile-page-container">
            <h1>הפרופיל שלי</h1>
            <div className="profile-content">
                <ProfilePicture
                    imageUrl={formData.profilePictureUrl}
                    onImageChange={handleProfilePictureChange}
                />
                 {isUploadingPicture && <p className="loading-message">מעלה תמונה...</p>}
                
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