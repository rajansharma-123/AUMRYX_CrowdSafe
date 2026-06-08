import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Plus, Phone, MapPin, Clock, X, Camera, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LostFound = () => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    report_type: 'lost',
    item_description_en: '',
    item_description_hi: '',
    location_en: '',
    location_hi: '',
    contact_number: '',
    reporter_name: '',
    photo_url: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/lost-found`);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('Please select an image file', 'कृपया एक छवि फ़ाइल चुनें'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('Image must be less than 5MB', 'छवि 5MB से कम होनी चाहिए'));
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        setPhotoPreview(base64);

        // Upload to server
        try {
          const response = await axios.post(`${API}/upload/photo`, {
            image_data: base64
          });
          setFormData(prev => ({ ...prev, photo_url: `${API}/photos/${response.data.photo_id}` }));
          toast.success(t('Photo uploaded!', 'फोटो अपलोड हो गई!'));
        } catch (error) {
          toast.error(t('Failed to upload photo', 'फोटो अपलोड करने में विफल'));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(t('Failed to process image', 'छवि प्रोसेस करने में विफल'));
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/lost-found`, formData);
      toast.success(t('Report submitted successfully!', 'रिपोर्ट सफलतापूर्वक जमा हो गई!'));
      setShowForm(false);
      setFormData({
        report_type: 'lost',
        item_description_en: '',
        item_description_hi: '',
        location_en: '',
        location_hi: '',
        contact_number: '',
        reporter_name: '',
        photo_url: ''
      });
      setPhotoPreview(null);
      fetchReports();
    } catch (error) {
      toast.error(t('Failed to submit report', 'रिपोर्ट जमा करने में विफल'));
    }
  };

  const filteredReports = reports.filter(r => 
    filter === 'all' || r.report_type === filter
  );

  return (
    <div className="min-h-screen pb-24" data-testid="lost-found-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">
            {t('Lost & Found', 'खोया-पाया')}
          </h1>
          <p className="text-[#4B5563]">
            {t(
              'Report lost items or help reunite found items with their owners',
              'खोई हुई वस्तुओं की रिपोर्ट करें या पाई हुई वस्तुओं को उनके मालिकों से मिलाने में मदद करें'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#FF9933] hover:bg-[#E68A2E]' : ''}
              data-testid="filter-all"
            >
              {t('All', 'सभी')}
            </Button>
            <Button
              variant={filter === 'lost' ? 'default' : 'outline'}
              onClick={() => setFilter('lost')}
              className={filter === 'lost' ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : ''}
              data-testid="filter-lost"
            >
              {t('Lost', 'खोया')}
            </Button>
            <Button
              variant={filter === 'found' ? 'default' : 'outline'}
              onClick={() => setFilter('found')}
              className={filter === 'found' ? 'bg-[#16A34A] hover:bg-[#15803D]' : ''}
              data-testid="filter-found"
            >
              {t('Found', 'पाया')}
            </Button>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#FF9933] hover:bg-[#E68A2E] ml-auto"
            data-testid="report-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('Report Item', 'वस्तु रिपोर्ट करें')}
          </Button>
        </div>

        {/* Report Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="report-form-modal">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    {t('Report Lost/Found Item', 'खोई/पाई वस्तु रिपोर्ट करें')}
                  </h2>
                  <button onClick={() => { setShowForm(false); setPhotoPreview(null); }}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Report Type', 'रिपोर्ट प्रकार')}
                    </label>
                    <Select
                      value={formData.report_type}
                      onValueChange={(value) => setFormData({...formData, report_type: value})}
                    >
                      <SelectTrigger data-testid="report-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">{t('Lost Item', 'खोई वस्तु')}</SelectItem>
                        <SelectItem value="found">{t('Found Item', 'पाई वस्तु')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Item Photo (Optional)', 'वस्तु की फोटो (वैकल्पिक)')}
                    </label>
                    <div className="mt-2">
                      {photoPreview ? (
                        <div className="relative">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => { setPhotoPreview(null); setFormData({...formData, photo_url: ''}); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full h-32 border-2 border-dashed border-[#FF9933]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#FF9933]/5 transition-colors"
                          data-testid="photo-upload-btn"
                        >
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-[#FF9933] animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-[#FF9933]" />
                              <span className="text-sm text-[#4B5563]">
                                {t('Tap to add photo', 'फोटो जोड़ने के लिए टैप करें')}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Item Description (English)', 'वस्तु विवरण (अंग्रेजी)')}
                    </label>
                    <Textarea
                      value={formData.item_description_en}
                      onChange={(e) => setFormData({...formData, item_description_en: e.target.value})}
                      placeholder="e.g., Blue backpack with laptop inside"
                      required
                      data-testid="description-en"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Item Description (Hindi)', 'वस्तु विवरण (हिंदी)')}
                    </label>
                    <Textarea
                      value={formData.item_description_hi}
                      onChange={(e) => setFormData({...formData, item_description_hi: e.target.value})}
                      placeholder="जैसे, लैपटॉप के साथ नीला बैग"
                      data-testid="description-hi"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#1F2937]">
                        {t('Location (English)', 'स्थान (अंग्रेजी)')}
                      </label>
                      <Input
                        value={formData.location_en}
                        onChange={(e) => setFormData({...formData, location_en: e.target.value})}
                        placeholder="Near Banke Bihari Temple"
                        required
                        data-testid="location-en"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1F2937]">
                        {t('Location (Hindi)', 'स्थान (हिंदी)')}
                      </label>
                      <Input
                        value={formData.location_hi}
                        onChange={(e) => setFormData({...formData, location_hi: e.target.value})}
                        placeholder="बांके बिहारी मंदिर के पास"
                        data-testid="location-hi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Your Name', 'आपका नाम')}
                    </label>
                    <Input
                      value={formData.reporter_name}
                      onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
                      placeholder="Enter your name"
                      required
                      data-testid="reporter-name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1F2937]">
                      {t('Contact Number', 'संपर्क नंबर')}
                    </label>
                    <Input
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      data-testid="contact-number"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#FF9933] hover:bg-[#E68A2E]" data-testid="submit-report">
                    {t('Submit Report', 'रिपोर्ट जमा करें')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-[#FF9933]/50 animate-pulse mb-4" />
            <p className="text-[#4B5563]">{t('Loading reports...', 'रिपोर्ट लोड हो रही हैं...')}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-[#FF9933]/50 mb-4" />
            <p className="text-[#4B5563]">{t('No reports found', 'कोई रिपोर्ट नहीं मिली')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.report_id} className="border-0 shadow-md overflow-hidden" data-testid={`report-${report.report_id}`}>
                <div className={`h-1 ${report.report_type === 'lost' ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}></div>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Photo */}
                    {report.photo_url && (
                      <div className="shrink-0">
                        <img 
                          src={report.photo_url} 
                          alt="Item" 
                          className="w-24 h-24 object-cover rounded-xl"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          report.report_type === 'lost' 
                            ? 'bg-[#DC2626]/10 text-[#DC2626]' 
                            : 'bg-[#16A34A]/10 text-[#16A34A]'
                        }`}>
                          {report.report_type === 'lost' ? t('LOST', 'खोया') : t('FOUND', 'पाया')}
                        </span>
                        <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-[#1F2937] font-medium mb-2">
                        {language === 'en' ? report.item_description_en : (report.item_description_hi || report.item_description_en)}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-[#4B5563]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#FF9933]" />
                          {language === 'en' ? report.location_en : (report.location_hi || report.location_en)}
                        </span>
                        <a href={`tel:${report.contact_number}`} className="flex items-center gap-1 text-[#FF9933]">
                          <Phone className="w-4 h-4" />
                          {report.contact_number}
                        </a>
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

export default LostFound;
