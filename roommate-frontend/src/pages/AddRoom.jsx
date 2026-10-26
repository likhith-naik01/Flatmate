import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Add / Edit Room page allowing users to publish new rooms or update their existing listings
export const AddRoom = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    rent: '',
    roomType: 'SHARED',
    description: '',
    availableFrom: '',
    contact: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If edit mode, load existing room and verify ownership
  useEffect(() => {
    if (isEditMode) {
      const fetchRoom = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await api.get(`/rooms/${id}`);
          const room = response.data;

          // Verify ownership
          if (!user || !room.owner || user.id !== room.owner.id) {
            navigate('/my-listings', { replace: true });
            return;
          }

          setFormData({
            title: room.title || '',
            location: room.location || '',
            rent: room.rent || '',
            roomType: room.roomType || 'SHARED',
            description: room.description || '',
            availableFrom: room.availableFrom || '',
            contact: room.contact || ''
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLoading(false);
        }
      };

      fetchRoom();
    }
  }, [id, isEditMode, user, navigate]);

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
    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      location: formData.location.trim(),
      rent: parseInt(formData.rent, 10),
      roomType: formData.roomType,
      description: formData.description.trim(),
      availableFrom: formData.availableFrom,
      contact: formData.contact.trim()
    };

    try {
      if (isEditMode) {
        await api.put(`/rooms/${id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      navigate('/my-listings');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading room details...</div>;
  }

  return (
    <div className="form-page-container">
      <div className="card form-card">
        <h1 className="page-title">{isEditMode ? 'Edit Room Listing' : 'Post a New Room'}</h1>
        <p className="page-subtitle">
          {isEditMode
            ? 'Update the details and availability of your room'
            : 'Fill in the information below to find roommates quickly'}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="room-title">Room Title *</label>
            <input
              id="room-title"
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Spacious Shared Room near Metro Station"
              minLength={3}
              maxLength={100}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room-location">Location / Area *</label>
              <input
                id="room-location"
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Koramangala 4th Block, Bangalore"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="room-rent">Monthly Rent (₹) *</label>
              <input
                id="room-rent"
                type="number"
                name="rent"
                min="1"
                className="form-input"
                value={formData.rent}
                onChange={handleChange}
                placeholder="e.g. 8000"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room-type">Room Type *</label>
              <select
                id="room-type"
                name="roomType"
                className="form-input"
                value={formData.roomType}
                onChange={handleChange}
                required
              >
                <option value="SHARED">Shared</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="room-date">Available From *</label>
              <input
                id="room-date"
                type="date"
                name="availableFrom"
                className="form-input"
                value={formData.availableFrom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="room-contact">Contact Phone or Email *</label>
            <input
              id="room-contact"
              type="text"
              name="contact"
              className="form-input"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. 9876543210 or email@domain.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="room-desc">Description (max 1000 characters) *</label>
            <textarea
              id="room-desc"
              name="description"
              className="form-textarea"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe furnishings, society amenities, nearby landmarks, rules, etc."
              maxLength={1000}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Update Room' : 'Post Room'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
