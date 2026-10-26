import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Room details page displaying property information and request/inquiry status
export const RoomDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRoomAndRequest = async () => {
      setLoading(true);
      setError('');

      try {
        const roomRes = await api.get(`/rooms/${id}`);
        setRoom(roomRes.data);

        // If user is logged in and not the owner, check if user already sent a request for this room
        if (user && roomRes.data && roomRes.data.owner && user.id !== roomRes.data.owner.id) {
          try {
            const requestsRes = await api.get('/requests/sent');
            const found = requestsRes.data.find((req) => req.room && req.room.id === Number(id));
            if (found) {
              setExistingRequest(found);
            }
          } catch (reqErr) {
            console.error('Error fetching sent requests', reqErr);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndRequest();
  }, [id, user]);

  const handleRequestRoom = async () => {
    setRequestLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/requests', { roomId: Number(id) });
      setExistingRequest(response.data);
      setSuccessMessage('Room request submitted successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading room details...</div>;
  }

  if (error && !room) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to Listings
        </Link>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container">
        <div className="alert alert-danger">Room not found</div>
        <Link to="/" className="btn btn-secondary">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user && room.owner && user.id === room.owner.id;

  return (
    <div className="details-container">
      <Link to="/" className="back-link">
        ← Back to all rooms
      </Link>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="card details-card">
        <div className="details-header">
          <div>
            <span className={`badge badge-type badge-${room.roomType ? room.roomType.toLowerCase() : 'shared'}`}>
              {room.roomType}
            </span>
            <h1 className="details-title">{room.title}</h1>
            <p className="details-location">📍 {room.location}</p>
          </div>
          <div className="details-rent-box">
            <span className="details-rent-label">Rent</span>
            <span className="details-rent-amount">
              ₹{room.rent ? Number(room.rent).toLocaleString('en-IN') : '0'}
            </span>
            <span className="details-rent-period">per month</span>
          </div>
        </div>

        <div className="details-grid">
          <div className="details-section">
            <h2 className="section-title">Description</h2>
            <p className="description-text">{room.description}</p>
          </div>

          <div className="details-section">
            <h2 className="section-title">Availability & Contact</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Available From</span>
                <span className="info-value">{room.availableFrom}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Posted By</span>
                <span className="info-value">{room.owner ? room.owner.name : 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Organization</span>
                <span className="info-value">{room.owner ? room.owner.organizationName : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact Details</span>
                <span className="info-value">
                  {user ? (
                    <strong className="contact-text">{room.contact}</strong>
                  ) : (
                    <span className="contact-login-hint">Login to see contact details</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action / Request Section */}
        <div className="details-action-box">
          {isOwner ? (
            <div className="owner-badge-box">
              <span className="owner-notice">You are the owner of this listing.</span>
              <Link to={`/rooms/${room.id}/edit`} className="btn btn-secondary btn-sm">
                Edit Listing
              </Link>
            </div>
          ) : !user ? (
            <div className="auth-prompt">
              <p>Interested in this room? Sign in to contact the owner or send a request.</p>
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Login to request
              </button>
            </div>
          ) : existingRequest ? (
            <div className="request-status-box">
              <span>Your request status: </span>
              <span className={`badge badge-status badge-${existingRequest.status.toLowerCase()}`}>
                {existingRequest.status}
              </span>
            </div>
          ) : (
            <div className="request-action-box">
              <p>Looking for a room like this? Send an inquiry to the owner.</p>
              <button
                onClick={handleRequestRoom}
                className="btn btn-primary"
                disabled={requestLoading}
              >
                {requestLoading ? 'Submitting request...' : 'Request Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
