import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LiveStatusTicker = () => {
  const { t, language } = useLanguage();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(`${API}/safety-status`);
      setStatuses(response.data);
    } catch (error) {
      console.error('Failed to fetch safety status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'text-[#16A34A]';
      case 'caution': return 'text-[#F59E0B]';
      case 'avoid': return 'text-[#DC2626]';
      default: return 'text-gray-500';
    }
  };

  const getCrowdIcon = (level) => {
    switch (level) {
      case 'low': return '🟢';
      case 'moderate': return '🟡';
      case 'high': return '🔴';
      case 'extreme': return '⚫';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FF9933]/10 border-b border-[#FF9933]/20 py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-sm text-[#FF9933]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          {t('Loading live status...', 'लाइव स्थिति लोड हो रही है...')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FF9933]/10 border-b border-[#FF9933]/20 py-2 overflow-hidden" data-testid="live-status-ticker">
      <div className="flex items-center gap-2 px-4">
        <div className="flex items-center gap-1 text-[#FF9933] shrink-0">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium status-pulse">
            {t('LIVE', 'लाइव')}
          </span>
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 text-sm whitespace-nowrap">
            {statuses.map((status) => (
              <div key={status.status_id} className="flex items-center gap-1">
                <span>{getCrowdIcon(status.crowd_level)}</span>
                <span className="font-medium">
                  {language === 'en' ? status.location_en : status.location_hi}
                </span>
                <span className={`text-xs ${getStatusColor(status.status)}`}>
                  ({t(status.status, status.status === 'safe' ? 'सुरक्षित' : status.status === 'caution' ? 'सावधान' : 'बचें')})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatusTicker;
