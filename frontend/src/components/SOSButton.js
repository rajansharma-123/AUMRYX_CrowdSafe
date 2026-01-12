import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

const SOSButton = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);

  const handlePressStart = () => {
    setPressing(true);
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    pressTimer.current = setTimeout(() => {
      navigate('/emergency');
    }, 2000);
  };

  const handlePressEnd = () => {
    setPressing(false);
    setProgress(0);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:bottom-8 md:right-8 md:left-auto md:translate-x-0">
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        data-testid="sos-floating-btn"
        className={`relative w-16 h-16 rounded-full bg-[#DC2626] text-white flex flex-col items-center justify-center shadow-lg transition-transform ${
          pressing ? 'scale-95' : 'sos-pulse hover:scale-105'
        }`}
        style={{
          background: pressing 
            ? `conic-gradient(#991B1B ${progress}%, #DC2626 ${progress}%)` 
            : '#DC2626'
        }}
      >
        <AlertTriangle className="w-6 h-6" />
        <span className="text-xs font-bold">{t('SOS', 'मदद')}</span>
      </button>
      {pressing && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-[#DC2626] font-medium whitespace-nowrap">
          {t('Hold 2s to activate', '2 सेकंड दबाए रखें')}
        </div>
      )}
    </div>
  );
};

export default SOSButton;
