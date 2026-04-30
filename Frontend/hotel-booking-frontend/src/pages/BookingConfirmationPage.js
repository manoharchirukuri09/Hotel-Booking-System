import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../api/services';
import { formatDate, formatINR, calcNights } from '../utils/helpers';
import { BookingStatusBadge } from '../components/common/Badges';
import toast from 'react-hot-toast';
import './BookingConfirmationPage.css';

export default function BookingConfirmationPage() {
  const { reservationNumber } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getByReservation(reservationNumber)
      .then(r => setBooking(r.data.data))
      .catch(() => {
        toast.error('Could not load booking details');
        navigate('/my-bookings');
      })
      .finally(() => setLoading(false));
  }, [reservationNumber, navigate]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-loader"><div className="spinner" /></div>
      </div>
    );
  }

  if (!booking) return null;

  const nights = calcNights(booking.checkInDate, booking.checkOutDate);

  return (
    <div className="page-wrapper confirm-page">
      <div className="container">
        <div className="confirm-card fade-in">

          {/* Success icon */}
          <div className="confirm-icon-wrap">
            <div className="confirm-icon">✓</div>
          </div>

          <h1 className="confirm-title">Booking Confirmed!</h1>
          <p className="confirm-sub">
            A confirmation email has been sent to <strong>{booking.userEmail}</strong>
          </p>

          {/* Reservation pill */}
          <div className="reservation-pill">
            <span className="res-label">Reservation Number</span>
            <span className="res-number">{booking.reservationNumber}</span>
          </div>

          {/* Main details grid */}
          <div className="confirm-grid">
            <div className="confirm-section">
              <h3 className="confirm-section-title">Hotel & Room</h3>
              <div className="confirm-detail-list">
                <div className="cd-row">
                  <span className="cd-label">Hotel</span>
                  <span className="cd-value">{booking.hotelName}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Location</span>
                  <span className="cd-value">{booking.hotelCity}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Room</span>
                  <span className="cd-value">
                    #{booking.roomNumber}
                    <span className="badge badge-gold" style={{ marginLeft: 8 }}>
                      {booking.roomType}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="confirm-section">
              <h3 className="confirm-section-title">Stay Details</h3>
              <div className="confirm-detail-list">
                <div className="cd-row">
                  <span className="cd-label">Check-in</span>
                  <span className="cd-value">{formatDate(booking.checkInDate)}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Check-out</span>
                  <span className="cd-value">{formatDate(booking.checkOutDate)}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Duration</span>
                  <span className="cd-value">{nights} Night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Guests</span>
                  <span className="cd-value">{booking.numberOfGuests}</span>
                </div>
              </div>
            </div>

            <div className="confirm-section">
              <h3 className="confirm-section-title">Payment Summary</h3>
              <div className="confirm-detail-list">
                <div className="cd-row">
                  <span className="cd-label">Rate</span>
                  <span className="cd-value">
                    {formatINR(booking.pricePerNight)} × {nights} nights
                  </span>
                </div>
                {Number(booking.discountAmount) > 0 && (
                  <div className="cd-row">
                    <span className="cd-label">Promo ({booking.promoCode})</span>
                    <span className="cd-value" style={{ color: 'var(--success)' }}>
                      −{formatINR(booking.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="cd-row total-row">
                  <span className="cd-label">Total Paid</span>
                  <span className="cd-total">{formatINR(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="confirm-section">
              <h3 className="confirm-section-title">Guest Details</h3>
              <div className="confirm-detail-list">
                <div className="cd-row">
                  <span className="cd-label">Name</span>
                  <span className="cd-value">{booking.userFullName}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Email</span>
                  <span className="cd-value">{booking.userEmail}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Status</span>
                  <span className="cd-value">
                    <BookingStatusBadge status={booking.status} />
                  </span>
                </div>
                {booking.specialRequests && (
                  <div className="cd-row">
                    <span className="cd-label">Requests</span>
                    <span className="cd-value">{booking.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="confirm-actions">
            <Link to="/my-bookings" className="btn btn-primary btn-lg">
              View My Bookings
            </Link>
            <Link to="/hotels" className="btn btn-outline btn-lg">
              Book Another Hotel
            </Link>
          </div>

          {/* Info note */}
          <div className="confirm-note">
            <span>📧</span>
            A confirmation email with all details has been dispatched to your inbox.
            Check spam if you don't see it within a few minutes.
          </div>
        </div>
      </div>
    </div>
  );
}
