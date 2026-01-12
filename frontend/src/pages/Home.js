import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Compass, 
  Clock, 
  Users,
  Bell,
  Search,
  HelpCircle,
  Shield
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const { t, language } = useLanguage();
  const [todayEvents, setTodayEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [safetyStatus, setSafetyStatus] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, highlightsRes, statusRes, alertsRes] = await Promise.all([
        axios.get(`${API}/events/today`),
        axios.get(`${API}/events/highlights`),
        axios.get(`${API}/safety-status`),
        axios.get(`${API}/alerts`)
      ]);
      setTodayEvents(eventsRes.data);
      setHighlights(highlightsRes.data);
      setSafetyStatus(statusRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { path: '/schedule', icon: Calendar, label: { en: 'Full Holi Schedule', hi: 'पूरा होली कार्यक्रम' }, color: 'bg-[#FF9933]' },
    { path: '/live-map', icon: MapPin, label: { en: 'Live Crowd Map', hi: 'लाइव भीड़ नक्शा' }, color: 'bg-[#2563EB]' },
    { path: '/emergency', icon: AlertTriangle, label: { en: 'Emergency Help', hi: 'आपातकालीन मदद' }, color: 'bg-[#DC2626]' },
    { path: '/visitor-guide', icon: Compass, label: { en: 'Travel & Visitor Guide', hi: 'यात्रा और आगंतुक गाइड' }, color: 'bg-[#16A34A]' },
  ];

  const getOverallStatus = () => {
    const highCount = safetyStatus.filter(s => s.crowd_level === 'high' || s.crowd_level === 'extreme').length;
    if (highCount > 2) return { status: 'caution', text: { en: 'High Crowd Areas', hi: 'अधिक भीड़ वाले क्षेत्र' } };
    if (highCount > 0) return { status: 'moderate', text: { en: 'Moderate Crowds', hi: 'मध्यम भीड़' } };
    return { status: 'safe', text: { en: 'All Areas Safe', hi: 'सभी क्षेत्र सुरक्षित' } };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen pb-24" data-testid="home-page">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 md:py-12"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1616787671803-e660b92c0d25?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBF0]/95 to-[#FFFBF0]/85"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-[#FF9933]" />
                <span className="text-sm font-medium text-[#FF9933]">
                  {t('Official Safety & Visitor Information Platform', 'आधिकारिक सुरक्षा और आगंतुक सूचना मंच')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-2">
                {t('Braj Holi 2026', 'ब्रज होली 2026')}
              </h1>
              <p className="text-[#4B5563] text-sm md:text-base max-w-xl">
                {t(
                  'Braj Holi is a multi-day celebration across Mathura, Vrindavan, Barsana & Nandgaon.',
                  'ब्रज होली मथुरा, वृंदावन, बरसाना और नंदगांव में कई दिनों तक मनाई जाती है।'
                )}
              </p>
            </div>

            {/* Live Safety Indicator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 min-w-[200px]" data-testid="safety-indicator">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full status-pulse ${
                    overallStatus.status === 'safe' ? 'bg-[#16A34A]' : 
                    overallStatus.status === 'moderate' ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                  }`}></div>
                  <span className="text-xs font-medium text-[#4B5563]">
                    {t('Live Safety Status', 'लाइव सुरक्षा स्थिति')}
                  </span>
                </div>
                <p className="font-semibold text-[#1F2937]">
                  {t(overallStatus.text.en, overallStatus.text.hi)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2" data-testid="alerts-section">
            {alerts.slice(0, 2).map((alert) => (
              <div 
                key={alert.alert_id}
                className={`flex items-start gap-3 p-4 rounded-2xl ${
                  alert.severity === 'danger' ? 'bg-[#DC2626]/10 border border-[#DC2626]/30' :
                  alert.severity === 'warning' ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30' :
                  'bg-[#2563EB]/10 border border-[#2563EB]/30'
                }`}
              >
                <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${
                  alert.severity === 'danger' ? 'text-[#DC2626]' :
                  alert.severity === 'warning' ? 'text-[#F59E0B]' :
                  'text-[#2563EB]'
                }`} />
                <div>
                  <h4 className="font-semibold text-[#1F2937]">
                    {language === 'en' ? alert.title_en : alert.title_hi}
                  </h4>
                  <p className="text-sm text-[#4B5563]">
                    {language === 'en' ? alert.message_en : alert.message_hi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Today's Key Events */}
        <section data-testid="todays-events-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937]">
              {t("Today's Key Events", 'आज के मुख्य कार्यक्रम')}
            </h2>
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="text-[#FF9933]">
                {t('View All', 'सभी देखें')} →
              </Button>
            </Link>
          </div>
          
          {todayEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {todayEvents.map((event) => (
                <Card key={event.event_id} className="card-hover border-0 shadow-md" data-testid={`event-card-${event.event_id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-[#1F2937]">
                        {language === 'en' ? event.title_en : event.title_hi}
                      </h3>
                      <StatusBadge crowdLevel={event.crowd_expectation} />
                    </div>
                    <div className="space-y-1 text-sm text-[#4B5563]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FF9933]" />
                        {language === 'en' ? event.location_en : event.location_hi}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#FF9933]" />
                        {language === 'en' ? event.time_en : event.time_hi}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-2" />
                <p className="text-[#4B5563]">
                  {t('No events scheduled for today', 'आज के लिए कोई कार्यक्रम निर्धारित नहीं है')}
                </p>
                <Link to="/schedule">
                  <Button className="mt-4 bg-[#FF9933] hover:bg-[#E68A2E]">
                    {t('View Full Schedule', 'पूर्ण कार्यक्रम देखें')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Quick Actions */}
        <section data-testid="quick-actions">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] mb-4">
            {t('Quick Actions', 'त्वरित कार्य')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path} data-testid={`quick-action-${action.path.replace('/', '')}`}>
                <Card className="card-hover border-0 shadow-md h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-3`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#1F2937]">
                      {t(action.label.en, action.label.hi)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Live Crowd Status */}
        <section data-testid="crowd-status-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937]">
              {t('Live Crowd Status', 'लाइव भीड़ स्थिति')}
            </h2>
            <Link to="/live-map">
              <Button variant="ghost" size="sm" className="text-[#FF9933]">
                {t('View Map', 'मैप देखें')} →
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {safetyStatus.map((status) => (
              <Card key={status.status_id} className="border-0 shadow-md" data-testid={`status-card-${status.status_id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        status.crowd_level === 'low' ? 'bg-[#16A34A]/10' :
                        status.crowd_level === 'moderate' ? 'bg-[#F59E0B]/10' :
                        'bg-[#DC2626]/10'
                      }`}>
                        <Users className={`w-5 h-5 ${
                          status.crowd_level === 'low' ? 'text-[#16A34A]' :
                          status.crowd_level === 'moderate' ? 'text-[#F59E0B]' :
                          'text-[#DC2626]'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1F2937]">
                          {language === 'en' ? status.location_en : status.location_hi}
                        </h4>
                        <p className="text-xs text-[#9CA3AF]">
                          {t('Updated just now', 'अभी अपडेट हुआ')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge crowdLevel={status.crowd_level} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming Highlights */}
        <section data-testid="highlights-section">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] mb-4">
            {t('Upcoming Highlights', 'आगामी मुख्य आकर्षण')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlights.slice(0, 6).map((event) => (
              <Card key={event.event_id} className="card-hover border-0 shadow-md overflow-hidden" data-testid={`highlight-${event.event_id}`}>
                <div className="h-2 bg-gradient-to-r from-[#FF9933] to-[#FFB700]"></div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium bg-[#FF9933]/10 text-[#FF9933] px-2 py-1 rounded-full">
                      {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <StatusBadge crowdLevel={event.crowd_expectation} size="sm" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] mb-1">
                    {language === 'en' ? event.title_en : event.title_hi}
                  </h3>
                  <p className="text-sm text-[#4B5563] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {language === 'en' ? event.location_en : event.location_hi}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* More Options */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] mb-4">
            {t('More Options', 'और विकल्प')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/lost-found">
              <Card className="card-hover border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <Search className="w-5 h-5 text-[#FF9933]" />
                  <span className="text-sm font-medium">{t('Lost & Found', 'खोया-पाया')}</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/help-near-me">
              <Card className="card-hover border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#FF9933]" />
                  <span className="text-sm font-medium">{t('Nearby Help', 'नज़दीकी मदद')}</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/faq">
              <Card className="card-hover border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-[#FF9933]" />
                  <span className="text-sm font-medium">{t('FAQs', 'सवाल-जवाब')}</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dos-donts">
              <Card className="card-hover border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#FF9933]" />
                  <span className="text-sm font-medium">{t('Safety Tips', 'सुरक्षा टिप्स')}</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
