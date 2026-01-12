import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import axios from 'axios';
import { 
  Phone, 
  AlertTriangle, 
  MapPin, 
  Ambulance, 
  Shield, 
  Flame,
  Share2,
  Loader2,
  Users,
  Plus,
  Trash2,
  Copy,
  QrCode,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Get or create device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('crowdsafe_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('crowdsafe_device_id', deviceId);
  }
  return deviceId;
};

const Emergency = () => {
  const { t, language } = useLanguage();
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [sendingSOS, setSendingSOS] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'family' });
  const [meetingCode, setMeetingCode] = useState('');
  const [meetingPoint, setMeetingPoint] = useState(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ name: '', description_en: '', description_hi: '' });

  const deviceId = getDeviceId();

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const response = await axios.get(`${API}/emergency-contacts/${deviceId}`);
      setEmergencyContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const emergencyServices = [
    {
      type: 'police',
      number: '100',
      label: { en: 'Police', hi: 'पुलिस' },
      icon: Shield,
      color: 'bg-[#2563EB]',
      description: { en: 'For security & law enforcement', hi: 'सुरक्षा और कानून प्रवर्तन के लिए' }
    },
    {
      type: 'ambulance',
      number: '102',
      label: { en: 'Ambulance', hi: 'एम्बुलेंस' },
      icon: Ambulance,
      color: 'bg-[#DC2626]',
      description: { en: 'Medical emergency', hi: 'चिकित्सा आपातकाल' }
    },
    {
      type: 'fire',
      number: '101',
      label: { en: 'Fire Brigade', hi: 'दमकल' },
      icon: Flame,
      color: 'bg-[#F97316]',
      description: { en: 'Fire emergency', hi: 'आग आपातकाल' }
    }
  ];

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleShareLocation = async () => {
    setSharing(true);
    try {
      const loc = await getLocation();
      setLocation(loc);
      
      const mapsUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
      
      if (navigator.share) {
        await navigator.share({
          title: t('My Location - Emergency', 'मेरा स्थान - आपातकाल'),
          text: t('I need help! Here is my location:', 'मुझे मदद चाहिए! यह मेरा स्थान है:'),
          url: mapsUrl
        });
      } else {
        await navigator.clipboard.writeText(mapsUrl);
        toast.success(t('Location copied to clipboard!', 'स्थान क्लिपबोर्ड पर कॉपी हो गया!'));
      }
    } catch (error) {
      toast.error(t('Could not get location', 'स्थान प्राप्त नहीं हो सका'));
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      let loc = location;
      if (!loc) {
        loc = await getLocation();
        setLocation(loc);
      }

      const mapsUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
      const message = encodeURIComponent(
        `🚨 ${t('EMERGENCY from Braj Holi!', 'ब्रज होली से आपातकाल!')}\n\n${t('I need help! My location:', 'मुझे मदद चाहिए! मेरा स्थान:')}\n${mapsUrl}`
      );

      // Open WhatsApp with pre-filled message
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } catch (error) {
      toast.error(t('Could not share via WhatsApp', 'WhatsApp से साझा नहीं हो सका'));
    }
  };

  const handleSOS = async (emergencyType) => {
    setSendingSOS(true);
    try {
      let loc = location;
      if (!loc) {
        try {
          loc = await getLocation();
          setLocation(loc);
        } catch (e) {
          // Continue without location
        }
      }

      // Get phone numbers of emergency contacts
      const contactPhones = emergencyContacts.map(c => c.phone);

      const response = await axios.post(`${API}/sos`, {
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        emergency_type: emergencyType,
        emergency_contacts: contactPhones
      });

      toast.success(t('SOS sent successfully!', 'SOS सफलतापूर्वक भेजा गया!'));
      
      // If there are WhatsApp links, show option to share
      if (response.data.whatsapp_links?.length > 0) {
        // Open first WhatsApp link
        window.open(response.data.whatsapp_links[0], '_blank');
      }
      
      // Trigger call
      window.location.href = `tel:${emergencyServices.find(c => c.type === emergencyType)?.number}`;
    } catch (error) {
      toast.error(t('Failed to send SOS', 'SOS भेजने में विफल'));
    } finally {
      setSendingSOS(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error(t('Please fill all fields', 'कृपया सभी फ़ील्ड भरें'));
      return;
    }

    try {
      await axios.post(`${API}/emergency-contacts`, {
        device_id: deviceId,
        ...newContact
      });
      toast.success(t('Contact added!', 'संपर्क जोड़ा गया!'));
      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relationship: 'family' });
      fetchEmergencyContacts();
    } catch (error) {
      toast.error(t('Failed to add contact', 'संपर्क जोड़ने में विफल'));
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await axios.delete(`${API}/emergency-contacts/${contactId}`);
      toast.success(t('Contact deleted', 'संपर्क हटाया गया'));
      fetchEmergencyContacts();
    } catch (error) {
      toast.error(t('Failed to delete contact', 'संपर्क हटाने में विफल'));
    }
  };

  const handleCreateMeetingPoint = async () => {
    if (!newMeeting.name) {
      toast.error(t('Please enter a name', 'कृपया नाम दर्ज करें'));
      return;
    }

    try {
      const loc = await getLocation();
      const response = await axios.post(`${API}/meeting-points`, {
        name: newMeeting.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        description_en: newMeeting.description_en || 'Meeting point',
        description_hi: newMeeting.description_hi || 'मिलन स्थल',
        created_by: deviceId,
        hours_valid: 24
      });

      setMeetingPoint(response.data);
      setShowCreateMeeting(false);
      toast.success(t('Meeting point created!', 'मिलन स्थल बनाया गया!'));
    } catch (error) {
      toast.error(t('Failed to create meeting point', 'मिलन स्थल बनाने में विफल'));
    }
  };

  const handleJoinMeetingPoint = async () => {
    if (!meetingCode) {
      toast.error(t('Please enter a code', 'कृपया कोड दर्ज करें'));
      return;
    }

    try {
      const response = await axios.get(`${API}/meeting-points/${meetingCode}`);
      setMeetingPoint(response.data);
      toast.success(t('Meeting point found!', 'मिलन स्थल मिला!'));
    } catch (error) {
      if (error.response?.status === 410) {
        toast.error(t('Meeting point expired', 'मिलन स्थल की समय सीमा समाप्त'));
      } else {
        toast.error(t('Meeting point not found', 'मिलन स्थल नहीं मिला'));
      }
    }
  };

  const copyMeetingCode = () => {
    if (meetingPoint?.share_code) {
      navigator.clipboard.writeText(meetingPoint.share_code);
      toast.success(t('Code copied!', 'कोड कॉपी हुआ!'));
    }
  };

  return (
    <div className="min-h-screen bg-[#DC2626]/5" data-testid="emergency-page">
      {/* Header */}
      <div className="bg-[#DC2626] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('Emergency Help', 'आपातकालीन मदद')}
          </h1>
          <p className="text-white/80">
            {t('Tap to call emergency services immediately', 'आपातकालीन सेवाओं को तुरंत कॉल करने के लिए टैप करें')}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="sos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="sos">{t('SOS', 'SOS')}</TabsTrigger>
            <TabsTrigger value="contacts">{t('Contacts', 'संपर्क')}</TabsTrigger>
            <TabsTrigger value="meeting">{t('Meeting Point', 'मिलन स्थल')}</TabsTrigger>
          </TabsList>

          {/* SOS Tab */}
          <TabsContent value="sos" className="space-y-6">
            {/* Share Location Buttons */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-4 space-y-3">
                <Button
                  onClick={handleShareLocation}
                  disabled={sharing}
                  className="w-full h-14 text-lg bg-[#FF9933] hover:bg-[#E68A2E] text-white"
                  data-testid="share-location-btn"
                >
                  {sharing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5 mr-2" />
                  )}
                  {t('Share My Location', 'मेरा स्थान साझा करें')}
                </Button>
                
                <Button
                  onClick={handleWhatsAppShare}
                  className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                  data-testid="whatsapp-share-btn"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('Share via WhatsApp', 'WhatsApp से साझा करें')}
                </Button>

                {location && (
                  <p className="text-xs text-center text-[#16A34A]">
                    ✓ {t('Location captured', 'स्थान कैप्चर किया गया')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1F2937]">
                {t('Emergency Services', 'आपातकालीन सेवाएं')}
              </h2>
              
              {emergencyServices.map((contact) => (
                <Card 
                  key={contact.type} 
                  className="border-0 shadow-lg overflow-hidden"
                  data-testid={`emergency-${contact.type}`}
                >
                  <CardContent className="p-0">
                    <button
                      onClick={() => handleSOS(contact.type)}
                      disabled={sendingSOS}
                      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors emergency-btn"
                    >
                      <div className={`${contact.color} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                        <contact.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-[#1F2937]">
                          {t(contact.label.en, contact.label.hi)}
                        </h3>
                        <p className="text-sm text-[#4B5563]">
                          {t(contact.description.en, contact.description.hi)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#1F2937]">{contact.number}</span>
                        <div className="flex items-center gap-1 text-[#FF9933]">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{t('Tap to call', 'कॉल करें')}</span>
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Numbers */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold text-[#1F2937] mb-3">
                  {t('Other Important Numbers', 'अन्य महत्वपूर्ण नंबर')}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <a href="tel:112" className="flex items-center gap-2 text-[#4B5563] hover:text-[#FF9933]">
                    <Phone className="w-4 h-4" />
                    112 - {t('Emergency', 'आपातकाल')}
                  </a>
                  <a href="tel:1091" className="flex items-center gap-2 text-[#4B5563] hover:text-[#FF9933]">
                    <Phone className="w-4 h-4" />
                    1091 - {t('Women', 'महिला')}
                  </a>
                  <a href="tel:1098" className="flex items-center gap-2 text-[#4B5563] hover:text-[#FF9933]">
                    <Phone className="w-4 h-4" />
                    1098 - {t('Child', 'बच्चे')}
                  </a>
                  <a href="tel:181" className="flex items-center gap-2 text-[#4B5563] hover:text-[#FF9933]">
                    <Phone className="w-4 h-4" />
                    181 - {t('Women Help', 'महिला मदद')}
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F2937]">
                {t('My Emergency Contacts', 'मेरे आपातकालीन संपर्क')}
              </h2>
              <Button
                onClick={() => setShowAddContact(true)}
                size="sm"
                className="bg-[#FF9933] hover:bg-[#E68A2E]"
                data-testid="add-contact-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('Add', 'जोड़ें')}
              </Button>
            </div>

            <p className="text-sm text-[#4B5563]">
              {t(
                'These contacts will be notified via WhatsApp when you send an SOS',
                'SOS भेजने पर इन संपर्कों को WhatsApp से सूचित किया जाएगा'
              )}
            </p>

            {emergencyContacts.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-4" />
                  <p className="text-[#4B5563]">
                    {t('No emergency contacts added yet', 'अभी तक कोई आपातकालीन संपर्क नहीं जोड़ा गया')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.contact_id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-[#1F2937]">{contact.name}</h4>
                          <p className="text-sm text-[#4B5563]">{contact.phone}</p>
                          <span className="text-xs bg-[#FF9933]/10 text-[#FF9933] px-2 py-0.5 rounded-full">
                            {contact.relationship}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.contact_id)}
                          className="text-[#DC2626]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Contact Modal */}
            {showAddContact && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold">{t('Add Emergency Contact', 'आपातकालीन संपर्क जोड़ें')}</h3>
                    <div>
                      <label className="text-sm font-medium">{t('Name', 'नाम')}</label>
                      <Input
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('Phone', 'फोन')}</label>
                      <Input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('Relationship', 'संबंध')}</label>
                      <Input
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                        placeholder="Family, Friend, etc."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowAddContact(false)} className="flex-1">
                        {t('Cancel', 'रद्द करें')}
                      </Button>
                      <Button onClick={handleAddContact} className="flex-1 bg-[#FF9933] hover:bg-[#E68A2E]">
                        {t('Add', 'जोड़ें')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Meeting Point Tab */}
          <TabsContent value="meeting" className="space-y-4">
            <p className="text-sm text-[#4B5563]">
              {t(
                'Set a meeting point for your family in case you get separated',
                'अलग होने की स्थिति में अपने परिवार के लिए मिलन स्थल सेट करें'
              )}
            </p>

            {meetingPoint ? (
              <Card className="border-0 shadow-lg bg-[#16A34A]/10 border border-[#16A34A]/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#1F2937]">{meetingPoint.name}</h3>
                      <p className="text-sm text-[#4B5563]">
                        {language === 'en' ? meetingPoint.description_en : meetingPoint.description_hi}
                      </p>
                    </div>
                    <MapPin className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl mb-3">
                    <QrCode className="w-5 h-5 text-[#FF9933]" />
                    <span className="text-2xl font-bold tracking-widest flex-1">{meetingPoint.share_code}</span>
                    <Button size="sm" variant="ghost" onClick={copyMeetingCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${meetingPoint.latitude},${meetingPoint.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#16A34A] hover:bg-[#15803D]">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('Open in Maps', 'मैप में खोलें')}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Join Meeting Point */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">{t('Join Meeting Point', 'मिलन स्थल में शामिल हों')}</h3>
                    <div className="flex gap-2">
                      <Input
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        maxLength={8}
                        className="text-center tracking-widest font-mono"
                      />
                      <Button onClick={handleJoinMeetingPoint} className="bg-[#FF9933] hover:bg-[#E68A2E]">
                        {t('Join', 'जुड़ें')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Meeting Point */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">{t('Create Meeting Point', 'मिलन स्थल बनाएं')}</h3>
                    {showCreateMeeting ? (
                      <div className="space-y-3">
                        <Input
                          value={newMeeting.name}
                          onChange={(e) => setNewMeeting({...newMeeting, name: e.target.value})}
                          placeholder="Meeting point name"
                        />
                        <Input
                          value={newMeeting.description_en}
                          onChange={(e) => setNewMeeting({...newMeeting, description_en: e.target.value})}
                          placeholder="Description (English)"
                        />
                        <Input
                          value={newMeeting.description_hi}
                          onChange={(e) => setNewMeeting({...newMeeting, description_hi: e.target.value})}
                          placeholder="विवरण (हिंदी)"
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowCreateMeeting(false)} className="flex-1">
                            {t('Cancel', 'रद्द करें')}
                          </Button>
                          <Button onClick={handleCreateMeetingPoint} className="flex-1 bg-[#FF9933] hover:bg-[#E68A2E]">
                            {t('Create', 'बनाएं')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setShowCreateMeeting(true)}
                        className="w-full bg-[#FF9933] hover:bg-[#E68A2E]"
                        data-testid="create-meeting-btn"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('Create at My Location', 'मेरे स्थान पर बनाएं')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Emergency;
