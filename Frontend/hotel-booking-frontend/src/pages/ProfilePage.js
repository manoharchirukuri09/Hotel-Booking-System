import React, { useState, useEffect } from 'react';
import { userAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoyaltyWidget from '../components/common/LoyaltyWidget';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ fullName: '', phone: '' });

  useEffect(() => {
    userAPI.getMe()
      .then(r => {
        setProfile(r.data.data);
        setForm({ fullName: r.data.data.fullName, phone: r.data.data.phone || '' });
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      const res = await userAPI.updateMe(form);
      setProfile(res.data.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="profile-layout fade-in">

          {/* Left column */}
          <div className="profile-left">
            <div className="avatar-card card">
              <div className="big-avatar">
                {profile?.fullName?.[0]?.toUpperCase()}
              </div>
              <h3 className="avatar-name">{profile?.fullName}</h3>
              <p className="avatar-email">{profile?.email}</p>
              <div style={{ marginTop: 10 }}>
                <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-info'}`}>
                  {isAdmin ? '★ Admin' : 'Customer'}
                </span>
              </div>
              {profile?.createdAt && (
                <p className="avatar-since">
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              )}
              {!editing && (
                <button className="btn btn-outline" style={{ width: '100%', marginTop: 20 }}
                  onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Loyalty widget — only for customers */}
            {!isAdmin && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase',
                              letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Loyalty Status
                </h3>
                <LoyaltyWidget />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="profile-right">
            <h2>Profile Details</h2>
            <div className="accent-line" />

            {editing ? (
              <form className="profile-form card" onSubmit={handleSave}>
                <h3 className="form-section-title" style={{ marginBottom: 20 }}>Edit Information</h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="Your full name" />
                </div>
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit mobile number" />
                </div>
                <div className="profile-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info card">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{profile?.fullName}</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{profile?.email}</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">
                    {profile?.phone || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                  </span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">Account Role</span>
                  <span className="info-value">
                    <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-info'}`}>
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Loyalty tiers info (customers only) */}
            {!isAdmin && (
              <div className="loyalty-tiers-info card" style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 14 }}>🏆 Loyalty Tier Benefits</h3>
                <div className="tiers-grid">
                  {[
                    { tier: 'BRONZE',   range: '0–499 pts',   discount: '0%',  color: '#78350f', icon: '🥉' },
                    { tier: 'SILVER',   range: '500–1,999',   discount: '5%',  color: '#1e3a5f', icon: '🥈' },
                    { tier: 'GOLD',     range: '2,000–4,999', discount: '10%', color: '#713f12', icon: '🥇' },
                    { tier: 'PLATINUM', range: '5,000+',      discount: '15%', color: '#1e1b4b', icon: '💎' },
                  ].map(t => (
                    <div key={t.tier} className="tier-card" style={{ background: t.color }}>
                      <div className="tier-icon">{t.icon}</div>
                      <div className="tier-name">{t.tier}</div>
                      <div className="tier-range">{t.range}</div>
                      <div className="tier-discount">{t.discount} off</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  Earn 1 point per ₹100 spent. 100 points = ₹50 discount to redeem at checkout.
                </p>
              </div>
            )}

            {/* Security note */}
            <div className="security-note card" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Account Security</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Your account is protected with JWT authentication. All booking data is encrypted
                    and secured. Never share your password with anyone.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
