import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/auth/login`, {
                email,
                password
            });

            if (res.data.success) {
                // Store token and user data
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                // Redirect to chat
                navigate('/chat');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue chatting</p>
                </div>

                <form onSubmit={onSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
