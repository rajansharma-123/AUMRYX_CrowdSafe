import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Bell, AlertTriangle, Info, Clock } from 'lucide-react';
import { API } from '../lib/api';

const Alerts = () => {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'danger':
        return {
          bg: 'bg-[#DC2626]/10',
          border: 'border-[#DC2626]/30',
          icon: AlertTriangle,
          iconColor: 'text-[#DC2626]',
          label: { en: 'URGENT', hi: 'जरूरी' }
        };
      case 'warning':
        return {
          bg: 'bg-[#F59E0B]/10',
          border: 'border-[#F59E0B]/30',
          icon: AlertTriangle,
          iconColor: 'text-[#F59E0B]',
          label: { en: 'WARNING', hi: 'चेतावनी' }
        };
      default:
        return {
          bg: 'bg-[#2563EB]/10',
          border: 'border-[#2563EB]/30',
          icon: Info,
          iconColor: 'text-[#2563EB]',
          label: { en: 'INFO', hi: 'जानकारी' }
        };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return language === 'en' ? `${minutes}m ago` : `${minutes} मिनट पहले`;
    } else if (hours < 24) {
      return language === 'en' ? `${hours}h ago` : `${hours} घंटे पहले`;
    } else {
      return language === 'en' ? `${days}d ago` : `${days} दिन पहले`;
    }
  };

  return (
    <div className="min-h-screen pb-24" data-testid="alerts-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-[#FF9933]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">
              {t('Official Alerts', 'आधिकारिक अलर्ट')}
            </h1>
          </div>
          <p className="text-[#4B5563]">
            {t(
              'Stay updated with official announcements and safety alerts',
              'आधिकारिक घोषणाओं और सुरक्षा अलर्ट से अपडेट रहें'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-[#FF9933]/50 animate-pulse mb-4" />
            <p className="text-[#4B5563]">{t('Loading alerts...', 'अलर्ट लोड हो रहे हैं...')}</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-[#16A34A] mb-4" />
              <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                {t('All Clear!', 'सब सुरक्षित!')}
              </h3>
              <p className="text-[#4B5563]">
                {t(
                  'No active alerts at the moment. Enjoy the festival safely!',
                  'इस समय कोई सक्रिय अलर्ट नहीं है। त्योहार का सुरक्षित आनंद लें!'
                )}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;

              return (
                <Card 
                  key={alert.alert_id} 
                  className={`border ${config.border} ${config.bg} shadow-md`}
                  data-testid={`alert-${alert.alert_id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.iconColor} ${config.bg}`}>
                              {t(config.label.en, config.label.hi)}
                            </span>
                            <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(alert.created_at)}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-[#1F2937] text-lg mb-1">
                          {language === 'en' ? alert.title_en : alert.title_hi}
                        </h3>
                        <p className="text-[#4B5563]">
                          {language === 'en' ? alert.message_en : alert.message_hi}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
