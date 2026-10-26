import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/axios';
import RoomCard from '../components/RoomCard';

// Public home page providing real-time room search filters and listing cards
export const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filter states
  const [location, setLocation] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [roomType, setRoomType] = useState('');

  const fetchRooms = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (filterParams.location && filterParams.location.trim()) {
        params.location = filterParams.location.trim();
      }
      if (filterParams.maxRent !== '' && filterParams.maxRent !== undefined && filterParams.maxRent !== null) {
        params.maxRent = filterParams.maxRent;
      }
      if (filterParams.roomType && filterParams.roomType !== 'ALL') {
        params.roomType = filterParams.roomType;
      }

      const response = await api.get('/rooms', { params });
      setRooms(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch all rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms({ location, maxRent, roomType });
  };

  const handleClear = () => {
    setLocation('');
    setMaxRent('');
    setRoomType('');
    fetchRooms({});
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Find Your Next Room & Ideal Roommate</h1>
        <p className="hero-subtitle">
          Discover verified rooms and shared accommodations suited for students and working professionals.
        </p>
      </div>

      <div className="card filter-card">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-group">
            <label htmlFor="filter-location">Location</label>
            <input
              id="filter-location"
              type="text"
              className="form-input"
              placeholder="e.g. Koramangala or Bangalore"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-budget">Max Budget (₹/month)</label>
            <input
              id="filter-budget"
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 10000"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-type">Room Type</label>
            <select
              id="filter-type"
              className="form-input"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="SHARED">Shared</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" onClick={handleClear} className="btn btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <p>No rooms found. Try changing your filters.</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
