import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Register page allowing new users to create an account
export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    location: '',
    preferredLocation: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      organizationName: formData.organizationName.trim(),
      location: formData.location.trim(),
      preferredLocation: formData.preferredLocation.trim() || null,
      budget: formData.budget !== '' ? parseInt(formData.budget, 10) : null
    };

    try {
      await api.post('/users/register', payload);
      navigate('/login', { state: { message: 'Registration successful! Please log in with your credentials.' } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card register-card">
        <h2 className="page-title">Create an Account</h2>
        <p className="page-subtitle">Join RoomMate to find rooms and connect with compatible roommates</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Likhith Kumar"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. likhith@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min 6 characters) *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-org">College / Company / Organization *</label>
            <input
              id="reg-org"
              type="text"
              name="organizationName"
              className="form-input"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="e.g. NMIT Bangalore / Infosys"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-location">Current Location *</label>
              <input
                id="reg-location"
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-pref-loc">Preferred Location</label>
              <input
                id="reg-pref-loc"
                type="text"
                name="preferredLocation"
                className="form-input"
                value={formData.preferredLocation}
                onChange={handleChange}
                placeholder="e.g. Koramangala"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-budget">Monthly Budget (₹)</label>
            <input
              id="reg-budget"
              type="number"
              name="budget"
              min="0"
              className="form-input"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 9000"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
