import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const StatusBadge = ({ crowdLevel, size = 'sm' }) => {
  const { t } = useLanguage();

  const getLevelConfig = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-[#16A34A]',
          text: t('Low', 'कम'),
          icon: '🟢'
        };
      case 'moderate':
        return {
          bg: 'bg-[#F59E0B]',
          text: t('Moderate', 'मध्यम'),
          icon: '🟡'
        };
      case 'high':
        return {
          bg: 'bg-[#DC2626]',
          text: t('High', 'अधिक'),
          icon: '🔴'
        };
      case 'extreme':
        return {
          bg: 'bg-[#7C2D12]',
          text: t('Extreme', 'अत्यधिक'),
          icon: '⚫'
        };
      default:
        return {
          bg: 'bg-gray-400',
          text: t('Unknown', 'अज्ञात'),
          icon: '⚪'
        };
    }
  };

  const config = getLevelConfig(crowdLevel);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span 
      className={`${config.bg} ${sizeClasses} rounded-full text-white font-medium inline-flex items-center gap-1`}
      data-testid={`status-badge-${crowdLevel}`}
    >
      {config.text}
    </span>
  );
};

export default StatusBadge;
