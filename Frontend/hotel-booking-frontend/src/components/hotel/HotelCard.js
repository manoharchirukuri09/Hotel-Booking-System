import { Link, useSearchParams } from 'react-router-dom';
import './HotelCard.css';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating || 0) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function HotelCard({ hotel }) {
  const [searchParams] = useSearchParams();
  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : (hotel.amenities || '').split(',').map(a => a.trim()).filter(Boolean);

  const detailUrl = `/hotels/${hotel.id}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  return (
    <div className="hotel-card fade-in">
      <div className="hotel-card-image">
        {hotel.imageUrl
          ? <img src={hotel.imageUrl} alt={hotel.name} />
          : <div className="hotel-card-placeholder">
              <span>🏨</span>
            </div>
        }
        <div className="hotel-card-badge">
          <Stars rating={hotel.starRating} />
        </div>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-location">
          <span className="location-dot">◈</span>
          {hotel.city}, {hotel.state}
        </div>
        <h3 className="hotel-card-name">{hotel.name}</h3>

        {hotel.averageRating > 0 && (
          <div className="hotel-card-rating">
            <span className="rating-score">{hotel.averageRating?.toFixed(1)}</span>
            <span className="rating-label">Guest Rating</span>
          </div>
        )}

        {amenities.length > 0 && (
          <div className="hotel-card-amenities">
            {amenities.slice(0, 4).map(a => (
              <span key={a} className="amenity-tag">{a}</span>
            ))}
            {amenities.length > 4 && (
              <span className="amenity-tag muted">+{amenities.length - 4}</span>
            )}
          </div>
        )}

        <div className="hotel-card-footer">
          <div className="hotel-card-rooms">
            <span className="rooms-available">{hotel.availableRooms}</span>
            <span className="rooms-label"> rooms available</span>
          </div>
          <Link to={detailUrl} className="btn btn-outline btn-sm">
            View Hotel
          </Link>
        </div>
      </div>
    </div>
  );
}

