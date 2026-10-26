import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Top navigation bar showing contextual links based on authentication status
export const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          RoomMate
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-item">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/add-room" className="nav-item">
                Add Room
              </Link>
              <Link to="/my-listings" className="nav-item">
                My Listings
              </Link>
              <Link to="/my-requests" className="nav-item">
                My Requests
              </Link>
              <Link to="/profile" className="nav-item">
                Profile ({user.name})
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                Login
              </Link>
              <Link to="/register" className="nav-item btn btn-primary btn-sm nav-register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
