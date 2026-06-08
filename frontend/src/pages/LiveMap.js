import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { Users, RefreshCw, Layers, X } from 'lucide-react';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const crowdIcons = {
  low: createIcon('#16A34A'),
  moderate: createIcon('#F59E0B'),
  high: createIcon('#DC2626'),
  extreme: createIcon('#7C2D12'),
};

const helpIcons = {
  police: createIcon('#2563EB'),
  hospital: createIcon('#DC2626'),
  fire: createIcon('#F97316'),
  water: createIcon('#0EA5E9'),
  toilet: createIcon('#8B5CF6'),
  parking: createIcon('#6B7280'),
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const LiveMap = () => {
  const { t, language } = useLanguage();
  const [safetyStatus, setSafetyStatus] = useState([]);
  const [helpLocations, setHelpLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayers, setActiveLayers] = useState(['crowd']);
  const [mapCenter, setMapCenter] = useState([27.5727, 77.6893]); // Vrindavan center

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, helpRes] = await Promise.all([
        axios.get(`${API}/safety-status`),
        axios.get(`${API}/help-locations`)
      ]);
      setSafetyStatus(statusRes.data);
      setHelpLocations(helpRes.data);
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const layerOptions = [
    { id: 'crowd', label: { en: 'Crowd Status', hi: 'भीड़ स्थिति' }, color: '#FF9933' },
    { id: 'police', label: { en: 'Police', hi: 'पुलिस' }, color: '#2563EB' },
    { id: 'hospital', label: { en: 'Medical', hi: 'चिकित्सा' }, color: '#DC2626' },
    { id: 'water', label: { en: 'Water', hi: 'पानी' }, color: '#0EA5E9' },
    { id: 'toilet', label: { en: 'Toilets', hi: 'शौचालय' }, color: '#8B5CF6' },
    { id: 'parking', label: { en: 'Parking', hi: 'पार्किंग' }, color: '#6B7280' },
  ];

  return (
    <div className="h-[calc(100vh-64px)] relative" data-testid="live-map-page">
      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        className="h-full w-full z-0"
        data-testid="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />

        {/* Crowd Status Markers */}
        {activeLayers.includes('crowd') && safetyStatus.map((status) => (
          <Marker
            key={status.status_id}
            position={[status.latitude, status.longitude]}
            icon={crowdIcons[status.crowd_level] || crowdIcons.moderate}
            eventHandlers={{
              click: () => setSelectedLocation({ type: 'crowd', data: status })
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{language === 'en' ? status.location_en : status.location_hi}</strong>
                <br />
                <StatusBadge crowdLevel={status.crowd_level} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Help Location Markers */}
        {helpLocations
          .filter(loc => activeLayers.includes(loc.type))
          .map((loc) => (
            <Marker
              key={loc.help_id}
              position={[loc.latitude, loc.longitude]}
              icon={helpIcons[loc.type] || helpIcons.police}
              eventHandlers={{
                click: () => setSelectedLocation({ type: 'help', data: loc })
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{language === 'en' ? loc.name_en : loc.name_hi}</strong>
                  {loc.phone && <><br />{loc.phone}</>}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-white text-[#1F2937] hover:bg-gray-100 shadow-lg"
          size="sm"
          data-testid="layers-btn"
        >
          <Layers className="w-4 h-4 mr-1" />
          {t('Layers', 'परतें')}
        </Button>

        {showLayers && (
          <Card className="absolute top-12 right-0 w-48 shadow-xl border-0" data-testid="layers-panel">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{t('Map Layers', 'मैप परतें')}</span>
                <button onClick={() => setShowLayers(false)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                {layerOptions.map((layer) => (
                  <label 
                    key={layer.id} 
                    className="flex items-center gap-2 cursor-pointer"
                    data-testid={`layer-${layer.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(layer.id)}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded border-gray-300"
                    />
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: layer.color }}
                    ></span>
                    <span className="text-sm">{t(layer.label.en, layer.label.hi)}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refresh Button */}
      <Button
        onClick={fetchData}
        className="absolute top-4 left-4 z-[1000] bg-white text-[#1F2937] hover:bg-gray-100 shadow-lg"
        size="sm"
        data-testid="refresh-map-btn"
      >
        <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        {t('Refresh', 'रिफ्रेश')}
      </Button>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000] shadow-xl border-0" data-testid="location-details">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                {selectedLocation.type === 'crowd' ? (
                  <>
                    <h3 className="font-bold text-[#1F2937]">
                      {language === 'en' ? selectedLocation.data.location_en : selectedLocation.data.location_hi}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-[#4B5563]" />
                      <StatusBadge crowdLevel={selectedLocation.data.crowd_level} />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      {t('Status:', 'स्थिति:')} {t(
                        selectedLocation.data.status === 'safe' ? 'Safe to visit' : 
                        selectedLocation.data.status === 'caution' ? 'Visit with caution' : 'Avoid if possible',
                        selectedLocation.data.status === 'safe' ? 'जाना सुरक्षित' : 
                        selectedLocation.data.status === 'caution' ? 'सावधानी से जाएं' : 'यदि संभव हो तो बचें'
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-[#1F2937]">
                      {language === 'en' ? selectedLocation.data.name_en : selectedLocation.data.name_hi}
                    </h3>
                    <p className="text-sm text-[#4B5563] mt-1">
                      {language === 'en' ? selectedLocation.data.address_en : selectedLocation.data.address_hi}
                    </p>
                    {selectedLocation.data.phone && (
                      <a 
                        href={`tel:${selectedLocation.data.phone}`}
                        className="inline-block mt-2 text-sm font-medium text-[#FF9933]"
                      >
                        📞 {selectedLocation.data.phone}
                      </a>
                    )}
                  </>
                )}
              </div>
              <button onClick={() => setSelectedLocation(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] shadow-lg border-0 hidden md:block" data-testid="map-legend">
        <CardContent className="p-3">
          <h4 className="text-xs font-semibold mb-2">{t('Crowd Levels', 'भीड़ स्तर')}</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#16A34A]"></div>
              {t('Low', 'कम')}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              {t('Moderate', 'मध्यम')}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#DC2626]"></div>
              {t('High', 'अधिक')}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#7C2D12]"></div>
              {t('Extreme', 'अत्यधिक')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMap;
