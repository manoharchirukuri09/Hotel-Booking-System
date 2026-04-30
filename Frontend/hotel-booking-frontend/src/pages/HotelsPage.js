import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAPI } from '../api/services';
import HotelCard from '../components/hotel/HotelCard';
import toast from 'react-hot-toast';
import './HotelsPage.css';

const CITIES     = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Goa', 'Jaipur'];
const AMENITIES  = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant', 'Beach Access', 'Conference Room'];
const PRICE_RANGES = [
  { label: 'Any Price',        min: '',    max: ''    },
  { label: 'Under ₹3,000',    min: '',    max: 3000  },
  { label: '₹3,000–₹6,000',  min: 3000,  max: 6000  },
  { label: '₹6,000–₹10,000', min: 6000,  max: 10000 },
  { label: 'Above ₹10,000',   min: 10000, max: ''    },
];

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels,   setHotels]    = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [sortBy,   setSortBy]    = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    keyword:     searchParams.get('search')   || '',
    checkIn:     searchParams.get('checkIn')  || '',
    checkOut:    searchParams.get('checkOut') || '',
    guests:      searchParams.get('guests')   || '1',
    city:        '',
    priceRange:  0,        // index into PRICE_RANGES
    amenities:   [],       // selected amenity strings
    minRating:   '',
  });

  const buildParams = useCallback((f) => {
    const selected = PRICE_RANGES[f.priceRange];
    return {
      keyword:   f.keyword    || undefined,
      city:      f.city       || undefined,
      minPrice:  selected.min || undefined,
      maxPrice:  selected.max || undefined,
      amenities: f.amenities.length ? f.amenities.join(',') : undefined,
      minRating: f.minRating  || undefined,
      checkIn:   f.checkIn    || undefined,
      checkOut:  f.checkOut   || undefined,
      guests:    f.guests     || undefined,
    };
  }, []);

  const fetchHotels = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await searchAPI.filter(buildParams(f));
      setHotels(res.data.data || []);
    } catch {
      toast.error('Failed to load hotels');
      setHotels([]);
    } finally { setLoading(false); }
  }, [buildParams]);

  useEffect(() => {
    fetchHotels(filters);
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (filters.keyword)  p.search   = filters.keyword;
    if (filters.checkIn)  p.checkIn  = filters.checkIn;
    if (filters.checkOut) p.checkOut = filters.checkOut;
    if (filters.guests > 1) p.guests = filters.guests;
    
    setSearchParams(p);
    fetchHotels(filters);
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const toggleAmenity = (a) => {
    const next = filters.amenities.includes(a)
      ? filters.amenities.filter(x => x !== a)
      : [...filters.amenities, a];
    handleFilterChange('amenities', next);
  };

  const handleApplyFilters = () => {
    fetchHotels(filters);
    setShowFilters(false);
  };

  const handleReset = () => {
    const cleared = { 
      keyword:'', city:'', priceRange:0, amenities:[], minRating:'',
      checkIn: '', checkOut: '', guests: '1' 
    };
    setFilters(cleared);
    setSearchParams({});
    fetchHotels(cleared);
    setShowFilters(false);
  };


  const sorted = [...hotels].sort((a, b) => {
    if (sortBy === 'rating')    return (b.averageRating  || 0) - (a.averageRating  || 0);
    if (sortBy === 'stars')     return (b.starRating     || 0) - (a.starRating     || 0);
    if (sortBy === 'available') return (b.availableRooms || 0) - (a.availableRooms || 0);
    return 0;
  });

  const hasActiveFilters = filters.city || filters.priceRange > 0 ||
    filters.amenities.length > 0 || filters.minRating;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="hotels-header fade-in">
          <div>
            <h1 className="hotels-title">
              {filters.city ? `Hotels in ${filters.city}`
                : filters.keyword ? `Results for "${filters.keyword}"`
                : 'All Hotels'}
            </h1>
            <div className="accent-line" />
            <p className="hotels-sub">
              {loading ? 'Searching…' : `${hotels.length} hotel${hotels.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Search bar */}
        <form className="hotels-search" onSubmit={handleSearch}>
          <div className="search-group">
            <input
              className="form-input"
              placeholder="Search by hotel name, city or state…"
              value={filters.keyword}
              onChange={e => handleFilterChange('keyword', e.target.value)}
              style={{ flex: 1.5 }}
            />
            <div className="search-v-sep" />
            <div className="date-group">
              <input
                type="date"
                className="form-input date-input"
                value={filters.checkIn}
                onChange={e => handleFilterChange('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <span className="date-sep">→</span>
              <input
                type="date"
                className="form-input date-input"
                value={filters.checkOut}
                onChange={e => handleFilterChange('checkOut', e.target.value)}
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Search</button>
          <button
            type="button"
            className={`btn btn-ghost ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
          >
            🎛 Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>
          {(filters.keyword || filters.checkIn || hasActiveFilters) && (
            <button type="button" className="btn btn-ghost" onClick={handleReset}>✕ Clear</button>
          )}
        </form>

        {/* City chips */}
        <div className="city-chips">
          {CITIES.map(c => (
            <button
              key={c}
              className={`city-chip ${filters.city === c ? 'active' : ''}`}
              onClick={() => {
                const next = { ...filters, city: filters.city === c ? '' : c };
                setFilters(next);
                fetchHotels(next);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="filters-panel card fade-in">
            <div className="filters-grid">
              {/* Price range */}
              <div className="filter-group">
                <label className="form-label">Price Range (per night)</label>
                <div className="price-chips">
                  {PRICE_RANGES.map((pr, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`price-chip ${filters.priceRange === i ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priceRange', i)}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div className="filter-group">
                <label className="form-label">Minimum Star Rating</label>
                <div className="rating-chips">
                  {['', '3', '4', '5'].map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`rating-chip ${filters.minRating === r ? 'active' : ''}`}
                      onClick={() => handleFilterChange('minRating', r)}
                    >
                      {r ? `${r}★+` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="filter-group full-width">
                <label className="form-label">Amenities</label>
                <div className="amenity-chips">
                  {AMENITIES.map(a => (
                    <button
                      key={a}
                      type="button"
                      className={`amenity-chip ${filters.amenities.includes(a) ? 'active' : ''}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-primary" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="btn btn-ghost" onClick={handleReset}>
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="hotels-toolbar">
          <span className="result-count">
            {!loading && `${sorted.length} result${sorted.length !== 1 ? 's' : ''}`}
          </span>
          <div className="sort-group">
            <label className="sort-label">Sort by</label>
            <select
              className="form-input form-select"
              style={{ width: 'auto', padding: '8px 36px 8px 12px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="rating">Guest Rating</option>
              <option value="stars">Star Rating</option>
              <option value="available">Availability</option>
            </select>
          </div>
        </div>

        {/* Hotel grid */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No hotels found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={handleReset}>
              Show all hotels
            </button>
          </div>
        ) : (
          <div className="grid-3 fade-in">
            {sorted.map(h => <HotelCard key={h.id} hotel={h} />)}
          </div>
        )}
      </div>
    </div>
  );
}
