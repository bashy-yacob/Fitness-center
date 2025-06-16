import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const registrationData = {
            ...formData,
            user_type: 'trainee'
        };

        try {
            const response = await register(registrationData);
            setSuccessMessage(response.message + " You will be redirected to the login page.");
            
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone_number: '',
                date_of_birth: '',
                gender: ''
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error("Registration Error:", err);
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                setError(err.response.data.errors.map(error => `• ${error}`).join('\n'));
            } else {
                setError(err.response?.data?.error || 'Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Register for GymFlow</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="first_name">First Name:</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="last_name">Last Name:</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone_number">Phone Number (Optional):</label>
                    <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth:</label>
                    <input
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
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {error && (
                    <div className="error-message">
                        {error.split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </div>
                )}
                
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                <button type="submit" className="submit-button">
                    Create Account
                </button>

                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;