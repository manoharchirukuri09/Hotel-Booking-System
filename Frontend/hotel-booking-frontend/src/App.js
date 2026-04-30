import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import HomePage                from './pages/HomePage';
import LoginPage               from './pages/LoginPage';
import RegisterPage            from './pages/RegisterPage';
import ForgotPasswordPage      from './pages/ForgotPasswordPage';
import ResetPasswordPage       from './pages/ResetPasswordPage';
import HotelsPage              from './pages/HotelsPage';
import HotelDetailPage         from './pages/HotelDetailPage';
import BookingPage             from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingDetailPage       from './pages/BookingDetailPage';
import MyBookingsPage          from './pages/MyBookingsPage';
import ProfilePage             from './pages/ProfilePage';
import AdminDashboard          from './pages/AdminDashboard';
import NotFoundPage            from './pages/NotFoundPage';

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/" replace />;
  return children;
}
function GuestRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

function AppShell() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/hotels"     element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password"  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/book/:hotelId/:roomId"
               element={<PrivateRoute><BookingPage /></PrivateRoute>} />
        <Route path="/booking-confirmation/:reservationNumber"
               element={<PrivateRoute><BookingConfirmationPage /></PrivateRoute>} />
        <Route path="/bookings/:id"
               element={<PrivateRoute><BookingDetailPage /></PrivateRoute>} />
        <Route path="/my-bookings"
               element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
        <Route path="/profile"
               element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/admin/*"
               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background:'#1c2029', color:'#f0eeea', border:'1px solid #262c38', borderRadius:'10px', fontSize:'0.875rem' },
          success: { iconTheme: { primary:'#c9a84c', secondary:'#0a0c10' } },
          error:   { iconTheme: { primary:'#ef4444', secondary:'#0a0c10' } },
          duration: 3500,
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
