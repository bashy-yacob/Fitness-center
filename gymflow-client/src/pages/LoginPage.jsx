import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './LoginPage.css';

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

    return (
        <div className="login-container">
            <h2 className="login-header">Login to GymFlow</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button type="submit" className="login-button">
                    Log In
                </button>

                <div className="register-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;