import React from 'react';
import { Link } from 'react-router-dom';

// Card component rendering a summary preview of a room listing
export const RoomCard = ({ room }) => {
  const formattedRent = room.rent ? `₹${Number(room.rent).toLocaleString('en-IN')}/month` : '₹0/month';

  return (
    <div className="card room-card">
      <div className="room-card-header">
        <span className={`badge badge-type badge-${room.roomType ? room.roomType.toLowerCase() : 'shared'}`}>
          {room.roomType}
        </span>
        <span className="room-card-rent">{formattedRent}</span>
      </div>
      <h3 className="room-card-title">{room.title}</h3>
      <p className="room-card-location">📍 {room.location}</p>
      <div className="room-card-footer">
        <span className="room-card-date">Available from: {room.availableFrom}</span>
        <Link to={`/rooms/${room.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
