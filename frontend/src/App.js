import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import SOSButton from './components/SOSButton';
import LiveStatusTicker from './components/LiveStatusTicker';

// Pages
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import LiveMap from './pages/LiveMap';
import VisitorGuide from './pages/VisitorGuide';
import SafeRoutes from './pages/SafeRoutes';
import Emergency from './pages/Emergency';
import LostFound from './pages/LostFound';
import HelpNearMe from './pages/HelpNearMe';
import Alerts from './pages/Alerts';
import FAQ from './pages/FAQ';
import DosDonts from './pages/DosDonts';
import Admin from './pages/Admin';
import Bookmarks from './pages/Bookmarks';

import './index.css';

// Register Service Worker for PWA
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('SW registered:', registration.scope);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEmergencyRoute = location.pathname === '/emergency';
  const isMapRoute = location.pathname === '/live-map';

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      {!isAdminRoute && <Header />}
      {!isAdminRoute && !isEmergencyRoute && !isMapRoute && <LiveStatusTicker />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/visitor-guide" element={<VisitorGuide />} />
          <Route path="/safe-routes" element={<SafeRoutes />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/help-near-me" element={<HelpNearMe />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/dos-donts" element={<DosDonts />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>
      </main>

      {!isAdminRoute && !isEmergencyRoute && <SOSButton />}
      <Toaster position="top-center" richColors />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
