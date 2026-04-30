import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../api/services';
import { formatDate, formatDateTime, formatINR, calcNights } from '../utils/helpers';
import { BookingStatusBadge } from '../components/common/Badges';
import toast from 'react-hot-toast';
import './BookingDetailPage.css';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingAPI.getById(id)
      .then(r => setBooking(r.data.data))
      .catch(() => { toast.error('Booking not found'); navigate('/my-bookings'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await bookingAPI.cancel(id);
      setBooking(res.data.data);
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loader"><div className="spinner"/></div></div>;
  if (!booking) return null;

  const nights    = calcNights(booking.checkInDate, booking.checkOutDate);
  const canCancel = ['CONFIRMED','PENDING'].includes(booking.status)
                    && new Date(booking.checkInDate) > new Date();

  return (
    <div className="page-wrapper">
      <div className="container fade-in" style={{ maxWidth: 840 }}>
        <button className="back-btn" onClick={() => navigate('/my-bookings')}>
          ← Back to My Bookings
        </button>

        {/* Header */}
        <div className="bd-header">
          <div>
            <div className="bd-ref">{booking.reservationNumber}</div>
            <h2 style={{ margin: '6px 0 0' }}>{booking.hotelName}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              {booking.hotelCity}
            </div>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {/* Timeline strip */}
        <div className="bd-timeline card">
          <div className="bd-timeline-item">
            <div className="bd-tl-label">Check-in</div>
            <div className="bd-tl-date">{formatDate(booking.checkInDate)}</div>
            <div className="bd-tl-day">
              {new Date(booking.checkInDate).toLocaleDateString('en-IN',{weekday:'long'})}
            </div>
          </div>
          <div className="bd-timeline-nights">
            <div className="bd-tl-line" />
            <div className="bd-tl-nights">{nights} Night{nights > 1 ? 's' : ''}</div>
            <div className="bd-tl-line" />
          </div>
          <div className="bd-timeline-item">
            <div className="bd-tl-label">Check-out</div>
            <div className="bd-tl-date">{formatDate(booking.checkOutDate)}</div>
            <div className="bd-tl-day">
              {new Date(booking.checkOutDate).toLocaleDateString('en-IN',{weekday:'long'})}
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="bd-body">
          {/* Left */}
          <div className="bd-left">
            <div className="card bd-section">
              <h4 className="bd-section-title">Room Details</h4>
              <Row label="Room Number"  value={`#${booking.roomNumber}`} />
              <Row label="Room Type"    value={<span className="badge badge-gold">{booking.roomType}</span>} />
              <Row label="Guests"       value={`${booking.numberOfGuests} Guest${booking.numberOfGuests > 1 ? 's' : ''}`} />
            </div>

            <div className="card bd-section">
              <h4 className="bd-section-title">Guest Information</h4>
              <Row label="Name"  value={booking.userFullName} />
              <Row label="Email" value={booking.userEmail} />
            </div>

            {booking.specialRequests && (
              <div className="card bd-section">
                <h4 className="bd-section-title">Special Requests</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="bd-right">
            <div className="card bd-section">
              <h4 className="bd-section-title">Payment Summary</h4>
              <Row
                label={`₹${Number(booking.pricePerNight).toLocaleString('en-IN')} × ${nights} nights`}
                value={formatINR(Number(booking.pricePerNight) * nights)}
              />
              {Number(booking.discountAmount) > 0 && (
                <Row
                  label={`Promo (${booking.promoCode})`}
                  value={<span style={{color:'var(--success)'}}>−{formatINR(booking.discountAmount)}</span>}
                />
              )}
              <div className="bd-total-row">
                <span>Total</span>
                <span className="bd-total-amount">{formatINR(booking.totalAmount)}</span>
              </div>
            </div>

            <div className="card bd-section">
              <h4 className="bd-section-title">Booking Info</h4>
              <Row label="Booked On" value={formatDateTime(booking.createdAt)} />
              <Row label="Booking ID" value={`#${booking.id}`} />
              <Row label="Status" value={<BookingStatusBadge status={booking.status} />} />
            </div>

            {/* Actions */}
            <div className="bd-actions">
              <Link to={`/hotels/${booking.hotelId}`} className="btn btn-outline" style={{width:'100%'}}>
                🔁 Rebook This Hotel
              </Link>
              {canCancel && (
                <button
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling
                    ? <><span className="spinner" style={{width:14,height:14}} /> Cancelling…</>
                    : 'Cancel Booking'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="bd-row">
      <span className="bd-row-label">{label}</span>
      <span className="bd-row-value">{value}</span>
    </div>
  );
}
