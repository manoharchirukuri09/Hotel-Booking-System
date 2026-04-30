import api from './axiosInstance';

// ═══════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════
export const authAPI = {
  register: (data)          => api.post('/auth/register', data),
  login:    (data)          => api.post('/auth/login', data),
  refresh:  (refreshToken)  => api.post(`/auth/refresh?refreshToken=${refreshToken}`),
  forgotPassword: (email)   => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)    => api.post('/auth/reset-password', data),
};


// ═══════════════════════════════════════════════
// HOTELS API
// ═══════════════════════════════════════════════
export const hotelAPI = {
  getAll:    ()         => api.get('/hotels'),
  getById:   (id)       => api.get(`/hotels/${id}`),
  search:    (keyword)  => api.get(`/hotels/search?keyword=${encodeURIComponent(keyword)}`),
  getByCity: (city)     => api.get(`/hotels/city/${encodeURIComponent(city)}`),
  create:    (data)     => api.post('/hotels', data),
  update:    (id, data) => api.put(`/hotels/${id}`, data),
  delete:    (id)       => api.delete(`/hotels/${id}`),
};

// ═══════════════════════════════════════════════
// ADVANCED HOTEL SEARCH API
// ═══════════════════════════════════════════════
export const searchAPI = {
  /**
   * Filter hotels by any combination of:
   *   keyword, city, minPrice, maxPrice, amenities (comma-sep),
   *   minRating, checkIn (YYYY-MM-DD), checkOut, guests
   */
  filter: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    return api.get(`/hotels/search/filter?${qs.toString()}`);
  },
};

// ═══════════════════════════════════════════════
// ROOMS API
// ═══════════════════════════════════════════════
export const roomAPI = {
  getById:      (id)                                    => api.get(`/rooms/${id}`),
  getByHotel:   (hotelId)                               => api.get(`/rooms/hotel/${hotelId}`),
  getAvailable: (hotelId, checkIn, checkOut, guests)    =>
    api.get(`/rooms/available?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`),
  create:       (data)     => api.post('/rooms', data),
  update:       (id, data) => api.put(`/rooms/${id}`, data),
  delete:       (id)       => api.delete(`/rooms/${id}`),
};

// ═══════════════════════════════════════════════
// BOOKINGS API
// ═══════════════════════════════════════════════
export const bookingAPI = {
  create:           (data) => api.post('/bookings', data),
  getMyBookings:    ()     => api.get('/bookings/my'),
  getById:          (id)   => api.get(`/bookings/${id}`),
  getByReservation: (ref)  => api.get(`/bookings/reservation/${ref}`),
  cancel:           (id)   => api.put(`/bookings/${id}/cancel`),
  // Admin
  getAll:           ()     => api.get('/bookings'),
  confirm:          (id)   => api.put(`/bookings/${id}/confirm`),
};

// ═══════════════════════════════════════════════
// PROMOS API
// ═══════════════════════════════════════════════
export const promoAPI = {
  validate: (code, bookingAmount) =>
    api.post('/promos/validate', { code, bookingAmount }),
  create:   (data) => api.post('/promos', data),
  getAll:   ()     => api.get('/promos'),
  toggle:   (id)   => api.put(`/promos/${id}/toggle`),
};

// ═══════════════════════════════════════════════
// USERS API
// ═══════════════════════════════════════════════
export const userAPI = {
  getMe:    ()     => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getAll:   ()     => api.get('/users'),
};

// ═══════════════════════════════════════════════
// LOYALTY API
// ═══════════════════════════════════════════════
export const loyaltyAPI = {
  getMyLoyalty: ()  => api.get('/loyalty/me'),
  getTiers:     ()  => api.get('/loyalty/tiers'),
};

// ═══════════════════════════════════════════════
// REVIEWS API
// ═══════════════════════════════════════════════
export const reviewAPI = {
  getByHotel: (hotelId) => api.get(`/reviews/hotel/${hotelId}`),
  getMyReviews: ()       => api.get('/reviews/my'),
  addReview:  (data)    => api.post('/reviews', data),
  deleteReview: (id)    => api.delete(`/reviews/${id}`),
};
