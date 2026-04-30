import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">

        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">✦</span> LuxStay
          </div>
          <p className="footer-tagline">
            Premium hotel bookings, seamlessly secured.
          </p>
          <div className="footer-stack">
            <span className="stack-tag">Spring Boot 3</span>
            <span className="stack-tag">React 18</span>
            <span className="stack-tag">MySQL</span>
            <span className="stack-tag">JWT</span>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <Link to="/"       className="footer-link">Home</Link>
            <Link to="/hotels" className="footer-link">All Hotels</Link>
            <Link to="/hotels?search=Mumbai"     className="footer-link">Mumbai</Link>
            <Link to="/hotels?search=Hyderabad"  className="footer-link">Hyderabad</Link>
            <Link to="/hotels?search=Goa"        className="footer-link">Goa</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Account</h4>
            <Link to="/login"        className="footer-link">Sign In</Link>
            <Link to="/register"     className="footer-link">Register Free</Link>
            <Link to="/my-bookings"  className="footer-link">My Bookings</Link>
            <Link to="/profile"      className="footer-link">Profile</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">API Docs</h4>
            <a href="http://localhost:8080/api/swagger-ui.html"
               target="_blank" rel="noreferrer" className="footer-link">
              Swagger UI ↗
            </a>
            <a href="http://localhost:8080/api/v3/api-docs"
               target="_blank" rel="noreferrer" className="footer-link">
              OpenAPI JSON ↗
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} LuxStay. Full-Stack Java — Use Case 3.</span>
          <span className="footer-made">
            Built with Spring Boot · React · MySQL
          </span>
        </div>
      </div>
    </footer>
  );
}
