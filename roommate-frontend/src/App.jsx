import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomDetails from './pages/RoomDetails';
import AddRoom from './pages/AddRoom';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import MyRequests from './pages/MyRequests';

import './App.css';

// Main App component assembling navigation bar and application routing table
function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />

          {/* Protected Routes */}
          <Route
            path="/add-room"
            element={
              <ProtectedRoute>
                <AddRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:id/edit"
            element={
              <ProtectedRoute>
                <AddRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
