import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);
  const [dropOpen, setDropOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">LuxStay</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <NavLink to="/hotels" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Hotels
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Auth area */}
        <div className="nav-auth">
          {isLoggedIn ? (
            <div className="user-menu" onMouseLeave={() => setDropOpen(false)}>
              <button className="user-btn" onClick={() => setDropOpen(v => !v)}>
                <span className="user-avatar">{user?.fullName?.[0]?.toUpperCase()}</span>
                <span className="user-name">{user?.fullName?.split(' ')[0]}</span>
                <span className="chevron">▾</span>
              </button>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="drop-header">
                    <div className="drop-name">{user?.fullName}</div>
                    <div className="drop-email">{user?.email}</div>
                    {isAdmin && <span className="badge badge-gold" style={{marginTop:4}}>Admin</span>}
                  </div>
                  <div className="drop-divider" />
                  <Link to="/profile"     className="drop-item" onClick={() => setDropOpen(false)}>Profile</Link>
                  <Link to="/my-bookings" className="drop-item" onClick={() => setDropOpen(false)}>My Bookings</Link>
                  {isAdmin && <Link to="/admin" className="drop-item" onClick={() => setDropOpen(false)}>Dashboard</Link>}
                  <div className="drop-divider" />
                  <button className="drop-item danger" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span className={menuOpen ? 'bar bar1 open' : 'bar bar1'} />
            <span className={menuOpen ? 'bar bar2 open' : 'bar bar2'} />
            <span className={menuOpen ? 'bar bar3 open' : 'bar bar3'} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/hotels"      className="mob-link" onClick={() => setMenuOpen(false)}>Hotels</Link>
          {isLoggedIn && <Link to="/my-bookings" className="mob-link" onClick={() => setMenuOpen(false)}>My Bookings</Link>}
          {isAdmin    && <Link to="/admin"       className="mob-link" onClick={() => setMenuOpen(false)}>Admin</Link>}
          {isLoggedIn && <Link to="/profile"     className="mob-link" onClick={() => setMenuOpen(false)}>Profile</Link>}
          <div className="mob-divider" />
          {isLoggedIn
            ? <button className="mob-link danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
            : <>
                <Link to="/login"    className="mob-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="mob-link gold" onClick={() => setMenuOpen(false)}>Join Free</Link>
              </>
          }
        </div>
      )}
    </nav>
  );
}
