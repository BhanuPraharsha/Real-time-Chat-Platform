import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/register`, { username, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/chat';
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title register-title">Create an account</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field-group">
            <label className="auth-label">USERNAME <span className="auth-label-required">*</span></label>
            <input type="text" name="username" value={username} onChange={onChange} required className="auth-input" autoComplete="username" />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">EMAIL <span className="auth-label-required">*</span></label>
            <input type="email" name="email" value={email} onChange={onChange} required className="auth-input" autoComplete="email" />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">PASSWORD <span className="auth-label-required">*</span></label>
            <input type="password" name="password" value={password} onChange={onChange} required className="auth-input" autoComplete="new-password" />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">CONFIRM PASSWORD <span className="auth-label-required">*</span></label>
            <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required className="auth-input" autoComplete="new-password" />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <RouterLink to="/login" className="auth-link">Log In</RouterLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
