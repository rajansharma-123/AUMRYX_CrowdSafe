import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { 
  Train, 
  Car, 
  Plane, 
  Hotel, 
  Shirt, 
  Smartphone,
  Heart,
  Users,
  Camera,
  Droplets
} from 'lucide-react';

const VisitorGuide = () => {
  const { t, language } = useLanguage();

  const sections = [
    {
      id: 'reach',
      title: { en: 'How to Reach Braj', hi: 'ब्रज कैसे पहुंचे' },
      icon: Train,
      items: [
        {
          icon: Train,
          title: { en: 'By Train', hi: 'ट्रेन द्वारा' },
          content: {
            en: 'Mathura Junction is the main railway station, well-connected to Delhi, Mumbai, Kolkata, and other major cities. From Delhi, trains take 2-3 hours.',
            hi: 'मथुरा जंक्शन मुख्य रेलवे स्टेशन है, जो दिल्ली, मुंबई, कोलकाता और अन्य प्रमुख शहरों से अच्छी तरह जुड़ा है। दिल्ली से ट्रेन में 2-3 घंटे लगते हैं।'
          }
        },
        {
          icon: Car,
          title: { en: 'By Road', hi: 'सड़क द्वारा' },
          content: {
            en: 'Mathura is on NH-2 (Delhi-Agra highway). Well-connected by bus services from Delhi (160 km), Agra (58 km), and Jaipur (240 km).',
            hi: 'मथुरा NH-2 (दिल्ली-आगरा राजमार्ग) पर है। दिल्ली (160 किमी), आगरा (58 किमी) और जयपुर (240 किमी) से बस सेवाओं द्वारा अच्छी तरह जुड़ा है।'
          }
        },
        {
          icon: Plane,
          title: { en: 'By Air', hi: 'हवाई जहाज द्वारा' },
          content: {
            en: 'Nearest airports: Agra Airport (58 km) and Delhi IGI Airport (160 km). From Delhi, you can hire a taxi or take a train.',
            hi: 'निकटतम हवाई अड्डे: आगरा हवाई अड्डा (58 किमी) और दिल्ली IGI हवाई अड्डा (160 किमी)। दिल्ली से आप टैक्सी किराए पर ले सकते हैं या ट्रेन ले सकते हैं।'
          }
        }
      ]
    },
    {
      id: 'stay',
      title: { en: 'Where to Stay', hi: 'कहां ठहरें' },
      icon: Hotel,
      items: [
        {
          icon: Hotel,
          title: { en: 'Mathura', hi: 'मथुरा' },
          content: {
            en: 'Wide range of hotels near railway station and Krishna Janmabhoomi. Budget to mid-range options available. Book in advance during Holi.',
            hi: 'रेलवे स्टेशन और कृष्ण जन्मभूमि के पास होटलों की विस्तृत श्रृंखला। बजट से मध्य-श्रेणी के विकल्प उपलब्ध। होली के दौरान अग्रिम बुकिंग करें।'
          }
        },
        {
          icon: Hotel,
          title: { en: 'Vrindavan', hi: 'वृंदावन' },
          content: {
            en: 'Dharamshalas, ashrams, and hotels available. Many temples offer accommodation. Peaceful atmosphere for spiritual seekers.',
            hi: 'धर्मशालाएं, आश्रम और होटल उपलब्ध। कई मंदिर आवास प्रदान करते हैं। आध्यात्मिक साधकों के लिए शांत वातावरण।'
          }
        },
        {
          icon: Hotel,
          title: { en: 'Nearby Areas', hi: 'आसपास के क्षेत्र' },
          content: {
            en: 'Agra (58 km) has more luxury options. Consider staying there and doing day trips to Braj region.',
            hi: 'आगरा (58 किमी) में अधिक लक्जरी विकल्प हैं। वहां रहने और ब्रज क्षेत्र में दिन की यात्राएं करने पर विचार करें।'
          }
        }
      ]
    },
    {
      id: 'wear',
      title: { en: 'What to Wear', hi: 'क्या पहनें' },
      icon: Shirt,
      items: [
        {
          icon: Shirt,
          title: { en: 'Clothing', hi: 'कपड़े' },
          content: {
            en: 'Wear old, white clothes that you don\'t mind getting stained. Avoid expensive or delicate fabrics. White shows colors beautifully!',
            hi: 'पुराने, सफेद कपड़े पहनें जिन पर दाग लगने से आपको कोई आपत्ति न हो। महंगे या नाजुक कपड़ों से बचें। सफेद पर रंग खूबसूरत दिखते हैं!'
          }
        },
        {
          icon: Droplets,
          title: { en: 'Footwear', hi: 'जूते-चप्पल' },
          content: {
            en: 'Wear comfortable, waterproof sandals or old sports shoes. Avoid flip-flops in crowded areas. Keep an extra pair.',
            hi: 'आरामदायक, वाटरप्रूफ सैंडल या पुराने स्पोर्ट्स शूज पहनें। भीड़भाड़ वाले इलाकों में चप्पल से बचें। एक अतिरिक्त जोड़ी रखें।'
          }
        },
        {
          icon: Smartphone,
          title: { en: 'Protect Electronics', hi: 'इलेक्ट्रॉनिक्स की सुरक्षा' },
          content: {
            en: 'Use waterproof phone covers or ziplock bags. Keep valuables in waterproof pouches. Consider leaving expensive gadgets at hotel.',
            hi: 'वाटरप्रूफ फोन कवर या जिपलॉक बैग का उपयोग करें। कीमती सामान वाटरप्रूफ पाउच में रखें। महंगे गैजेट्स होटल में छोड़ने पर विचार करें।'
          }
        }
      ]
    },
    {
      id: 'etiquette',
      title: { en: 'Cultural & Safety Etiquette', hi: 'सांस्कृतिक और सुरक्षा शिष्टाचार' },
      icon: Heart,
      items: [
        {
          icon: Heart,
          title: { en: 'Respect Local Customs', hi: 'स्थानीय रीति-रिवाजों का सम्मान करें' },
          content: {
            en: 'Braj Holi is a religious celebration. Respect temple rules, remove footwear, and dress modestly when visiting temples.',
            hi: 'ब्रज होली एक धार्मिक उत्सव है। मंदिर के नियमों का सम्मान करें, जूते उतारें, और मंदिरों में जाते समय शालीन कपड़े पहनें।'
          }
        },
        {
          icon: Users,
          title: { en: 'Play Responsibly', hi: 'जिम्मेदारी से खेलें' },
          content: {
            en: 'Don\'t throw colors at people who don\'t want to participate. Avoid aggressive behavior. Use organic colors when possible.',
            hi: 'उन लोगों पर रंग न फेंकें जो भाग नहीं लेना चाहते। आक्रामक व्यवहार से बचें। जब संभव हो तो जैविक रंगों का उपयोग करें।'
          }
        },
        {
          icon: Camera,
          title: { en: 'Photography', hi: 'फोटोग्राफी' },
          content: {
            en: 'Always ask permission before photographing locals or rituals. Some temples prohibit photography. Be respectful.',
            hi: 'स्थानीय लोगों या अनुष्ठानों की फोटो लेने से पहले हमेशा अनुमति लें। कुछ मंदिरों में फोटोग्राफी प्रतिबंधित है। सम्मानजनक बनें।'
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-24" data-testid="visitor-guide-page">
      {/* Header */}
      <div 
        className="relative bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1697982837148-25977e5f18bf?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBF0]/95 to-[#FFFBF0]/85"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">
            {t('Travel & Visitor Guide', 'यात्रा और आगंतुक गाइड')}
          </h1>
          <p className="text-[#4B5563]">
            {t(
              'Everything you need to know for a safe and memorable Braj Holi experience',
              'सुरक्षित और यादगार ब्रज होली अनुभव के लिए आपको जो कुछ भी जानने की आवश्यकता है'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {sections.map((section) => (
          <section key={section.id} data-testid={`section-${section.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF9933]/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-[#FF9933]" />
              </div>
              <h2 className="text-xl font-bold text-[#1F2937]">
                {t(section.title.en, section.title.hi)}
              </h2>
            </div>

            <div className="space-y-4">
              {section.items.map((item, idx) => (
                <Card key={idx} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF9933]/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-[#FF9933]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-1">
                          {t(item.title.en, item.title.hi)}
                        </h3>
                        <p className="text-sm text-[#4B5563]">
                          {t(item.content.en, item.content.hi)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default VisitorGuide;
