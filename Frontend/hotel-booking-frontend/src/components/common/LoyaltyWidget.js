import React, { useEffect, useState } from 'react';
import { loyaltyAPI } from '../../api/services';
import './LoyaltyWidget.css';

const TIER_COLORS = {
  BRONZE:   { bg: '#78350f', text: '#fef3c7', bar: '#d97706' },
  SILVER:   { bg: '#1e3a5f', text: '#dbeafe', bar: '#60a5fa' },
  GOLD:     { bg: '#713f12', text: '#fefce8', bar: '#eab308' },
  PLATINUM: { bg: '#1e1b4b', text: '#ede9fe', bar: '#a78bfa' },
};

const TIER_ICONS = {
  BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎',
};

export default function LoyaltyWidget() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loyaltyAPI.getMyLoyalty()
      .then(r => setLoyalty(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loyalty-widget loading"><div className="spinner" /></div>;
  if (!loyalty) return null;

  const colors    = TIER_COLORS[loyalty.loyaltyTier] || TIER_COLORS.BRONZE;
  const toNext    = loyalty.pointsToNextTier;
  const tierMax   = { BRONZE: 500, SILVER: 2000, GOLD: 5000, PLATINUM: 5000 };
  const tierMin   = { BRONZE: 0,   SILVER: 500,  GOLD: 2000, PLATINUM: 5000 };
  const range     = tierMax[loyalty.loyaltyTier] - tierMin[loyalty.loyaltyTier];
  const earned    = loyalty.loyaltyPoints - tierMin[loyalty.loyaltyTier];
  const pct       = loyalty.loyaltyTier === 'PLATINUM' ? 100 : Math.min(100, Math.round((earned / range) * 100));

  return (
    <div className="loyalty-widget" style={{ background: colors.bg }}>
      <div className="lw-header">
        <div className="lw-tier-badge" style={{ color: colors.bar }}>
          {TIER_ICONS[loyalty.loyaltyTier]} {loyalty.loyaltyTier}
        </div>
        {loyalty.tierDiscountPercent > 0 && (
          <div className="lw-discount" style={{ color: colors.text }}>
            {loyalty.tierDiscountPercent}% auto-discount on bookings
          </div>
        )}
      </div>

      <div className="lw-points" style={{ color: colors.text }}>
        <span className="lw-points-num">{loyalty.loyaltyPoints.toLocaleString('en-IN')}</span>
        <span className="lw-points-label"> points</span>
      </div>

      <div className="lw-bar-wrap">
        <div className="lw-bar-bg">
          <div className="lw-bar-fill" style={{ width: `${pct}%`, background: colors.bar }} />
        </div>
        {loyalty.loyaltyTier !== 'PLATINUM' && (
          <div className="lw-bar-label" style={{ color: colors.text }}>
            {toNext} pts to {loyalty.nextTier}
          </div>
        )}
      </div>

      <div className="lw-redeem" style={{ color: colors.text, opacity: 0.85 }}>
        💸 Redeem value: <strong>₹{loyalty.redeemValue?.toLocaleString('en-IN') || 0}</strong>
        <span className="lw-redeem-hint"> (100 pts = ₹50)</span>
      </div>
    </div>
  );
}
