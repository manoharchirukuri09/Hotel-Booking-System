import React from 'react';

export function BookingStatusBadge({ status }) {
  const map = {
    CONFIRMED: 'badge-success',
    PENDING:   'badge-warning',
    CANCELLED: 'badge-danger',
    COMPLETED: 'badge-info',
    NO_SHOW:   'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
}

export function RoomTypeBadge({ type }) {
  return <span className="badge badge-gold">{type}</span>;
}
