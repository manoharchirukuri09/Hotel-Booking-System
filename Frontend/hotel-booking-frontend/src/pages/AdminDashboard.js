import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { hotelAPI, roomAPI, bookingAPI, promoAPI, userAPI } from '../api/services';
import { BookingStatusBadge } from '../components/common/Badges';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

// ── Admin Hotels ─────────────────────────────────────────────────────────────
function AdminHotels() {
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const navigate = useNavigate();

  const EMPTY = { name:'', city:'', address:'', state:'', country:'India', description:'', starRating:'', imageUrl:'', amenities:'', contactEmail:'', contactPhone:'' };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    hotelAPI.getAll()
      .then(r => setHotels(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await hotelAPI.update(editing, { ...form, starRating: Number(form.starRating) });
        toast.success('Hotel updated');
      } else {
        await hotelAPI.create({ ...form, starRating: Number(form.starRating) });
        toast.success('Hotel created');
      }
      const r = await hotelAPI.getAll();
      setHotels(r.data.data || []);
      setShowForm(false); setEditing(null); setForm(EMPTY);
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this hotel?')) return;
    await hotelAPI.delete(id);
    setHotels(hs => hs.filter(h => h.id !== id));
    toast.success('Hotel deactivated');
  };

  const startEdit = (h) => {
    setForm({ name:h.name, city:h.city, address:h.address, state:h.state, country:h.country,
      description:h.description||'', starRating:h.starRating||'', imageUrl:h.imageUrl||'',
      amenities: Array.isArray(h.amenities) ? h.amenities.join(',') : h.amenities||'',
      contactEmail:h.contactEmail||'', contactPhone:h.contactPhone||'' });
    setEditing(h.id); setShowForm(true);
  };

  const S = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div>
      <div className="admin-section-header">
        <h3>Hotels ({hotels.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(v=>!v); setEditing(null); setForm(EMPTY); }}>
          {showForm ? 'Cancel' : '+ Add Hotel'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form card" onSubmit={handleSubmit}>
          <h4>{editing ? 'Edit Hotel' : 'New Hotel'}</h4>
          <div className="admin-form-grid">
            <div className="form-group"><label className="form-label">Hotel Name *</label><input className="form-input" value={form.name} onChange={S('name')} required /></div>
            <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={S('city')} required /></div>
            <div className="form-group"><label className="form-label">State *</label><input className="form-input" value={form.state} onChange={S('state')} required /></div>
            <div className="form-group"><label className="form-label">Country *</label><input className="form-input" value={form.country} onChange={S('country')} required /></div>
            <div className="form-group span-2"><label className="form-label">Address *</label><input className="form-input" value={form.address} onChange={S('address')} required /></div>
            <div className="form-group"><label className="form-label">Star Rating</label><select className="form-input form-select" value={form.starRating} onChange={S('starRating')}><option value="">Select</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Star</option>)}</select></div>
            <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.imageUrl} onChange={S('imageUrl')} placeholder="https://..." /></div>
            <div className="form-group span-2"><label className="form-label">Amenities (comma-separated)</label><input className="form-input" value={form.amenities} onChange={S('amenities')} placeholder="WiFi,Pool,Gym,Spa,Parking" /></div>
            <div className="form-group"><label className="form-label">Contact Email</label><input className="form-input" type="email" value={form.contactEmail} onChange={S('contactEmail')} /></div>
            <div className="form-group"><label className="form-label">Contact Phone</label><input className="form-input" value={form.contactPhone} onChange={S('contactPhone')} /></div>
            <div className="form-group span-2"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={S('description')} style={{resize:'vertical'}} /></div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button type="submit" className="btn btn-primary">{editing ? 'Update Hotel' : 'Create Hotel'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>City</th><th>Stars</th><th>Rooms</th><th>Actions</th></tr></thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id}>
                  <td><strong>{h.name}</strong></td>
                  <td>{h.city}, {h.state}</td>
                  <td>{'★'.repeat(h.starRating||0)}</td>
                  <td><span style={{color:'var(--success)'}}>{h.availableRooms}</span>/{h.totalRooms}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(h)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/hotels/${h.id}`)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin Rooms ───────────────────────────────────────────────────────────────
function AdminRooms() {
  const [hotels,  setHotels]  = useState([]);
  const [rooms,   setRooms]   = useState([]);
  const [selHotel,setSelHotel]= useState('');
  const [loading, setLoading] = useState(false);
  const [showForm,setShowForm]= useState(false);
  const ROOM_TYPES = ['SINGLE','DOUBLE','TWIN','SUITE','DELUXE','PENTHOUSE'];
  const EMPTY = { hotelId:'', roomNumber:'', roomType:'DELUXE', pricePerNight:'', maxCapacity:2, description:'', facilities:'', imageUrl:'' };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { hotelAPI.getAll().then(r => setHotels(r.data.data||[])); }, []);

  const loadRooms = async (hid) => {
    setSelHotel(hid); setLoading(true);
    roomAPI.getByHotel(hid).then(r => setRooms(r.data.data||[])).finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomAPI.create({ ...form, hotelId: Number(form.hotelId), pricePerNight: Number(form.pricePerNight), maxCapacity: Number(form.maxCapacity) });
      toast.success('Room created'); setShowForm(false); setForm(EMPTY);
      if (selHotel) loadRooms(selHotel);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create room'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this room?')) return;
    await roomAPI.delete(id);
    setRooms(rs => rs.filter(r => r.id !== id));
    toast.success('Room deactivated');
  };

  const S = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div>
      <div className="admin-section-header">
        <h3>Rooms</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v=>!v)}>
          {showForm ? 'Cancel' : '+ Add Room'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form card" onSubmit={handleSubmit}>
          <h4>New Room</h4>
          <div className="admin-form-grid">
            <div className="form-group span-2"><label className="form-label">Hotel *</label>
              <select className="form-input form-select" value={form.hotelId} onChange={S('hotelId')} required>
                <option value="">Select hotel</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Room Number *</label><input className="form-input" value={form.roomNumber} onChange={S('roomNumber')} required /></div>
            <div className="form-group"><label className="form-label">Room Type *</label>
              <select className="form-input form-select" value={form.roomType} onChange={S('roomType')}>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Price/Night (₹) *</label><input className="form-input" type="number" value={form.pricePerNight} onChange={S('pricePerNight')} required /></div>
            <div className="form-group"><label className="form-label">Max Capacity *</label><input className="form-input" type="number" min={1} max={20} value={form.maxCapacity} onChange={S('maxCapacity')} required /></div>
            <div className="form-group span-2"><label className="form-label">Facilities (comma-separated)</label><input className="form-input" value={form.facilities} onChange={S('facilities')} placeholder="AC,TV,WiFi,Mini-bar" /></div>
            <div className="form-group span-2"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={S('description')} style={{resize:'vertical'}} /></div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button type="submit" className="btn btn-primary">Create Room</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="form-group" style={{maxWidth:360,marginBottom:20}}>
        <label className="form-label">Filter by Hotel</label>
        <select className="form-input form-select" value={selHotel} onChange={e => loadRooms(e.target.value)}>
          <option value="">Select a hotel to view rooms</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"/></div> : rooms.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Room No.</th><th>Type</th><th>Price/Night</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td><strong>#{r.roomNumber}</strong></td>
                  <td><span className="badge badge-gold">{r.roomType}</span></td>
                  <td>₹{Number(r.pricePerNight).toLocaleString('en-IN')}</td>
                  <td>{r.maxCapacity} guests</td>
                  <td><span className={`badge ${r.available?'badge-success':'badge-danger'}`}>{r.available?'Available':'Unavailable'}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin Bookings ────────────────────────────────────────────────────────────
function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');

  useEffect(() => {
    bookingAPI.getAll().then(r => setBookings(r.data.data||[])).finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id) => {
    await bookingAPI.confirm(id);
    setBookings(bs => bs.map(b => b.id === id ? {...b, status:'CONFIRMED'} : b));
    toast.success('Booking confirmed');
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const STATUSES = ['ALL','CONFIRMED','PENDING','CANCELLED','COMPLETED'];

  return (
    <div>
      <div className="admin-section-header">
        <h3>All Bookings ({bookings.length})</h3>
      </div>
      <div className="status-tabs" style={{marginBottom:16}}>
        {STATUSES.map(s => (
          <button key={s} className={`status-tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
            {s}{s!=='ALL' ? ` (${bookings.filter(b=>b.status===s).length})` : ` (${bookings.length})`}
          </button>
        ))}
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Reservation</th><th>Guest</th><th>Hotel / Room</th><th>Dates</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><span style={{color:'var(--gold)',fontWeight:600,fontFamily:'var(--font-body)'}}>{b.reservationNumber}</span></td>
                  <td><div>{b.userFullName}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{b.userEmail}</div></td>
                  <td><div>{b.hotelName}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{b.roomType} · Rm {b.roomNumber}</div></td>
                  <td style={{fontSize:'0.8rem'}}>{b.checkInDate}<br/>{b.checkOutDate}</td>
                  <td style={{color:'var(--gold)',fontWeight:600}}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                  <td><BookingStatusBadge status={b.status}/></td>
                  <td>
                    {b.status === 'PENDING' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(b.id)}>Confirm</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin Promos ──────────────────────────────────────────────────────────────
