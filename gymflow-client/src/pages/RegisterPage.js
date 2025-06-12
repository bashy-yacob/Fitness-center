import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const registrationData = {
            ...formData,
            user_type: 'trainee'
        };

        if (!registrationData.first_name || !registrationData.last_name || !registrationData.email || !registrationData.password || !registrationData.date_of_birth || !registrationData.gender) {
            setError('All fields except phone number are required.');
            return;
        }

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
            const errorMessages = err.response?.data?.errors;
            if (Array.isArray(errorMessages)) {
                setError(errorMessages.join(' '));
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
            console.error("Registration Error:", err);
        }
    };

    return React.createElement('div', null,
        React.createElement('h2', null, 'Register for GymFlow'),
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'first_name', style: { display: 'block' } }, 'First Name:'),
                React.createElement('input', {
                    type: 'text',
                    id: 'first_name',
                    name: 'first_name',
                    value: formData.first_name,
                    onChange: handleChange,
                    required: true
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'last_name', style: { display: 'block' } }, 'Last Name:'),
                React.createElement('input', {
                    type: 'text',
                    id: 'last_name',
                    name: 'last_name',
                    value: formData.last_name,
                    onChange: handleChange,
                    required: true
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'email', style: { display: 'block' } }, 'Email:'),
                React.createElement('input', {
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    value: formData.email,
                    onChange: handleChange,
                    required: true
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'password', style: { display: 'block' } }, 'Password:'),
                React.createElement('input', {
                    type: 'password',
                    id: 'password',
                    name: 'password',
                    value: formData.password,
                    onChange: handleChange,
                    minLength: 6,
                    required: true
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'phone_number', style: { display: 'block' } }, 'Phone Number (Optional):'),
                React.createElement('input', {
                    type: 'tel',
                    id: 'phone_number',
                    name: 'phone_number',
                    value: formData.phone_number,
                    onChange: handleChange
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'date_of_birth', style: { display: 'block' } }, 'Date of Birth:'),
                React.createElement('input', {
                    type: 'date',
                    id: 'date_of_birth',
                    name: 'date_of_birth',
                    value: formData.date_of_birth,
                    onChange: handleChange,
                    required: true
                })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('label', { htmlFor: 'gender', style: { display: 'block' } }, 'Gender:'),
                React.createElement('select', {
                    id: 'gender',
                    name: 'gender',
                    value: formData.gender,
                    onChange: handleChange,
                    required: true,
                    style: { padding: '5px', minWidth: '100px' }
                },
                    React.createElement('option', { value: '', disabled: true }, 'Select...'),
                    React.createElement('option', { value: 'male' }, 'Male'),
                    React.createElement('option', { value: 'female' }, 'Female'),
                    React.createElement('option', { value: 'other' }, 'Other')
                )
            ),

            error && React.createElement('p', { style: { color: 'red', fontWeight: 'bold' } }, error),
            successMessage && React.createElement('p', { style: { color: 'green', fontWeight: 'bold' } }, successMessage),
            
            React.createElement('button', { type: 'submit', style: { marginTop: '10px', padding: '8px 16px' } }, 'Create Account'),
            
            React.createElement('p', { style: { marginTop: '15px' } },
                'Already have an account? ',
                React.createElement(Link, { to: '/login' }, 'Login here')
            )
        )
    );
}

export default RegisterPage;