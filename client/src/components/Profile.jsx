import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

function Profile() {
  const [profile, setProfile] = useState({ username: '', email: '', bio: '', avatar: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.user);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`,
        { bio: profile.bio, avatar: profile.avatar },
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header-row">
          <button onClick={() => navigate('/chat')} className="profile-back-btn">← Back to Chat</button>
          <h1 className="profile-title">My Account</h1>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-success">{message}</div>}

        {/* User info banner */}
        <div className="profile-banner">
          <div className="profile-avatar">
            {profile.username ? profile.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="profile-username">{profile.username || 'user'}</div>
            <div className="profile-email">{profile.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-field-group">
            <label className="profile-label">AVATAR URL</label>
            <input type="text" name="avatar" value={profile.avatar || ''} onChange={handleChange}
              className="profile-input" placeholder="https://example.com/avatar.jpg" />
          </div>

          <div className="profile-field-group">
            <label className="profile-label">BIO</label>
            <textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows="3" maxLength="150"
              className="profile-input profile-textarea"
              placeholder="Tell us about yourself..." />
            <div className="profile-char-count">{(profile.bio || '').length}/150</div>
          </div>

          <div className="profile-button-row">
            <button type="submit" disabled={saving} className="profile-btn-save">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/chat')} className="profile-btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