function AdminPromos() {
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const EMPTY = { code:'', description:'', discountType:'PERCENTAGE', discountValue:'', minimumBookingAmount:'', maximumDiscountCap:'', validFrom:'', validTo:'', maxUsageCount:'' };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    promoAPI.getAll().then(r => setPromos(r.data.data||[])).finally(()=>setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form,
        discountValue: Number(form.discountValue),
        minimumBookingAmount: form.minimumBookingAmount ? Number(form.minimumBookingAmount) : undefined,
        maximumDiscountCap:   form.maximumDiscountCap   ? Number(form.maximumDiscountCap)   : undefined,
        maxUsageCount:        form.maxUsageCount        ? Number(form.maxUsageCount)        : undefined,
      };
      await promoAPI.create(payload);
      toast.success('Promo created');
      const r = await promoAPI.getAll(); setPromos(r.data.data||[]);
      setShowForm(false); setForm(EMPTY);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id) => {
    const res = await promoAPI.toggle(id);
    setPromos(ps => ps.map(p => p.id === id ? res.data.data : p));
    toast.success('Promo status updated');
  };

  const S = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div>
      <div className="admin-section-header">
        <h3>Promo Codes ({promos.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v=>!v)}>
          {showForm ? 'Cancel' : '+ Add Promo'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form card" onSubmit={handleSubmit}>
          <h4>New Promo Code</h4>
          <div className="admin-form-grid">
            <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={form.code} onChange={S('code')} required placeholder="SUMMER20" /></div>
            <div className="form-group"><label className="form-label">Discount Type *</label>
              <select className="form-input form-select" value={form.discountType} onChange={S('discountType')}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Discount Value *</label><input className="form-input" type="number" value={form.discountValue} onChange={S('discountValue')} required /></div>
            <div className="form-group"><label className="form-label">Min Booking Amount</label><input className="form-input" type="number" value={form.minimumBookingAmount} onChange={S('minimumBookingAmount')} /></div>
            <div className="form-group"><label className="form-label">Max Discount Cap</label><input className="form-input" type="number" value={form.maximumDiscountCap} onChange={S('maximumDiscountCap')} placeholder="For % type only" /></div>
            <div className="form-group"><label className="form-label">Max Usage Count</label><input className="form-input" type="number" value={form.maxUsageCount} onChange={S('maxUsageCount')} /></div>
            <div className="form-group"><label className="form-label">Valid From *</label><input className="form-input" type="date" value={form.validFrom} onChange={S('validFrom')} required /></div>
            <div className="form-group"><label className="form-label">Valid To *</label><input className="form-input" type="date" value={form.validTo} onChange={S('validTo')} required /></div>
            <div className="form-group span-2"><label className="form-label">Description *</label><input className="form-input" value={form.description} onChange={S('description')} required /></div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button type="submit" className="btn btn-primary">Create Promo</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Valid Until</th><th>Usage</th><th>Status</th><th>Toggle</th></tr></thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id}>
                  <td><span style={{fontFamily:'var(--font-body)',fontWeight:700,color:'var(--gold)'}}>{p.code}</span></td>
                  <td><span className="badge badge-info">{p.discountType}</span></td>
                  <td><strong>{p.discountType==='PERCENTAGE'?`${p.discountValue}%`:`₹${p.discountValue}`}</strong></td>
                  <td style={{fontSize:'0.82rem'}}>{p.validTo}</td>
                  <td style={{fontSize:'0.82rem'}}>{p.usedCount}{p.maxUsageCount?`/${p.maxUsageCount}`:''}</td>
                  <td><span className={`badge ${p.active?'badge-success':'badge-danger'}`}>{p.active?'Active':'Inactive'}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={()=>handleToggle(p.id)}>{p.active?'Disable':'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin Users ───────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getAll().then(r => setUsers(r.data.data||[])).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-section-header"><h3>All Users ({users.length})</h3></div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.email}</td>
                  <td style={{color:'var(--text-muted)'}}>{u.phone||'—'}</td>
                  <td><span className={`badge ${u.role==='ADMIN'?'badge-gold':'badge-info'}`}>{u.role}</span></td>
                  <td style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome() {
  const [stats, setStats] = useState({ hotels:0, bookings:0, users:0, revenue:0 });
  useEffect(() => {
    Promise.allSettled([hotelAPI.getAll(), bookingAPI.getAll(), userAPI.getAll()])
      .then(([h,b,u]) => {
        const hotels   = h.value?.data?.data || [];
        const bookings = b.value?.data?.data || [];
        const users    = u.value?.data?.data || [];
        const revenue  = bookings.filter(bk=>bk.status!=='CANCELLED').reduce((s,bk)=>s+Number(bk.totalAmount||0),0);
        setStats({ hotels:hotels.length, bookings:bookings.length, users:users.length, revenue });
      });
  }, []);

  return (
    <div>
      <h3 style={{marginBottom:20}}>Overview</h3>
      <div className="admin-stats-grid">
        {[
          { icon:'🏨', label:'Total Hotels',   val: stats.hotels,   cls:'' },
          { icon:'📋', label:'Total Bookings', val: stats.bookings, cls:'' },
          { icon:'👥', label:'Registered Users',val:stats.users,   cls:'' },
          { icon:'💰', label:'Total Revenue',  val:`₹${stats.revenue.toLocaleString('en-IN')}`, cls:'text-gold' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className={`admin-stat-val ${s.cls}`}>{s.val}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const TABS = [
    { path:'/admin',         label:'Overview',  end:true },
    { path:'/admin/hotels',  label:'Hotels'  },
    { path:'/admin/rooms',   label:'Rooms'   },
    { path:'/admin/bookings',label:'Bookings'},
    { path:'/admin/promos',  label:'Promos'  },
    { path:'/admin/users',   label:'Users'   },
  ];

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <div className="accent-line" />
          </div>
          <span className="badge badge-gold">Administrator</span>
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <NavLink key={t.path} to={t.path} end={t.end}
              className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
              {t.label}
            </NavLink>
          ))}
        </div>

        <div className="admin-content card">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="hotels"   element={<AdminHotels />} />
            <Route path="rooms"    element={<AdminRooms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="promos"   element={<AdminPromos />} />
            <Route path="users"    element={<AdminUsers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
