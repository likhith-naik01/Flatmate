import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';

// Page displaying sent inquiries and received requests for owner review
export const MyRequests = () => {
  const [activeTab, setActiveTab] = useState('sent');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSent = async () => {
    try {
      const response = await api.get('/requests/sent');
      setSentRequests(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const fetchReceived = async () => {
    try {
      const response = await api.get('/requests/received');
      setReceivedRequests(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const fetchAllRequests = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchSent(), fetchReceived()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleDecision = async (requestId, action) => {
    setActionLoadingId(requestId);
    setError('');
    setSuccessMessage('');

    try {
      await api.put(`/requests/${requestId}/${action}`);
      setSuccessMessage(`Request successfully ${action}ed.`);
      await fetchReceived();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Requests & Inquiries</h1>
          <p className="page-subtitle">Track requests you have sent and manage incoming requests from prospective roommates</p>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('sent');
            setError('');
            setSuccessMessage('');
          }}
        >
          Sent Requests ({sentRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'received' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('received');
            setError('');
            setSuccessMessage('');
          }}
        >
          Received Requests ({receivedRequests.length})
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="loading-state">Loading requests...</div>
      ) : activeTab === 'sent' ? (
        // Sent Requests Tab
        sentRequests.length === 0 ? (
          <div className="card empty-state">
            <p>You have not sent any room requests yet.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Explore Available Rooms
            </Link>
          </div>
        ) : (
          <div className="requests-list">
            {sentRequests.map((req) => (
              <div key={req.id} className="card request-card">
                <div className="request-card-info">
                  <Link to={`/rooms/${req.room.id}`} className="request-room-link">
                    <h3>{req.room.title}</h3>
                  </Link>
                  <p className="request-meta">
                    📍 {req.room.location} &bull; <strong>₹{Number(req.room.rent).toLocaleString('en-IN')}/mo</strong>
                  </p>
                </div>
                <div className="request-card-status">
                  <span className={`badge badge-status badge-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Received Requests Tab
        receivedRequests.length === 0 ? (
          <div className="card empty-state">
            <p>No incoming requests for your listings at the moment.</p>
          </div>
        ) : (
          <div className="requests-list">
            {receivedRequests.map((req) => (
              <div key={req.id} className="card request-card">
                <div className="request-card-info">
                  <Link to={`/rooms/${req.room.id}`} className="request-room-link">
                    <h3>{req.room.title}</h3>
                  </Link>
                  <div className="requester-details">
                    <p>
                      <strong>Requester:</strong> {req.user.name} ({req.user.organizationName})
                    </p>
                    <p>
                      <strong>Email:</strong> <a href={`mailto:${req.user.email}`}>{req.user.email}</a>
                    </p>
                  </div>
                </div>

                <div className="request-card-action-side">
                  <span className={`badge badge-status badge-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>

                  {req.status === 'PENDING' && (
                    <div className="request-actions">
                      <button
                        onClick={() => handleDecision(req.id, 'accept')}
                        className="btn btn-success btn-sm"
                        disabled={actionLoadingId === req.id}
                      >
                        {actionLoadingId === req.id ? '...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, 'reject')}
                        className="btn btn-danger btn-sm"
                        disabled={actionLoadingId === req.id}
                      >
                        {actionLoadingId === req.id ? '...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyRequests;
