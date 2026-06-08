import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { Calendar, MapPin, Clock, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('crowdsafe_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('crowdsafe_device_id', deviceId);
  }
  return deviceId;
};

const Schedule = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const deviceId = getDeviceId();

  useEffect(() => {
    fetchEvents();
    fetchBookmarks();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks/${deviceId}`);
      const ids = new Set(response.data.map(e => e.event_id));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  const toggleBookmark = async (eventId) => {
    if (bookmarkedIds.has(eventId)) {
      // Remove bookmark
      try {
        await axios.delete(`${API}/bookmarks/${deviceId}/${eventId}`);
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.success(t('Bookmark removed', 'बुकमार्क हटाया गया'));
      } catch (error) {
        toast.error(t('Failed to remove bookmark', 'बुकमार्क हटाने में विफल'));
      }
    } else {
      // Add bookmark
      try {
        await axios.post(`${API}/bookmarks`, {
          device_id: deviceId,
          event_id: eventId
        });
        setBookmarkedIds(prev => new Set([...prev, eventId]));
        toast.success(t('Event bookmarked!', 'कार्यक्रम बुकमार्क किया गया!'));
      } catch (error) {
        toast.error(t('Failed to bookmark', 'बुकमार्क करने में विफल'));
      }
    }
  };

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  const dates = Object.keys(eventsByDate).sort();
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { weekday: 'long' }),
      date: date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  const isToday = (dateStr) => dateStr === today;
  const isPast = (dateStr) => new Date(dateStr) < new Date(today);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="schedule-loading">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto text-[#FF9933] animate-pulse mb-4" />
          <p className="text-[#4B5563]">{t('Loading schedule...', 'कार्यक्रम लोड हो रहा है...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" data-testid="schedule-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">
            {t('Complete Braj Holi Schedule', 'संपूर्ण ब्रज होली कार्यक्रम')}
          </h1>
          <p className="text-[#4B5563]">
            {t(
              'Plan your Braj Holi journey with our comprehensive event schedule',
              'हमारे व्यापक कार्यक्रम के साथ अपनी ब्रज होली यात्रा की योजना बनाएं'
            )}
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-[#FF9933]/20 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {dates.map((date) => {
              const { day } = formatDate(date);
              const dayNum = new Date(date).getDate();
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                  data-testid={`date-btn-${date}`}
                  className={`flex flex-col items-center px-4 py-2 rounded-xl shrink-0 transition-colors ${
                    selectedDate === date
                      ? 'bg-[#FF9933] text-white'
                      : isToday(date)
                      ? 'bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]'
                      : isPast(date)
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-[#4B5563] hover:bg-[#FF9933]/10'
                  }`}
                >
                  <span className="text-xs font-medium">{day.slice(0, 3)}</span>
                  <span className="text-lg font-bold">{dayNum}</span>
                  {isToday(date) && (
                    <span className="text-[10px] font-medium">
                      {t('TODAY', 'आज')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {dates
            .filter(date => !selectedDate || date === selectedDate)
            .map((date) => {
              const { day, date: formattedDate } = formatDate(date);
              const dayEvents = eventsByDate[date];

              return (
                <div key={date} className="relative" data-testid={`events-section-${date}`}>
                  {/* Date Header */}
                  <div className={`sticky top-32 z-30 flex items-center gap-4 mb-4 py-2 bg-[#FFFBF0] ${
                    isToday(date) ? '' : ''
                  }`}>
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${
                      isToday(date) ? 'bg-[#FF9933] text-white' : 'bg-white shadow-md text-[#1F2937]'
                    }`}>
                      <span className="text-xs font-medium">{day.slice(0, 3)}</span>
                      <span className="text-2xl font-bold">{new Date(date).getDate()}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1F2937]">
                        {day}
                        {isToday(date) && (
                          <span className="ml-2 text-xs font-medium bg-[#FF9933] text-white px-2 py-0.5 rounded-full">
                            {t('TODAY', 'आज')}
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-[#4B5563]">{formattedDate}</p>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="ml-8 pl-8 border-l-2 border-[#FF9933]/30 space-y-4">
                    {dayEvents.map((event, idx) => (
                      <Card 
                        key={event.event_id} 
                        className={`border-0 shadow-md overflow-hidden ${event.is_highlight ? 'ring-2 ring-[#FF9933]' : ''}`}
                        data-testid={`event-${event.event_id}`}
                      >
                        {event.is_highlight && (
                          <div className="h-1 bg-gradient-to-r from-[#FF9933] to-[#FFB700]"></div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-[#1F2937] text-lg">
                                {language === 'en' ? event.title_en : event.title_hi}
                              </h3>
                              <p className="text-sm text-[#4B5563] mt-1">
                                {language === 'en' ? event.description_en : event.description_hi}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge crowdLevel={event.crowd_expectation} />
                              <button
                                onClick={() => toggleBookmark(event.event_id)}
                                className={`p-2 rounded-full transition-colors ${
                                  bookmarkedIds.has(event.event_id)
                                    ? 'bg-[#FF9933] text-white'
                                    : 'bg-gray-100 text-[#4B5563] hover:bg-[#FF9933]/20'
                                }`}
                                data-testid={`bookmark-btn-${event.event_id}`}
                              >
                                {bookmarkedIds.has(event.event_id) ? (
                                  <BookmarkCheck className="w-4 h-4" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            </div>
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
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
