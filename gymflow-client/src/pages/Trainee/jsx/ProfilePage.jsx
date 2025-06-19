import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';
import '../css/ProfilePage.css';

const ProfilePicture = ({ imageUrl, onImageChange, isUploading }) => {
    const fileInputRef = React.useRef(null);
    const defaultImage = '/images/default-profile.png';

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="profile-picture-container">
            <div className={`profile-image-wrapper ${isUploading ? 'uploading' : ''}`}>
                <img 
                    src={imageUrl || defaultImage} 
                    alt="תמונת פרופיל" 
                    className="profile-picture"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                />
                {isUploading && <div className="upload-overlay">מעלה...</div>}
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <button 
                type="button" 
                className="upload-btn" 
                onClick={handleButtonClick}
                disabled={isUploading}
            >
                {isUploading ? 'מעלה תמונה...' : 'שנה תמונה'}
            </button>
        </div>
    );
};

function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profilePictureUrl: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const response = await apiService.get('/users/me');
                
                // Store the original data
                setOriginalData(response);
                
                // Set the profile data
                setProfile(response);
                
                // Initialize form data with the response
                const initialFormData = {
                    firstName: response.firstName || '',
                    lastName: response.lastName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    profilePictureUrl: response.profilePictureUrl || ''
                };
                setFormData(initialFormData);
            } catch (err) {
                setError('טעינת נתוני הפרופיל נכשלה.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) {
            errors.firstName = 'שם פרטי הוא שדה חובה';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'שם משפחה הוא שדה חובה';
        }
        if (!formData.email.trim()) {
            errors.email = 'אימייל הוא שדה חובה';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'כתובת אימייל לא תקינה';
        }
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'מספר טלפון הוא שדה חובה';
        } else if (!/^05\d{8}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'מספר טלפון לא תקין';
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field-specific error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleStartEditing = () => {
        setIsEditing(true);
        setError('');
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData(originalData); // Reset to original data
        setFieldErrors({});
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await apiService.put('/users/me', formData);
            setProfile(response);
            setOriginalData(response);
            setIsEditing(false);
            setSuccessMessage('הפרופיל עודכן בהצלחה!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'עדכון הפרופיל נכשל. אנא נסה/י שוב.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('יש להעלות קובץ מסוג תמונה בלבד (JPEG, PNG, או GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('גודל התמונה חייב להיות קטן מ-5MB');
            return;
        }

        setIsUploadingPicture(true);
        setError('');
        setSuccessMessage('');
        const imageData = new FormData();
        imageData.append('profilePicture', file);

        try {
            const response = await apiService.post('/users/me/profile-picture', imageData);
            const updatedPictureUrl = response.profilePictureUrl;
            setProfile(prev => ({ ...prev, profilePictureUrl: updatedPictureUrl }));
            setFormData(prev => ({ ...prev, profilePictureUrl: updatedPictureUrl }));
            setOriginalData(prev => ({ ...prev, profilePictureUrl: updatedPictureUrl }));
            setSuccessMessage('תמונת הפרופיל עודכנה בהצלחה!');
            
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError('העלאת תמונת הפרופיל נכשלה.');
            console.error(err);
        } finally {
            setIsUploadingPicture(false);
        }
    };
    
    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">טוען פרופיל...</p>
        </div>
    );

    if (!profile) return (
        <div className="error-container">
            <p className="error-message">לא נמצאו נתוני פרופיל</p>
        </div>
    );
    
    return (
        <div className="profile-page-container">
            <h1>הפרופיל שלי</h1>
            <div className="profile-content">
                <ProfilePicture
                    imageUrl={formData.profilePictureUrl}
                    onImageChange={handleProfilePictureChange}
                    isUploading={isUploadingPicture}
                />
                
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="firstName">שם פרטי *</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            value={formData.firstName} 
                            onChange={handleChange}
                            className={fieldErrors.firstName ? 'error' : ''}
                            disabled={!isEditing}
                        />
                        {fieldErrors.firstName && (
                            <span className="error-message">{fieldErrors.firstName}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">שם משפחה *</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            value={formData.lastName} 
                            onChange={handleChange}
                            className={fieldErrors.lastName ? 'error' : ''}
                            disabled={!isEditing}
                        />
                        {fieldErrors.lastName && (
                            <span className="error-message">{fieldErrors.lastName}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">אימייל *</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange}
                            className={fieldErrors.email ? 'error' : ''}
                            disabled={!isEditing}
                        />
                        {fieldErrors.email && (
                            <span className="error-message">{fieldErrors.email}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">מספר טלפון *</label>
                        <input 
                            type="tel" 
                            id="phoneNumber" 
                            name="phoneNumber" 
                            value={formData.phoneNumber} 
                            onChange={handleChange}
                            className={fieldErrors.phoneNumber ? 'error' : ''}
                            placeholder="05xxxxxxxx"
                            disabled={!isEditing}
                        />
                        {fieldErrors.phoneNumber && (
                            <span className="error-message">{fieldErrors.phoneNumber}</span>
                        )}
                    </div>

                    {error && <p className="error-message form-error">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <div className="form-actions">
                        {!isEditing ? (
                            <button 
                                type="button" 
                                className="edit-btn" 
                                onClick={handleStartEditing}
                            >
                                ערוך פרטים
                            </button>
                        ) : (
                            <>
                                <button 
                                    type="submit" 
                                    className="submit-btn" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'שומר שינויים...' : 'שמור שינויים'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                >
                                    ביטול
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;