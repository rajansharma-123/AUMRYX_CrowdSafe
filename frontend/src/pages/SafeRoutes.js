import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  AlertTriangle, 
  MapPin,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const SafeRoutes = () => {
  const { t, language } = useLanguage();
  const [safetyStatus, setSafetyStatus] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, eventsRes] = await Promise.all([
        axios.get(`${API}/safety-status`),
        axios.get(`${API}/events/today`)
      ]);
      setSafetyStatus(statusRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate route suggestions based on current status and today's events
  const getRouteSuggestions = () => {
    const suggestions = [];
    
    // Check for high crowd areas
    const highCrowdAreas = safetyStatus.filter(s => 
      s.crowd_level === 'high' || s.crowd_level === 'extreme'
    );
    
    const safAreas = safetyStatus.filter(s => 
      s.crowd_level === 'low' || s.crowd_level === 'moderate'
    );

    if (highCrowdAreas.length > 0) {
      highCrowdAreas.forEach(area => {
        const safeAlternative = safAreas[0];
        suggestions.push({
          type: 'avoid',
          from: language === 'en' ? area.location_en : area.location_hi,
          message: {
            en: `${area.location_en} is crowded. ${safeAlternative ? `Consider visiting ${safeAlternative.location_en} instead.` : 'Plan visit for later.'}`,
            hi: `${area.location_hi} में भीड़ है। ${safeAlternative ? `इसके बजाय ${safeAlternative.location_hi} जाने पर विचार करें।` : 'बाद में जाने की योजना बनाएं।'}`
          }
        });
      });
    }

    // Add event-based suggestions
    events.forEach(event => {
      if (event.crowd_expectation === 'high' || event.crowd_expectation === 'extreme') {
        suggestions.push({
          type: 'caution',
          from: language === 'en' ? event.location_en : event.location_hi,
          message: {
            en: `${event.title_en} is happening at ${event.location_en}. Expect heavy crowds during ${event.time_en}.`,
            hi: `${event.title_hi} ${event.location_hi} में हो रहा है। ${event.time_hi} के दौरान भारी भीड़ की उम्मीद करें।`
          }
        });
      }
    });

    // Add safe route suggestions
    safAreas.forEach(area => {
      suggestions.push({
        type: 'safe',
        from: language === 'en' ? area.location_en : area.location_hi,
        message: {
          en: `${area.location_en} currently has low crowd. Good time to visit!`,
          hi: `${area.location_hi} में अभी कम भीड़ है। जाने का अच्छा समय!`
        }
      });
    });

    return suggestions;
  };

  const suggestions = getRouteSuggestions();

  return (
    <div className="min-h-screen pb-24" data-testid="safe-routes-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">
            {t('Safe Routes', 'सुरक्षित मार्ग')}
          </h1>
          <p className="text-[#4B5563]">
            {t(
              'Real-time route suggestions based on crowd conditions',
              'भीड़ की स्थिति के आधार पर वास्तविक समय के मार्ग सुझाव'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={loading}
            data-testid="refresh-routes"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh', 'रिफ्रेश')}
          </Button>
        </div>

        {/* Current Status Summary */}
        <Card className="border-0 shadow-lg mb-6 bg-white" data-testid="status-summary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1F2937]">
                {t('Current Status', 'वर्तमान स्थिति')}
              </h2>
              <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('Updated just now', 'अभी अपडेट हुआ')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {safetyStatus.slice(0, 4).map((status) => (
                <div 
                  key={status.status_id} 
                  className="flex items-center gap-2 p-2 rounded-xl bg-gray-50"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    status.crowd_level === 'low' ? 'bg-[#16A34A]' :
                    status.crowd_level === 'moderate' ? 'bg-[#F59E0B]' :
                    'bg-[#DC2626]'
                  }`}></div>
                  <span className="text-xs font-medium truncate">
                    {language === 'en' ? status.location_en : status.location_hi}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Route Suggestions */}
        <h2 className="text-lg font-bold text-[#1F2937] mb-4">
          {t('Route Suggestions', 'मार्ग सुझाव')}
        </h2>

        {suggestions.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <Navigation className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-4" />
              <p className="text-[#4B5563]">
                {t('All areas are safe to visit currently!', 'अभी सभी क्षेत्र सुरक्षित हैं!')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <Card 
                key={idx} 
                className={`border-0 shadow-md overflow-hidden ${
                  suggestion.type === 'avoid' ? 'route-avoid' :
                  suggestion.type === 'caution' ? 'route-caution' :
                  'route-safe'
                }`}
                data-testid={`suggestion-${idx}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      suggestion.type === 'avoid' ? 'bg-[#DC2626]/10' :
                      suggestion.type === 'caution' ? 'bg-[#F59E0B]/10' :
                      'bg-[#16A34A]/10'
                    }`}>
                      {suggestion.type === 'avoid' ? (
                        <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                      ) : suggestion.type === 'caution' ? (
                        <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                      ) : (
                        <Navigation className="w-5 h-5 text-[#16A34A]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[#FF9933]" />
                        <span className="font-semibold text-[#1F2937]">{suggestion.from}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          suggestion.type === 'avoid' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                          suggestion.type === 'caution' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                          'bg-[#16A34A]/10 text-[#16A34A]'
                        }`}>
                          {suggestion.type === 'avoid' ? t('Avoid', 'बचें') :
                           suggestion.type === 'caution' ? t('Caution', 'सावधान') :
                           t('Safe', 'सुरक्षित')}
                        </span>
                      </div>
                      <p className="text-sm text-[#4B5563]">
                        {t(suggestion.message.en, suggestion.message.hi)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Map CTA */}
        <Card className="border-0 shadow-lg mt-6 bg-[#FF9933]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1F2937]">
                  {t('View Live Crowd Map', 'लाइव भीड़ नक्शा देखें')}
                </h3>
                <p className="text-sm text-[#4B5563]">
                  {t('See real-time crowd levels on the map', 'नक्शे पर वास्तविक समय भीड़ स्तर देखें')}
                </p>
              </div>
              <Link to="/live-map">
                <Button className="bg-[#FF9933] hover:bg-[#E68A2E]" data-testid="view-map-btn">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('Open Map', 'नक्शा खोलें')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafeRoutes;
