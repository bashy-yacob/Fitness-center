import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // --- הוספת Link ---

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await auth.login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error(err);
        }
    };

    // בניית הטופס עם React.createElement
    return React.createElement('div', null,
        React.createElement('h2', null, 'Login'),
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', null,
                React.createElement('label', null, 'Email:'),
                React.createElement('input', {
                    type: 'email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    required: true
                })
            ),
            React.createElement('div', { style: { marginTop: '10px' } },
                React.createElement('label', null, 'Password:'),
                React.createElement('input', {
                    type: 'password',
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    required: true
                })
            ),
            error && React.createElement('p', { style: { color: 'red' } }, error),
            React.createElement('button', { type: 'submit', style: { marginTop: '20px' } }, 'Log In'),
            React.createElement('p', { style: { marginTop: '15px' } },
                "Don't have an account? ",
                React.createElement(Link, { to: '/register' }, 'Register here')
            )
        )
    );
}

export default LoginPage;