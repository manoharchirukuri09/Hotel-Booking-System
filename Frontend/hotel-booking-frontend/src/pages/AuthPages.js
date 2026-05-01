import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const set = k => e => { setForm(f => ({...f, [k]: e.target.value})); setErrors(v => ({...v, [k]: ''})); };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-logo"><span className="text-gold">✦</span> LuxStay</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className={`form-input ${errors.email ? 'error' : ''}`}
              type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className={`form-input ${errors.password ? 'error' : ''}`}
              type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} />
            {errors.password && <span className="form-error">{errors.password}</span>}
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:8}} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="text-gold">Create one free</Link>
        </div>

        {/* Demo credentials hint */}
        <div className="demo-hint">
          <p className="demo-title">Demo Credentials</p>
          <p>Customer: <code>customer@test.com / test123</code></p>
          <p>Admin: <code className="text-yellow-400 bg-gray-800 px-2 py-0.5 rounded">admin@gmail.com / admin@1234</code></p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ fullName:'', email:'', password:'', phone:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName)                        e.fullName = 'Full name is required';
    if (!form.email)                           e.email    = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! A confirmation email has been sent to your inbox.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }

  };

  const set = k => e => { setForm(f => ({...f, [k]: e.target.value})); setErrors(v => ({...v, [k]: ''})); };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-logo"><span className="text-gold">✦</span> LuxStay</div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join LuxStay — it's free</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Ravi Kumar"
              value={form.fullName} onChange={set('fullName')} />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className={`form-input ${errors.email ? 'error' : ''}`}
              type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className={`form-input ${errors.password ? 'error' : ''}`}
              type="password" placeholder="Min 6 characters"
              value={form.password} onChange={set('password')} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" placeholder="9876543210"
              value={form.phone} onChange={set('phone')} />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:8}} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="text-gold">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
