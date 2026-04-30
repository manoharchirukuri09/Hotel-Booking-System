import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center', padding:'60px 24px'}} className="fade-in">
        <div style={{fontFamily:'var(--font-display)',fontSize:'7rem',fontWeight:700,color:'var(--border-light)',lineHeight:1}}>
          404
        </div>
        <h2 style={{marginTop:16,marginBottom:10}}>Page Not Found</h2>
        <p style={{color:'var(--text-muted)',marginBottom:28}}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Link to="/"       className="btn btn-primary">Go Home</Link>
          <Link to="/hotels" className="btn btn-outline">Browse Hotels</Link>
        </div>
      </div>
    </div>
  );
}
