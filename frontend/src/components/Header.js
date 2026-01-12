import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, AlertTriangle, Shield, Bookmark } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: { en: 'Home', hi: 'होम' } },
    { path: '/schedule', label: { en: 'Schedule', hi: 'कार्यक्रम' } },
    { path: '/live-map', label: { en: 'Live Map', hi: 'लाइव मैप' } },
    { path: '/visitor-guide', label: { en: 'Guide', hi: 'गाइड' } },
    { path: '/safe-routes', label: { en: 'Routes', hi: 'मार्ग' } },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#FF9933]/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
            <Shield className="w-8 h-8 text-[#FF9933]" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#1F2937] leading-tight">AUMRYX CrowdSafe</span>
              <span className="text-xs text-[#4B5563] leading-tight hidden sm:block">
                {t('Braj Holi Visitor & Safety Platform', 'ब्रज होली – आगंतुक एवं सुरक्षा मंच')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#FF9933] text-white'
                    : 'text-[#4B5563] hover:bg-[#FF9933]/10 hover:text-[#FF9933]'
                }`}
              >
                {t(item.label.en, item.label.hi)}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Bookmarks */}
            <Link to="/bookmarks" className="hidden sm:block" data-testid="header-bookmarks">
              <Button variant="ghost" size="sm" className="text-[#4B5563]">
                <Bookmark className="w-4 h-4" />
              </Button>
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center rounded-full border border-[#FF9933]/30 overflow-hidden"
            >
              <span className={`px-2 py-1 text-xs font-medium transition-colors ${language === 'en' ? 'lang-active' : 'lang-inactive'}`}>
                EN
              </span>
              <span className={`px-2 py-1 text-xs font-medium transition-colors ${language === 'hi' ? 'lang-active' : 'lang-inactive'}`}>
                हिं
              </span>
            </button>

            {/* Emergency Button */}
            <Link to="/emergency" data-testid="header-emergency-btn">
              <Button 
                variant="destructive" 
                size="sm"
                className="rounded-full bg-[#DC2626] hover:bg-[#B91C1C] gap-1"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('SOS', 'मदद')}</span>
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100" data-testid="mobile-nav">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#FF9933] text-white'
                      : 'text-[#4B5563] hover:bg-[#FF9933]/10'
                  }`}
                >
                  {t(item.label.en, item.label.hi)}
                </Link>
              ))}
              <Link
                to="/lost-found"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('Lost & Found', 'खोया-पाया')}
              </Link>
              <Link
                to="/help-near-me"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('Nearby Help', 'नज़दीकी मदद')}
              </Link>
              <Link
                to="/alerts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('Alerts', 'अलर्ट')}
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('FAQs', 'सवाल-जवाब')}
              </Link>
              <Link
                to="/dos-donts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('Safety Guidelines', 'सुरक्षा निर्देश')}
              </Link>
              <Link
                to="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#FF9933]/10"
              >
                {t('My Bookmarks', 'मेरे बुकमार्क')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
