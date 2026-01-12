import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Check, X, Shield } from 'lucide-react';

const DosDonts = () => {
  const { t, language } = useLanguage();

  const dos = [
    { en: 'Wear old white clothes that you don\'t mind getting stained', hi: 'पुराने सफेद कपड़े पहनें जिन पर दाग लगने से आपको परेशानी न हो' },
    { en: 'Use organic/natural colors (gulal) when possible', hi: 'जब संभव हो तो जैविक/प्राकृतिक रंग (गुलाल) का उपयोग करें' },
    { en: 'Keep your phone in a waterproof pouch', hi: 'अपना फोन वाटरप्रूफ पाउच में रखें' },
    { en: 'Stay hydrated - drink plenty of water', hi: 'हाइड्रेटेड रहें - खूब पानी पिएं' },
    { en: 'Follow police and crowd management instructions', hi: 'पुलिस और भीड़ प्रबंधन निर्देशों का पालन करें' },
    { en: 'Travel in groups, especially if visiting for the first time', hi: 'समूहों में यात्रा करें, विशेषकर यदि पहली बार आ रहे हों' },
    { en: 'Apply coconut oil on skin and hair before playing', hi: 'खेलने से पहले त्वचा और बालों पर नारियल तेल लगाएं' },
    { en: 'Keep emergency contacts saved on your phone', hi: 'आपातकालीन संपर्क अपने फोन में सहेज कर रखें' },
    { en: 'Respect temple rules and remove footwear where required', hi: 'मंदिर के नियमों का सम्मान करें और जहां आवश्यक हो जूते उतारें' },
    { en: 'Book accommodation and transport in advance', hi: 'आवास और परिवहन पहले से बुक करें' },
    { en: 'Use the SOS feature if you need emergency help', hi: 'आपातकालीन मदद के लिए SOS सुविधा का उपयोग करें' },
    { en: 'Check live crowd status before visiting any location', hi: 'किसी भी स्थान पर जाने से पहले लाइव भीड़ स्थिति जांचें' }
  ];

  const donts = [
    { en: 'Don\'t throw colors at people who don\'t want to participate', hi: 'उन लोगों पर रंग न फेंकें जो भाग नहीं लेना चाहते' },
    { en: 'Don\'t use chemical or synthetic colors', hi: 'रासायनिक या सिंथेटिक रंगों का उपयोग न करें' },
    { en: 'Don\'t carry valuables or expensive jewelry', hi: 'कीमती सामान या महंगे आभूषण न ले जाएं' },
    { en: 'Don\'t consume bhang/thandai from unknown sources', hi: 'अज्ञात स्रोतों से भांग/ठंडाई का सेवन न करें' },
    { en: 'Don\'t get separated from your group in crowded areas', hi: 'भीड़भाड़ वाले क्षेत्रों में अपने समूह से अलग न हों' },
    { en: 'Don\'t argue or get into conflicts', hi: 'बहस न करें या झगड़े में न पड़ें' },
    { en: 'Don\'t block temple entrances or exits', hi: 'मंदिर के प्रवेश या निकास द्वार को अवरुद्ध न करें' },
    { en: 'Don\'t photograph people without permission', hi: 'बिना अनुमति के लोगों की फोटो न खींचें' },
    { en: 'Don\'t litter - use dustbins provided', hi: 'कूड़ा न फैलाएं - दिए गए डस्टबिन का उपयोग करें' },
    { en: 'Don\'t ignore safety advisories and crowd warnings', hi: 'सुरक्षा सलाह और भीड़ चेतावनियों को अनदेखा न करें' },
    { en: 'Don\'t drive in extremely crowded areas', hi: 'अत्यधिक भीड़भाड़ वाले क्षेत्रों में गाड़ी न चलाएं' },
    { en: 'Don\'t panic in crowded situations - stay calm', hi: 'भीड़ की स्थिति में घबराएं नहीं - शांत रहें' }
  ];

  return (
    <div className="min-h-screen pb-24" data-testid="dos-donts-page">
      {/* Header */}
      <div 
        className="relative py-8 px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1635247054850-88c9b1dab986?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBF0]/95 to-[#FFFBF0]/85"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#FF9933]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">
              {t('Safety Guidelines', 'सुरक्षा निर्देश')}
            </h1>
          </div>
          <p className="text-[#4B5563]">
            {t(
              'Important do\'s and don\'ts for a safe Braj Holi experience',
              'सुरक्षित ब्रज होली अनुभव के लिए महत्वपूर्ण क्या करें और क्या न करें'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Do's */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#16A34A]">
                {t("Do's", 'क्या करें')}
              </h2>
            </div>
            <div className="space-y-3">
              {dos.map((item, index) => (
                <Card key={index} className="border-0 shadow-sm bg-[#16A34A]/5" data-testid={`do-${index}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#1F2937]">
                        {t(item.en, item.hi)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Don'ts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#DC2626]">
                {t("Don'ts", 'क्या न करें')}
              </h2>
            </div>
            <div className="space-y-3">
              {donts.map((item, index) => (
                <Card key={index} className="border-0 shadow-sm bg-[#DC2626]/5" data-testid={`dont-${index}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#1F2937]">
                        {t(item.en, item.hi)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Reminder */}
        <Card className="border-0 shadow-lg mt-8 bg-[#DC2626]/10 border border-[#DC2626]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#DC2626]">
                  {t('Emergency? Use SOS!', 'आपातकाल? SOS का उपयोग करें!')}
                </h3>
                <p className="text-sm text-[#4B5563]">
                  {t(
                    'Press and hold the SOS button for 2 seconds to access emergency help',
                    'आपातकालीन मदद के लिए SOS बटन को 2 सेकंड तक दबाए रखें'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DosDonts;
