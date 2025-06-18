
import React, { useState, useEffect } from 'react';
import apiService from '../../../api/apiService';
import { useAuth } from '../../../hooks/useAuth'; // נייבא את useAuth כדי לעדכן את המשתמש הגלובלי

function ProfilePage() {

    const { user, updateUserContext } = useAuth(); 

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
    if (loading) {
        return (
            <div className="page-container">
                <div className="section">
                    <div className="card">
                        <p>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    const baseImageUrl = 'http://localhost:3000/uploads/';

    return (
        <div className="page-container">
            <div className="section">
                <h1>Profile</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    {/* Personal Details Section */}
                    <div className="card" style={{ flex: '1 1 350px' }}>
                        <h2>Edit Profile Details</h2>
                        <form onSubmit={handleDetailsSubmit}>
                            <div className="form-group">
                                <label htmlFor="first_name">First Name:</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">Last Name:</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone:</label>
                                <input
                                    className="form-control"
                                    type="tel"
                                    id="phone"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </div>

                            {formData.user_type === 'trainee' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="date_of_birth">Date of Birth:</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="gender">Gender:</label>
                                        <select
                                            className="form-control"
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="section" style={{ margin: '1.5rem 0' }}>
                                <h3>Change Password</h3>
                                <div className="form-group">
                                    <label htmlFor="password">New Password:</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Save Details
                            </button>
                        </form>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <h2>Profile Picture</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            {formData.profile_picture_url ? (
                                <img
                                    src={`${baseImageUrl}${formData.profile_picture_url}`}
                                    alt="Profile"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--border-color)'
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--section-bg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--border-color)'
                                    }}
                                >
                                    No Picture
                                </div>
                            )}

                            <div className="form-group">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="form-control"
                                />
                            </div>

                            <button
                                onClick={handlePictureUpload}
                                disabled={!selectedFile || uploading}
                                className="btn btn-primary"
                            >
                                {uploading ? 'Uploading...' : 'Upload Picture'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Section */}
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>
        </div>
    );
}

export default ProfilePage;