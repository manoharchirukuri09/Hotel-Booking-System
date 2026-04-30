import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI } from '../api/services';
import HotelCard from '../components/hotel/HotelCard';
import './HomePage.css';

export default function HomePage() {
  const [keyword,  setKeyword]  = useState('');
  const [hotels,   setHotels]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hotelAPI.getAll()
      .then(r => setHotels(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    
    const qs = params.toString();
    navigate(qs ? `/hotels?${qs}` : '/hotels');
  };

  const featured = hotels.slice(0, 6);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot">✦</span>
            Premium Hotel Bookings
          </div>
          <h1 className="hero-title">
            Stay Where <br />
            <span className="text-gradient">Luxury Lives</span>
          </h1>
          <p className="hero-desc">
            Discover handpicked hotels across India. Book instantly, travel confidently.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-field main-field">
              <span className="search-icon">◎</span>
              <input
                className="search-input"
                placeholder="Search by city, hotel name or state…"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            
            <div className="search-divider" />

            <div className="search-field date-field">
              <span className="search-icon">📅</span>
              <div className="date-inputs">
                <input
                  type="date"
                  className="date-input"
                  title="Check-in Date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <span className="date-sep">→</span>
                <input
                  type="date"
                  className="date-input"
                  title="Check-out Date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary search-btn">
              Search Hotels
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Hotels</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Cities</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-num">1M+</span><span className="stat-label">Happy Guests</span></div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="container section-gap">
        <div className="section-header">
          <div>
            <h2>Featured Hotels</h2>
            <div className="accent-line" />
          </div>
          <a href="/hotels" className="btn btn-ghost btn-sm">View All →</a>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏨</div>
            <h3>No hotels found</h3>
            <p>Make sure the backend is running on port 8080</p>
          </div>
        ) : (
          <div className="grid-3">
            {featured.map(h => <HotelCard key={h.id} hotel={h} />)}
          </div>
        )}
      </section>

      {/* Why LuxStay */}
      <section className="container section-gap">
        <div className="section-header">
          <div>
            <h2>Why Choose LuxStay</h2>
            <div className="accent-line" />
          </div>
        </div>
        <div className="grid-4">
          {[
            { icon: '🔒', title: 'Secure Booking',    desc: 'JWT-protected transactions with instant confirmation' },
            { icon: '🏷️', title: 'Best Price',         desc: 'Exclusive promo codes and seasonal discount offers' },
            { icon: '📧', title: 'Email Confirmation', desc: 'Instant booking confirmation sent to your inbox' },
            { icon: '🔁', title: 'Easy Rebooking',     desc: 'Repeat your favourite stays in a single click' },
          ].map(f => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container section-gap">
        <div className="cta-banner">
          <div className="cta-glow" />
          <h2>Ready for your next getaway?</h2>
          <p>Join thousands of travellers who trust LuxStay for premium stays.</p>
          <div className="cta-btns">
            <a href="/hotels"   className="btn btn-primary btn-lg">Browse Hotels</a>
            <a href="/register" className="btn btn-outline btn-lg">Create Account</a>
          </div>
        </div>
      </section>
    </div>
  );
}
