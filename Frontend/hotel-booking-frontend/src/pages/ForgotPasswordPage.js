import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Email is required'); return; }
    
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-logo"><span className="text-gold">✦</span> LuxStay</div>
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-sub">Enter your email to receive a password reset link</p>

        {sent ? (
          <div className="success-state" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox (and spam folder).
            </p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                className="form-input"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Sending…</> : 'Send Reset Link'}
            </button>
            <div className="auth-footer" style={{ marginTop: 24 }}>
              Remember your password? <Link to="/login" className="text-gold">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
