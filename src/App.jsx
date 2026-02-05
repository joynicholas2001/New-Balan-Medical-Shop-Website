import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartDrawer from './components/common/CartDrawer';
import Chatbot from './components/chatbot/Chatbot';
import CouponMarquee from './components/common/CouponMarquee';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Clinic = lazy(() => import('./pages/Clinic'));
const Pharmacy = lazy(() => import('./pages/Pharmacy'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Polyclinic = lazy(() => import('./pages/Polyclinic'));
const About = lazy(() => import('./pages/About'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));

import ScrollToTop from './components/common/ScrollToTop';

function AppContent() {
  const location = useLocation();
  const { deliverySettings, getActiveCoupons } = useData();
  const hideFooter = ['/login', '/profile', '/admin'].some(path => location.pathname.toLowerCase().startsWith(path));
  const hideNavbar = ['/login', '/profile', '/admin'].some(path => location.pathname.toLowerCase().startsWith(path));
  const isMarqueeRoute = !['/login', '/profile', '/admin'].some(path => location.pathname.toLowerCase().startsWith(path));
  const hasActiveCoupons = getActiveCoupons().length > 0;
  const isMarqueeVisible = isMarqueeRoute && hasActiveCoupons && (deliverySettings.showMarquee !== false);

  return (
    <div className={`app-container ${isMarqueeVisible ? 'with-marquee' : ''}`}>
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      {isMarqueeVisible && <CouponMarquee />}
      <CartDrawer />
      <main className={isMarqueeVisible ? 'has-marquee-offset' : ''}>
        <Suspense fallback={<div className="loading-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clinic" element={<Clinic />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/polyclinic" element={<Polyclinic />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      {!hideFooter && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}


export default App;
