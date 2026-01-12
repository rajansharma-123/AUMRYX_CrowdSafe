import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { Bookmark, Calendar, MapPin, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getDeviceId = () => {
  let deviceId = localStorage.getItem('crowdsafe_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('crowdsafe_device_id', deviceId);
  }
  return deviceId;
};

const Bookmarks = () => {
  const { t, language } = useLanguage();
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const deviceId = getDeviceId();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks/${deviceId}`);
      setBookmarkedEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (eventId) => {
    try {
      await axios.delete(`${API}/bookmarks/${deviceId}/${eventId}`);
      toast.success(t('Bookmark removed', 'बुकमार्क हटाया गया'));
      fetchBookmarks();
    } catch (error) {
      toast.error(t('Failed to remove bookmark', 'बुकमार्क हटाने में विफल'));
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-24" data-testid="bookmarks-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-[#FF9933]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">
              {t('My Bookmarks', 'मेरे बुकमार्क')}
            </h1>
          </div>
          <p className="text-[#4B5563]">
            {t(
              'Events you\'ve saved for quick access',
              'त्वरित पहुंच के लिए आपके द्वारा सहेजे गए कार्यक्रम'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto text-[#FF9933]/50 animate-pulse mb-4" />
            <p className="text-[#4B5563]">{t('Loading bookmarks...', 'बुकमार्क लोड हो रहे हैं...')}</p>
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Bookmark className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-4" />
              <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                {t('No bookmarks yet', 'अभी तक कोई बुकमार्क नहीं')}
              </h3>
              <p className="text-[#4B5563] mb-4">
                {t(
                  'Save events from the schedule to access them quickly here',
                  'शेड्यूल से कार्यक्रम सहेजें और यहां जल्दी पहुंचें'
                )}
              </p>
              <Link to="/schedule">
                <Button className="bg-[#FF9933] hover:bg-[#E68A2E]">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('View Schedule', 'शेड्यूल देखें')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarkedEvents.map((event) => (
              <Card 
                key={event.event_id} 
                className="border-0 shadow-md overflow-hidden"
                data-testid={`bookmark-${event.event_id}`}
              >
                {event.is_highlight && (
                  <div className="h-1 bg-gradient-to-r from-[#FF9933] to-[#FFB700]"></div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium bg-[#FF9933]/10 text-[#FF9933] px-2 py-1 rounded-full">
                          {formatDate(event.date)}
                        </span>
                        <StatusBadge crowdLevel={event.crowd_expectation} size="sm" />
                      </div>
                      <h3 className="font-bold text-[#1F2937] text-lg">
                        {language === 'en' ? event.title_en : event.title_hi}
                      </h3>
                      <p className="text-sm text-[#4B5563] mt-1">
                        {language === 'en' ? event.description_en : event.description_hi}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(event.event_id)}
                      className="text-[#DC2626] shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <MapPin className="w-4 h-4 text-[#FF9933]" />
                      {language === 'en' ? event.location_en : event.location_hi}
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Clock className="w-4 h-4 text-[#FF9933]" />
                      {language === 'en' ? event.time_en : event.time_hi}
                    </div>
                  </div>

                  {/* Safety Advisory */}
                  <div className="mt-3 p-3 bg-[#F59E0B]/10 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-[#F59E0B]">
                          {t('Safety Advisory', 'सुरक्षा सलाह')}
                        </span>
                        <p className="text-sm text-[#4B5563]">
                          {language === 'en' ? event.safety_advisory_en : event.safety_advisory_hi}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
