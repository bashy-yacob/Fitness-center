import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../../src/index.css'; // Assuming you have a global CSS file for styles

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
            const token = await auth.login(email, password);
            const decodedToken = jwtDecode(token);
            let targetPath = '/dashboard';
            navigate(targetPath, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error(err);
        }
    }; return (
        <div className="page-container">
            <div className="section">
                <h2>Login to GymFlow</h2>
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                className="form-control"
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
                                className="form-control"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary">
                            Log In
                        </button>

                        <div className="form-group" style={{ marginTop: '1rem', textAlign: 'center' }}>
                            Don't have an account? <Link to="/register" className="nav-link">Register here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;