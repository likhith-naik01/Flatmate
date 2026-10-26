import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';

// Page displaying all room listings published by the currently logged-in user
export const MyListings = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchMyRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/rooms/my');
      setRooms(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const handleDelete = async (roomId) => {
    const confirmed = window.confirm('Are you sure you want to delete this listing? All incoming requests for this room will also be removed.');
    if (!confirmed) return;

    setDeletingId(roomId);
    setError('');

    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Room Listings</h1>
          <p className="page-subtitle">Manage the rooms you have posted on RoomMate</p>
        </div>
        <Link to="/add-room" className="btn btn-primary">
          + Add Room
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading your listings...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state card">
          <p>You haven't listed any rooms yet.</p>
          <Link to="/add-room" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Post Your First Room
          </Link>
        </div>
      ) : (
        <div className="listings-list">
          {rooms.map((room) => (
            <div key={room.id} className="card listing-item">
              <div className="listing-info">
                <div className="listing-title-row">
                  <h3 className="listing-title">{room.title}</h3>
                  <span className={`badge badge-type badge-${room.roomType ? room.roomType.toLowerCase() : 'shared'}`}>
                    {room.roomType}
                  </span>
                </div>
                <p className="listing-meta">
                  📍 {room.location} &bull; <strong>₹{Number(room.rent).toLocaleString('en-IN')}/mo</strong> &bull; Available: {room.availableFrom}
                </p>
              </div>

              <div className="listing-actions">
                <button
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="btn btn-secondary btn-sm"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/rooms/${room.id}/edit`)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="btn btn-danger btn-sm"
                  disabled={deletingId === room.id}
                >
                  {deletingId === room.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
