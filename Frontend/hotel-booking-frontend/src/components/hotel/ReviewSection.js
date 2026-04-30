import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ReviewSection.css';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
      <span className="star-label">
        {value ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating'}
      </span>
    </div>
  );
}

function ReviewCard({ review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
  const initials = review.userName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="reviewer-avatar">{initials}</div>
        <div className="reviewer-info">
          <div className="reviewer-name">{review.userName}</div>
          <div className="review-meta">
            <div className="review-stars">
              {stars.map((filled, i) => (
                <span key={i} className={`rs ${filled ? 'filled' : ''}`}>★</span>
              ))}
            </div>
            <span className="review-date">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : ''}
            </span>
          </div>
        </div>
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );
}

export default function ReviewSection({ hotelId }) {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ rating: 0, comment: '' });

  useEffect(() => {
    reviewAPI.getByHotel(hotelId)
      .then(r => setReviews(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hotelId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.addReview({ hotelId: Number(hotelId), ...form });
      setReviews(prev => [res.data.data, ...prev]);
      setForm({ rating: 0, comment: '' });
      setShowForm(false);
      toast.success('Review submitted! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="review-section">
      <div className="review-section-header">
        <div>
          <h2 className="review-section-title">Guest Reviews</h2>
          <div className="accent-line" />
        </div>
        {isLoggedIn && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? 'Cancel' : '✏️ Write Review'}
          </button>
        )}
      </div>

      {/* Summary row */}
      {reviews.length > 0 && (
        <div className="review-summary">
          <div className="review-avg-block">
            <span className="review-avg-num">{avgRating}</span>
            <div className="review-avg-stars">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`rs ${n <= Math.round(parseFloat(avgRating)) ? 'filled' : ''}`}>★</span>
              ))}
            </div>
            <span className="review-count">{reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
          </div>
          <div className="review-bars">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="rating-bar-row">
                <span className="rating-bar-label">{star}★</span>
                <div className="rating-bar-bg">
                  <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="rating-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form className="review-form card" onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Share Your Experience</h3>
          <div className="form-group">
            <label className="form-label">Your Rating</label>
            <StarPicker value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Your Review (optional)</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell other guests about your stay…"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              maxLength={1000}
              style={{ resize: 'vertical' }}
            />
            <div className="char-count">{form.comment.length}/1000</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</>
                : 'Submit Review'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          <p className="review-form-note">
            You can only review hotels where you have a confirmed booking.
          </p>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="page-loader" style={{ minHeight: 120 }}><div className="spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <div className="icon">💬</div>
          <h3>No reviews yet</h3>
          <p>Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
