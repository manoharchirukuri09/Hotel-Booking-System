import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAPI, roomAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { RoomTypeBadge } from '../components/common/Badges';
import toast from 'react-hot-toast';
import './HotelDetailPage.css';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating||0) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();

  const [hotel,    setHotel]    = useState(null);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [searching,setSearching]= useState(false);
  const [searched, setSearched] = useState(!!(searchParams.get('checkIn') && searchParams.get('checkOut')));

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [search, setSearch] = useState({
    checkIn:  searchParams.get('checkIn')  || today,
    checkOut: searchParams.get('checkOut') || tomorrow,
    guests:   +(searchParams.get('guests') || 1),
  });

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const hRes = await hotelAPI.getById(id);
        setHotel(hRes.data.data);
        
        let rRes;
        if (searchParams.get('checkIn') && searchParams.get('checkOut')) {
          rRes = await roomAPI.getAvailable(id, search.checkIn, search.checkOut, search.guests);
        } else {
          rRes = await roomAPI.getByHotel(id);
        }
        setRooms(rRes.data.data || []);
      } catch {
        toast.error('Failed to load hotel');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
    // eslint-disable-next-line
  }, [id]);


  const handleAvailabilitySearch = async (e) => {
    e.preventDefault();
    if (search.checkOut <= search.checkIn) {
      toast.error('Check-out must be after check-in'); return;
    }
    setSearching(true);
    try {
      const res = await roomAPI.getAvailable(id, search.checkIn, search.checkOut, search.guests);
      setRooms(res.data.data || []);
      setSearched(true);
      if ((res.data.data || []).length === 0) toast('No rooms available for selected dates', { icon: '🔍' });
    } catch { toast.error('Availability search failed'); }
    finally { setSearching(false); }
  };

  const handleBook = (room) => {
    if (!isLoggedIn) { toast.error('Please login to book'); navigate('/login'); return; }
    navigate(`/book/${id}/${room.id}`, {
      state: { hotel, room, checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests }
    });
  };

  if (loading) return <div className="page-wrapper"><div className="page-loader"><div className="spinner" /></div></div>;
  if (!hotel)  return <div className="page-wrapper"><div className="container"><p>Hotel not found.</p></div></div>;

  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : (hotel.amenities||'').split(',').map(a=>a.trim()).filter(Boolean);

  const nights = search.checkIn && search.checkOut
    ? Math.max(1, Math.ceil((new Date(search.checkOut)-new Date(search.checkIn))/(1000*60*60*24)))
    : 1;

  return (
    <div className="page-wrapper">
      <div className="container fade-in">

        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Hotels</button>

        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-hero-img">
            {hotel.imageUrl
              ? <img src={hotel.imageUrl} alt={hotel.name} />
              : <div className="detail-img-placeholder">🏨</div>
            }
          </div>
          <div className="detail-hero-info">
            <div className="detail-location">
              <span className="text-gold">◈</span> {hotel.city}, {hotel.state}, {hotel.country}
            </div>
            <h1 className="detail-name">{hotel.name}</h1>
            <div className="detail-stars-row">
              <Stars rating={hotel.starRating} />
              {hotel.averageRating > 0 && (
                <span className="avg-rating">
                  <span className="rating-pill">{hotel.averageRating?.toFixed(1)}</span>
                  Guest Rating
                </span>
              )}
            </div>
            {hotel.description && <p className="detail-desc">{hotel.description}</p>}

            {amenities.length > 0 && (
              <div className="detail-amenities">
                {amenities.map(a => (
                  <span key={a} className="amenity-tag">{a}</span>
                ))}
              </div>
            )}

            <div className="detail-contact">
              {hotel.contactPhone && <span>📞 {hotel.contactPhone}</span>}
              {hotel.contactEmail && <span>✉️ {hotel.contactEmail}</span>}
            </div>

            <div className="detail-room-summary">
              <div className="room-stat">
                <span className="rs-num">{hotel.totalRooms}</span>
                <span className="rs-label">Total Rooms</span>
              </div>
              <div className="room-stat">
                <span className="rs-num text-gold">{hotel.availableRooms}</span>
                <span className="rs-label">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Search */}
        <div className="availability-box card">
          <h3 className="avail-title">Check Availability</h3>
          <form className="avail-form" onSubmit={handleAvailabilitySearch}>
            <div className="form-group">
              <label className="form-label">Check-in</label>
              <input type="date" className="form-input" min={today}
                value={search.checkIn}
                onChange={e => setSearch(s => ({...s, checkIn: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out</label>
              <input type="date" className="form-input" min={search.checkIn}
                value={search.checkOut}
                onChange={e => setSearch(s => ({...s, checkOut: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Guests</label>
              <select className="form-input form-select"
                value={search.guests}
                onChange={e => setSearch(s => ({...s, guests: +e.target.value}))}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary avail-btn" disabled={searching}>
              {searching ? <><span className="spinner" style={{width:16,height:16}}/> Searching…</> : 'Search Rooms'}
            </button>
          </form>
          {searched && <p className="avail-note">Showing available rooms for {nights} night{nights>1?'s':''}</p>}
        </div>

        {/* Rooms */}
        <div className="rooms-section">
          <h2>{searched ? 'Available Rooms' : 'All Rooms'}</h2>
          <div className="accent-line" />

          {rooms.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛏️</div>
              <h3>No rooms available</h3>
              <p>Try different dates or guest count</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => {
                const facilities = Array.isArray(room.facilities)
                  ? room.facilities
                  : (room.facilities||'').split(',').map(f=>f.trim()).filter(Boolean);
                return (
                  <div key={room.id} className="room-card card">
                    <div className="room-card-img">
                      {room.imageUrl
                        ? <img src={room.imageUrl} alt={room.roomType} />
                        : <div className="room-img-placeholder">🛏️</div>
                      }
                    </div>
                    <div className="room-card-body">
                      <div className="room-card-header">
                        <div>
                          <div className="room-number">Room {room.roomNumber}</div>
                          <RoomTypeBadge type={room.roomType} />
                        </div>
                        <div className="room-price">
                          <span className="price-amount">₹{Number(room.pricePerNight).toLocaleString('en-IN')}</span>
                          <span className="price-night">/night</span>
                        </div>
                      </div>

                      {room.description && <p className="room-desc">{room.description}</p>}

                      <div className="room-meta">
                        <span className="room-capacity">👤 Max {room.maxCapacity} guests</span>
                        {searched && (
                          <span className="room-total">
                            Total: <strong>₹{(Number(room.pricePerNight)*nights).toLocaleString('en-IN')}</strong>
                          </span>
                        )}
                      </div>

                      {facilities.length > 0 && (
                        <div className="room-facilities">
                          {facilities.slice(0,5).map(f => (
                            <span key={f} className="facility-tag">{f}</span>
                          ))}
                          {facilities.length > 5 && (
                            <span className="facility-tag muted">+{facilities.length-5}</span>
                          )}
                        </div>
                      )}

                      <button
                        className="btn btn-primary"
                        style={{width:'100%', marginTop:12}}
                        onClick={() => handleBook(room)}
                        disabled={!room.available}
                      >
                        {room.available ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
