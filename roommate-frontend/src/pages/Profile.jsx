import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Profile page allowing users to view and update their profile details
export const Profile = () => {
  const { user, updateUser, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    location: '',
    preferredLocation: '',
    budget: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/users/${user.id}`);
        const data = response.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          organizationName: data.organizationName || '',
          location: data.location || '',
          preferredLocation: data.preferredLocation || '',
          budget: data.budget !== null && data.budget !== undefined ? data.budget : ''
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      organizationName: formData.organizationName.trim(),
      location: formData.location.trim(),
      preferredLocation: formData.preferredLocation.trim() || null,
      budget: formData.budget !== '' ? parseInt(formData.budget, 10) : null
    };

    try {
      const response = await api.put(`/users/${user.id}`, payload);
      updateUser(response.data);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-state">Loading profile...</div>;
  }

  return (
    <div className="form-page-container">
      <div className="card form-card">
        <div className="profile-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Update your personal and preference details</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="prof-email">Email Address (Read-only)</label>
            <input
              id="prof-email"
              type="email"
              className="form-input form-input-disabled"
              value={formData.email}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="prof-name">Full Name *</label>
            <input
              id="prof-name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prof-org">College / Company / Organization *</label>
            <input
              id="prof-org"
              type="text"
              name="organizationName"
              className="form-input"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prof-location">Current Location *</label>
              <input
                id="prof-location"
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-pref-loc">Preferred Location</label>
              <input
                id="prof-pref-loc"
                type="text"
                name="preferredLocation"
                className="form-input"
                value={formData.preferredLocation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prof-budget">Monthly Budget (₹)</label>
            <input
              id="prof-budget"
              type="number"
              name="budget"
              min="0"
              className="form-input"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
