import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  MapPin, 
  Phone, 
  Navigation,
  Shield,
  Ambulance,
  Flame,
  Droplets,
  Car,
  Loader2
} from 'lucide-react';

const HelpNearMe = () => {
  const { t, language } = useLanguage();
  const [helpLocations, setHelpLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const helpTypes = [
    { id: 'all', label: { en: 'All', hi: 'सभी' }, icon: MapPin },
    { id: 'police', label: { en: 'Police', hi: 'पुलिस' }, icon: Shield, color: '#2563EB' },
    { id: 'hospital', label: { en: 'Medical', hi: 'चिकित्सा' }, icon: Ambulance, color: '#DC2626' },
    { id: 'fire', label: { en: 'Fire', hi: 'दमकल' }, icon: Flame, color: '#F97316' },
    { id: 'water', label: { en: 'Water', hi: 'पानी' }, icon: Droplets, color: '#0EA5E9' },
    { id: 'toilet', label: { en: 'Toilet', hi: 'शौचालय' }, icon: MapPin, color: '#8B5CF6' },
    { id: 'parking', label: { en: 'Parking', hi: 'पार्किंग' }, icon: Car, color: '#6B7280' },
  ];

  useEffect(() => {
    fetchHelpLocations();
  }, []);

  const fetchHelpLocations = async () => {
    try {
      const response = await axios.get(`${API}/help-locations`);
      setHelpLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch help locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMyLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredLocations = helpLocations
    .filter(loc => selectedType === 'all' || loc.type === selectedType)
    .map(loc => ({
      ...loc,
      distance: userLocation 
        ? calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude)
        : null
    }))
    .sort((a, b) => {
      if (a.distance === null) return 0;
      return a.distance - b.distance;
    });

  const getIcon = (type) => {
    const found = helpTypes.find(t => t.id === type);
    return found ? found.icon : MapPin;
  };

  const getColor = (type) => {
    const found = helpTypes.find(t => t.id === type);
    return found?.color || '#FF9933';
  };

  return (
    <div className="min-h-screen pb-24" data-testid="help-near-me-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">
            {t('Nearby Help', 'नज़दीकी मदद')}
          </h1>
          <p className="text-[#4B5563]">
            {t(
              'Find police, medical facilities, water stations, and more near you',
              'अपने पास पुलिस, चिकित्सा सुविधाएं, पानी स्टेशन और बहुत कुछ खोजें'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Get Location Button */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1F2937]">
                  {userLocation 
                    ? t('Location Found', 'स्थान मिला') 
                    : t('Share Your Location', 'अपना स्थान साझा करें')
                  }
                </h3>
                <p className="text-sm text-[#4B5563]">
                  {userLocation
                    ? t('Showing nearest locations first', 'निकटतम स्थान पहले दिखा रहे हैं')
                    : t('To see distances and nearest help', 'दूरी और निकटतम मदद देखने के लिए')
                  }
                </p>
              </div>
              <Button
                onClick={getMyLocation}
                disabled={gettingLocation}
                className={`${userLocation ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#FF9933] hover:bg-[#E68A2E]'}`}
                data-testid="get-location-btn"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {userLocation ? t('Update Location', 'स्थान अपडेट करें') : t('Get Location', 'स्थान प्राप्त करें')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
          {helpTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? 'default' : 'outline'}
              onClick={() => setSelectedType(type.id)}
              className={`shrink-0 ${selectedType === type.id ? 'bg-[#FF9933] hover:bg-[#E68A2E]' : ''}`}
              data-testid={`filter-${type.id}`}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {t(type.label.en, type.label.hi)}
            </Button>
          ))}
        </div>

        {/* Locations List */}
        {loading ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-[#FF9933]/50 animate-pulse mb-4" />
            <p className="text-[#4B5563]">{t('Loading locations...', 'स्थान लोड हो रहे हैं...')}</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-4" />
            <p className="text-[#4B5563]">{t('No locations found', 'कोई स्थान नहीं मिला')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLocations.map((location) => {
              const Icon = getIcon(location.type);
              const color = getColor(location.type);
              
              return (
                <Card key={location.help_id} className="border-0 shadow-md" data-testid={`location-${location.help_id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-[#1F2937]">
                              {language === 'en' ? location.name_en : location.name_hi}
                            </h3>
                            <p className="text-sm text-[#4B5563] mt-1">
                              {language === 'en' ? location.address_en : location.address_hi}
                            </p>
                          </div>
                          {location.distance !== null && (
                            <span className="text-sm font-medium text-[#FF9933] whitespace-nowrap">
                              {location.distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3">
                          {location.phone && (
                            <a 
                              href={`tel:${location.phone}`}
                              className="flex items-center gap-1 text-sm text-[#FF9933] font-medium"
                            >
                              <Phone className="w-4 h-4" />
                              {location.phone}
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-[#2563EB] font-medium"
                          >
                            <Navigation className="w-4 h-4" />
                            {t('Directions', 'दिशा-निर्देश')}
                          </a>
                        </div>
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

export default HelpNearMe;
