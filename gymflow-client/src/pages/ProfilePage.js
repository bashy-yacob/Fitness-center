// src/pages/ProfilePage.js - הקוד המלא והסופי המשלב עדכון פרטים והעלאת תמונה

import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { useAuth } from '../hooks/useAuth'; // נייבא את useAuth כדי לעדכן את המשתמש הגלובלי

function ProfilePage() {
    // --- ניהול מצב (State) ---
    const { user, updateUserContext } = useAuth(); // גישה למשתמש ופונקציית עדכון מהקונטקסט
    
    // סטייט לטופס הפרטים האישיים
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        user_type: '',
        profile_picture_url: '' // חשוב להוסיף את זה
    });
    
    // סטייטים נפרדים לפעולות ספציפיות
    const [password, setPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // סטייטים לניהול חווית המשתמש
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- טעינת נתוני המשתמש הראשוניים ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const data = await apiService.get('/users/me');
                
                const initialData = {
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
                    gender: data.gender || '',
                    user_type: data.user_type || '',
                    profile_picture_url: data.profile_picture_url || ''
                };
                
                setFormData(initialData);
            } catch (err) {
                setError('Failed to load profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // --- פונקציות לטיפול באירועים ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // פונקציה לעדכון פרטי הטקסט
    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const dataToSend = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number
        };

        if (formData.user_type === 'trainee') {
            dataToSend.date_of_birth = formData.date_of_birth;
            dataToSend.gender = formData.gender;
        }

        if (password) {
            dataToSend.password = password;
        }

        try {
            await apiService.put('/users/me', dataToSend);
            setSuccess('Profile details updated successfully!');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        }
    };

    // פונקציה להעלאת תמונת הפרופיל
    const handlePictureUpload = async () => {
        if (!selectedFile) return;

        const uploadData = new FormData();
        uploadData.append('profilePicture', selectedFile);

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.post('/users/me/profile-picture', uploadData, );
            
            setFormData(prev => ({ ...prev, profile_picture_url: response.profile_picture_url }));
            updateUserContext({ ...user, profile_picture_url: response.profile_picture_url });
            setSuccess('Picture uploaded successfully!');
            setSelectedFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Picture upload failed.');
        } finally {
            setUploading(false);
        }
    };

    // --- רינדור הקומפוננטה ---
    if (loading) return React.createElement('p', null, 'Loading profile...');

    const baseImageUrl = 'http://localhost:3000/uploads/';

    return React.createElement('div', { style: { padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '40px' } },
        
        // --- עמודה 1: טופס פרטים אישיים ---
        React.createElement('div', { style: { flex: '1 1 350px' } },
            React.createElement('h2', null, 'Edit Profile Details'),
            React.createElement('form', { onSubmit: handleDetailsSubmit },
                 // כאן מגיע כל קוד הטופס הקיים שלך: first_name, last_name, email, password...
                React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'First Name:'), React.createElement('input', { type: 'text', name: 'first_name', value: formData.first_name, onChange: handleChange, required: true })),
                React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'Last Name:'), React.createElement('input', { type: 'text', name: 'last_name', value: formData.last_name, onChange: handleChange, required: true })),
                React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'Email:'), React.createElement('input', { type: 'email', name: 'email', value: formData.email, onChange: handleChange, required: true })),
                React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'Phone:'), React.createElement('input', { type: 'tel', name: 'phone_number', value: formData.phone_number, onChange: handleChange })),
                formData.user_type === 'trainee' && React.createElement(React.Fragment, null, React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'Date of Birth:'), React.createElement('input', { type: 'date', name: 'date_of_birth', value: formData.date_of_birth, onChange: handleChange })), React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'Gender:'), React.createElement('select', { name: 'gender', value: formData.gender, onChange: handleChange }, React.createElement('option', { value: '' }, 'Select...'), React.createElement('option', { value: 'male' }, 'Male'), React.createElement('option', { value: 'female' }, 'Female'), React.createElement('option', { value: 'other' }, 'Other')))),
                React.createElement('hr', { style: { margin: '20px 0' } }),
                React.createElement('h4', null, 'Change Password'),
                React.createElement('div', { style: { marginBottom: '10px' } }, React.createElement('label', { style: { display: 'inline-block', width: '100px' } }, 'New Password:'), React.createElement('input', { type: 'password', name: 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: 'Leave blank to keep current' })),
                React.createElement('button', { type: 'submit', style: { marginTop: '20px', padding: '8px 16px' } }, 'Save Details')
            )
        ),
        
        // --- עמודה 2: ניהול תמונת פרופיל ---
        React.createElement('div', { style: { flex: '1 1 300px' } },
            React.createElement('h2', null, 'Profile Picture'),
            formData.profile_picture_url 
                ? React.createElement('img', { src: `${baseImageUrl}${formData.profile_picture_url}`, alt: "Profile", style: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc', marginBottom: '20px' }})
                : React.createElement('div', { style: { width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', textAlign: 'center'}}, 'No Picture'),
            
            React.createElement('div', null,
                React.createElement('input', { type: 'file', accept: "image/png, image/jpeg, image/jpg", onChange: (e) => setSelectedFile(e.target.files[0]) }),
                React.createElement('button', { onClick: handlePictureUpload, disabled: !selectedFile || uploading, style: { marginTop: '10px', padding: '8px 12px' } }, uploading ? 'Uploading...' : 'Upload Picture')
            )
        ),

        // --- אזור להצגת הודעות שגיאה/הצלחה כלליות ---
        React.createElement('div', { style: { width: '100%', flexBasis: '100%', textAlign: 'center', marginTop: '20px' } },
             error && React.createElement('p', { style: { color: 'red' } }, error),
             success && React.createElement('p', { style: { color: 'green' } }, success)
        )
    );
}

export default ProfilePage;