import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../api/services';
import { BookingStatusBadge } from '../components/common/Badges';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './MyBookingsPage.css';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(r => setBookings(r.data.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingAPI.cancel(id);
      setBookings(bs => bs.map(b => b.id === id ? {...b, status:'CANCELLED'} : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally { setCancelling(null); }
  };

  const handleRebook = (b) => {
    navigate(`/hotels/${b.hotelId}`);
  };

  const STATUSES = ['ALL','CONFIRMED','PENDING','CANCELLED','COMPLETED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <h1>My Bookings</h1>
        <div className="accent-line" />

        {/* Stats strip */}
        <div className="bookings-stats">
          {[
            { label: 'Total',     val: stats.total,     cls: '' },
            { label: 'Confirmed', val: stats.confirmed, cls: 'text-gold' },
            { label: 'Completed', val: stats.completed, cls: '' },
            { label: 'Cancelled', val: stats.cancelled, cls: '' },
          ].map(s => (
            <div key={s.label} className="b-stat card">
              <span className={`b-stat-num ${s.cls}`}>{s.val}</span>
              <span className="b-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="status-tabs">
          {STATUSES.map(st => (
            <button key={st}
              className={`status-tab ${filter === st ? 'active' : ''}`}
              onClick={() => setFilter(st)}>
              {st === 'ALL' ? `All (${bookings.length})` : st}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>{filter === 'ALL' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}</h3>
            <p>Start exploring hotels and make your first booking</p>
            <button className="btn btn-primary" style={{marginTop:16}}
              onClick={() => navigate('/hotels')}>Browse Hotels</button>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const canCancel = ['CONFIRMED','PENDING'].includes(b.status) &&
                new Date(b.checkInDate) > new Date();
              const nights = Math.max(1, Math.ceil(
                (new Date(b.checkOutDate)-new Date(b.checkInDate))/(1000*60*60*24)
              ));
              return (
                <div key={b.id} className="booking-card card fade-in">
                  <div className="booking-card-header">
                    <div className="booking-ref">
                      <span className="ref-label">Reservation</span>
                      <span className="ref-number">{b.reservationNumber}</span>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>

                  <div className="booking-card-body">
                    <div className="booking-hotel-info">
                      <h3 className="booking-hotel-name">{b.hotelName}</h3>
                      <p className="booking-hotel-city">{b.hotelCity}</p>
                      <div className="booking-room-type">
                        <span className="badge badge-gold">{b.roomType}</span>
                        <span className="room-no">Room {b.roomNumber}</span>
                      </div>
                    </div>

                    <div className="booking-dates">
                      <div className="date-block">
                        <span className="date-label">Check-in</span>
                        <span className="date-val">{new Date(b.checkInDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                      </div>
                      <div className="nights-sep">
                        <div className="nights-line"/>
                        <span className="nights-count">{nights}N</span>
                        <div className="nights-line"/>
                      </div>
                      <div className="date-block">
                        <span className="date-label">Check-out</span>
                        <span className="date-val">{new Date(b.checkOutDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                      </div>
                    </div>

                    <div className="booking-price-col">
                      <div className="booking-amount">₹{Number(b.totalAmount).toLocaleString('en-IN')}</div>
                      <div className="booking-guests">{b.numberOfGuests} Guest{b.numberOfGuests>1?'s':''}</div>
                      {b.promoCode && (
                        <div className="promo-used">🏷️ {b.promoCode}</div>
                      )}
                    </div>
                  </div>

                  <div className="booking-card-footer">
                    <span className="booked-on">
                      Booked on {new Date(b.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    </span>
                    <div className="booking-actions">
                      <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-sm">
                        View Details
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRebook(b)}>
                        🔁 Rebook
                      </button>
                      {canCancel ? (
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}>
                          {cancelling === b.id
                            ? <span className="spinner" style={{width:12,height:12}}/>
                            : 'Cancel'}
                        </button>
                      ) : b.status === 'CONFIRMED' && (
                        <span className="text-muted" style={{fontSize:'0.75rem', alignSelf:'center'}}>
                          Cancellation closed
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
