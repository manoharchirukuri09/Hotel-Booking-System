import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, promoAPI, hotelAPI, roomAPI, loyaltyAPI } from '../api/services';
import toast from 'react-hot-toast';
import './BookingPage.css';

export default function BookingPage() {
  const { hotelId, roomId } = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now()+86400000).toISOString().split('T')[0];

  const [hotel,   setHotel]   = useState(state?.hotel || null);
  const [room,    setRoom]    = useState(state?.room  || null);
  const [loading, setLoading] = useState(!state?.hotel);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    checkInDate:    state?.checkIn  || today,
    checkOutDate:   state?.checkOut || tomorrow,
    numberOfGuests: state?.guests   || 1,
    promoCode:      '',
    specialRequests:'',
    redeemLoyaltyPoints: 0,
  });

  const [promoResult, setPromoResult] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [loyalty, setLoyalty] = useState(null);

  useEffect(() => {
    if (!state?.hotel) {
      Promise.all([hotelAPI.getById(hotelId), roomAPI.getById(roomId)])
        .then(([h,r]) => { setHotel(h.data.data); setRoom(r.data.data); })
        .catch(() => toast.error('Could not load booking details'))
        .finally(() => setLoading(false));
    }
    // Fetch loyalty info
    loyaltyAPI.getMyLoyalty().then(r => setLoyalty(r.data.data)).catch(() => {});
  }, [hotelId, roomId, state]);

  const nights = form.checkInDate && form.checkOutDate
    ? Math.max(1, Math.ceil((new Date(form.checkOutDate)-new Date(form.checkInDate))/(1000*60*60*24)))
    : 1;

  const baseAmount      = room ? Number(room.pricePerNight) * nights : 0;
  const promoDiscount   = promoResult?.valid ? Number(promoResult.discountAmount) : 0;
  
  // Tier Discount (Auto applied on base amount minus promo)
  const tierPct         = loyalty?.tierDiscountPercent || 0;
  const tierDiscount    = Math.round((baseAmount - promoDiscount) * (tierPct / 100));

  // Points Discount (Manual)
  const pointsToRedeem  = Number(form.redeemLoyaltyPoints) || 0;
  const pointsDiscount  = Math.floor(pointsToRedeem / 100) * 50;

  const totalDiscount   = promoDiscount + tierDiscount + pointsDiscount;
  const totalAmount     = Math.max(0, baseAmount - totalDiscount);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const handleApplyPromo = async () => {
    if (!form.promoCode.trim()) { toast.error('Enter a promo code'); return; }
    setPromoLoading(true);
    try {
      const res = await promoAPI.validate(form.promoCode.trim(), baseAmount);
      setPromoResult(res.data.data);
      if (res.data.data?.valid) toast.success(res.data.data.message);
      else                      toast.error(res.data.data?.message || 'Invalid promo code');
    } catch { toast.error('Could not validate promo code'); }
    finally { setPromoLoading(false); }
  };

  const handleRemovePromo = () => {
    setPromoResult(null);
    setForm(f => ({...f, promoCode: ''}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.checkOutDate <= form.checkInDate) { toast.error('Check-out must be after check-in'); return; }
    setSubmitting(true);
    try {
      const payload = {
        hotelId:        Number(hotelId),
        roomId:         Number(roomId),
        checkInDate:    form.checkInDate,
        checkOutDate:   form.checkOutDate,
        numberOfGuests: Number(form.numberOfGuests),
        promoCode:      promoResult?.valid ? form.promoCode : undefined,
        specialRequests: form.specialRequests || undefined,
        redeemLoyaltyPoints: Number(form.redeemLoyaltyPoints) || 0,
      };
      const res = await bookingAPI.create(payload);
      const booking = res.data.data;
      toast.success(`Booking confirmed! Ref: ${booking.reservationNumber}`);
      navigate(`/booking-confirmation/${booking.reservationNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loader"><div className="spinner"/></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="booking-layout fade-in">
          {/* Left - Form */}
          <div className="booking-form-col">
            <h2 className="booking-heading">Complete Your Booking</h2>
            <div className="accent-line" />

            <form onSubmit={handleSubmit} className="booking-form">

              {/* Dates & Guests */}
              <div className="form-section">
                <h3 className="form-section-title">Stay Details</h3>
                <div className="dates-grid">
                  <div className="form-group">
                    <label className="form-label">Check-in Date</label>
                    <input type="date" className="form-input" min={today}
                      value={form.checkInDate} onChange={set('checkInDate')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-out Date</label>
                    <input type="date" className="form-input" min={form.checkInDate}
                      value={form.checkOutDate} onChange={set('checkOutDate')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Guests</label>
                  <select className="form-input form-select"
                    value={form.numberOfGuests} onChange={set('numberOfGuests')}>
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}
                        disabled={room && n > room.maxCapacity}>
                        {n} Guest{n>1?'s':''}{room && n > room.maxCapacity ? ' (exceeds capacity)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Promo Code */}
              <div className="form-section">
                <h3 className="form-section-title">Promo Code</h3>
                {promoResult?.valid ? (
                  <div className="promo-applied">
                    <div className="promo-applied-info">
                      <span className="promo-check">✓</span>
                      <div>
                        <div className="promo-code-label">{form.promoCode.toUpperCase()}</div>
                        <div className="promo-savings">You save ₹{promoDiscount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemovePromo}>Remove</button>
                  </div>
                ) : (
                  <div className="promo-row">
                    <input className="form-input" placeholder="Enter promo code e.g. SUMMER20"
                      value={form.promoCode}
                      onChange={e => { setForm(f=>({...f, promoCode:e.target.value})); setPromoResult(null); }} />
                    <button type="button" className="btn btn-outline" onClick={handleApplyPromo} disabled={promoLoading}>
                      {promoLoading ? <span className="spinner" style={{width:14,height:14}}/> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="form-section">
                <h3 className="form-section-title">Special Requests <span className="optional">(optional)</span></h3>
                <textarea className="form-input" rows={3}
                  placeholder="Late check-in, extra pillows, non-smoking room…"
                  value={form.specialRequests}
                  onChange={set('specialRequests')}
                  style={{resize:'vertical'}} />
              </div>
              
              {/* Loyalty Redemption */}
              {loyalty && loyalty.loyaltyPoints >= 100 && (
                <div className="form-section">
                  <h3 className="form-section-title">Redeem Rewards</h3>
                  <div className="loyalty-redeem-info">
                    You have <span className="text-gold"><b>{loyalty.loyaltyPoints} points</b></span> (Value: ₹{loyalty.redeemValue})
                  </div>
                  <div className="form-group" style={{marginTop:12}}>
                    <label className="form-label">Points to Redeem (100 pts = ₹50)</label>
                    <div className="range-container">
                      <input type="range" 
                        min="0" 
                        max={Math.floor(loyalty.loyaltyPoints / 100) * 100} 
                        step="100"
                        className="form-range"
                        value={form.redeemLoyaltyPoints}
                        onChange={e => setForm(f => ({...f, redeemLoyaltyPoints: e.target.value}))}
                      />
                      <div className="range-labels">
                        <span>0</span>
                        <span>{form.redeemLoyaltyPoints} pts</span>
                        <span>{Math.floor(loyalty.loyaltyPoints / 100) * 100}</span>
                      </div>
                    </div>
                    {pointsDiscount > 0 && (
                      <div className="points-saving-preview text-success">
                        Saving ₹{pointsDiscount.toLocaleString('en-IN')} with points
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg booking-submit" disabled={submitting}>
                {submitting
                  ? <><span className="spinner" style={{width:18,height:18}}/> Confirming Booking…</>
                  : `Confirm Booking · ₹${totalAmount.toLocaleString('en-IN')}`
                }
              </button>
            </form>
          </div>

          {/* Right - Summary */}
          <div className="booking-summary-col">
            <div className="summary-card card sticky-summary">
              <div className="summary-hotel-img">
                {hotel?.imageUrl
                  ? <img src={hotel.imageUrl} alt={hotel?.name} />
                  : <div className="summary-img-placeholder">🏨</div>
                }
              </div>
              <div className="summary-body">
                <div className="summary-location text-muted" style={{fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                  {hotel?.city}, {hotel?.state}
                </div>
                <h3 className="summary-hotel-name">{hotel?.name}</h3>
                <div className="summary-room">
                  <span className="badge badge-gold">{room?.roomType}</span>
                  <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Room {room?.roomNumber}</span>
                </div>
                <hr className="divider" />

                <div className="summary-row">
                  <span>Check-in</span>
                  <strong>{form.checkInDate}</strong>
                </div>
                <div className="summary-row">
                  <span>Check-out</span>
                  <strong>{form.checkOutDate}</strong>
                </div>
                <div className="summary-row">
                  <span>Duration</span>
                  <strong>{nights} Night{nights>1?'s':''}</strong>
                </div>
                <div className="summary-row">
                  <span>Guests</span>
                  <strong>{form.numberOfGuests}</strong>
                </div>
                <hr className="divider" />

                <div className="summary-row">
                  <span>₹{Number(room?.pricePerNight||0).toLocaleString('en-IN')} × {nights} nights</span>
                  <strong>₹{baseAmount.toLocaleString('en-IN')}</strong>
                </div>
                {promoDiscount > 0 && (
                  <div className="summary-row discount-row text-success">
                    <span>Promo discount</span>
                    <strong>−₹{promoDiscount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {tierDiscount > 0 && (
                  <div className="summary-row discount-row text-success">
                    <span>{loyalty?.loyaltyTier} benefit ({tierPct}%)</span>
                    <strong>−₹{tierDiscount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="summary-row discount-row text-success">
                    <span>Points redeemed</span>
                    <strong>−₹{pointsDiscount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <hr className="divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span className="total-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
