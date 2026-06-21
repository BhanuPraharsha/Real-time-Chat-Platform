import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/chat';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back!</h1>
        <p className="auth-subtitle">We're so excited to see you again!</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field-group">
            <label className="auth-label">
              EMAIL <span className="auth-label-required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="auth-input"
              autoComplete="email"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">
              PASSWORD <span className="auth-label-required">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="auth-input"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Need an account?{' '}
          <RouterLink to="/register" className="auth-link">Register</RouterLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
