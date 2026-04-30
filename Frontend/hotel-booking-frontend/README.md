# LuxStay — Hotel Booking Frontend (React JS)

## Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8080`

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000
```

## Project Structure

```
src/
├── api/
│   ├── axiosInstance.js     # Axios base URL + JWT interceptors
│   └── services.js          # All API calls: authAPI, hotelAPI, roomAPI,
│                            #   bookingAPI, promoAPI, userAPI
├── context/
│   └── AuthContext.js       # Global auth state (login/logout/register)
├── components/
│   ├── common/
│   │   ├── Navbar.js / .css # Sticky nav with user dropdown, mobile menu
│   │   └── Badges.js        # BookingStatusBadge, RoomTypeBadge
│   └── hotel/
│       └── HotelCard.js/.css # Hotel listing card
├── pages/
│   ├── HomePage.js/.css      # Hero, search, featured hotels, CTA
│   ├── LoginPage.js          # Login form (re-export)
│   ├── RegisterPage.js       # Register form (re-export)
│   ├── AuthPages.js/.css     # Login + Register forms
│   ├── HotelsPage.js/.css    # Search, city filter, sort, hotel grid
│   ├── HotelDetailPage.js/.css # Hotel info, availability search, room cards
│   ├── BookingPage.js/.css   # Booking form + promo validation + order summary
│   ├── MyBookingsPage.js/.css # Booking history, cancel, rebook
│   ├── ProfilePage.js/.css   # User profile view and edit
│   ├── AdminDashboard.js/.css # Admin: Hotels, Rooms, Bookings, Promos, Users
│   └── NotFoundPage.js       # 404 page
├── App.js                    # Router + Route guards (Private, Admin, Guest)
├── index.js                  # React entry point
└── index.css                 # Global design system (dark luxury theme)
```

## API Endpoints Used

| Service     | Endpoint                                      |
|-------------|-----------------------------------------------|
| Auth        | POST /auth/register, /auth/login, /auth/refresh |
| Hotels      | GET /hotels, /hotels/search, /hotels/:id       |
| Rooms       | GET /rooms/hotel/:id, /rooms/available         |
| Bookings    | POST /bookings, GET /bookings/my, PUT cancel   |
| Promos      | POST /promos/validate                          |
| Users       | GET /users/me, PUT /users/me                   |
| Admin       | Full CRUD on hotels, rooms, bookings, promos, users |

## Route Guards

- **Public** — `/`, `/hotels`, `/hotels/:id`
- **GuestRoute** — `/login`, `/register` (redirect to home if logged in)
- **PrivateRoute** — `/my-bookings`, `/book/:id/:roomId`, `/profile`
- **AdminRoute** — `/admin/*` (redirect if not ADMIN role)

## Auth Flow

1. Login/Register → JWT stored in `localStorage`
2. Axios interceptor auto-attaches `Authorization: Bearer <token>`
3. On 401, interceptor auto-refreshes token using refresh token
4. On refresh failure, user is logged out and redirected to `/login`

## Environment

Create `.env` in root to change the backend URL:
```
REACT_APP_API_URL=http://localhost:8080/api
```
Then update `axiosInstance.js` to use `process.env.REACT_APP_API_URL`.
