import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: {
        en: 'Is Braj Holi safe for foreigners?',
        hi: 'क्या ब्रज होली विदेशी पर्यटकों के लिए सुरक्षित है?'
      },
      answer: {
        en: 'Yes, Braj Holi is generally safe for foreigners with proper precautions. Follow official advisories, stay in groups, respect local customs, and avoid isolated areas. The police presence is increased during the festival.',
        hi: 'हाँ, उचित सावधानियों के साथ ब्रज होली विदेशी पर्यटकों के लिए आम तौर पर सुरक्षित है। आधिकारिक सलाह का पालन करें, समूहों में रहें, स्थानीय रीति-रिवाजों का सम्मान करें, और एकांत क्षेत्रों से बचें।'
      }
    },
    {
      question: {
        en: 'What is Lathmar Holi?',
        hi: 'लठमार होली क्या है?'
      },
      answer: {
        en: 'Lathmar Holi is a unique tradition where women of Barsana playfully beat men from Nandgaon with sticks (lathis). It commemorates the legend of Krishna visiting Radha\'s village. Men protect themselves with shields while women chase them.',
        hi: 'लठमार होली एक अनोखी परंपरा है जहां बरसाना की महिलाएं नंदगांव के पुरुषों को लाठियों से मारती हैं। यह कृष्ण के राधा के गांव जाने की कथा की याद दिलाता है। पुरुष ढाल से खुद को बचाते हैं।'
      }
    },
    {
      question: {
        en: 'What colors should I use during Holi?',
        hi: 'होली के दौरान कौन से रंग इस्तेमाल करने चाहिए?'
      },
      answer: {
        en: 'Use organic, natural colors (gulal) whenever possible. Avoid synthetic colors with chemicals that can harm skin. Many shops near temples sell natural colors. Herbal colors made from flowers are the safest option.',
        hi: 'जब भी संभव हो, जैविक, प्राकृतिक रंग (गुलाल) का उपयोग करें। रासायनिक रंगों से बचें जो त्वचा को नुकसान पहुंचा सकते हैं। मंदिरों के पास कई दुकानें प्राकृतिक रंग बेचती हैं।'
      }
    },
    {
      question: {
        en: 'How crowded does it get during Holi?',
        hi: 'होली के दौरान कितनी भीड़ होती है?'
      },
      answer: {
        en: 'Extremely crowded, especially at Banke Bihari Temple and during Lathmar Holi. Expect lakhs of visitors. Plan to arrive early, follow crowd management instructions, and use our live crowd map feature.',
        hi: 'अत्यधिक भीड़, विशेषकर बांके बिहारी मंदिर में और लठमार होली के दौरान। लाखों आगंतुकों की उम्मीद करें। जल्दी पहुंचने की योजना बनाएं और भीड़ प्रबंधन निर्देशों का पालन करें।'
      }
    },
    {
      question: {
        en: 'What should I wear to Braj Holi?',
        hi: 'ब्रज होली में क्या पहनना चाहिए?'
      },
      answer: {
        en: 'Wear old white clothes (colors show beautifully on white), comfortable waterproof footwear, and keep valuables in waterproof bags. Avoid expensive jewelry or delicate fabrics.',
        hi: 'पुराने सफेद कपड़े पहनें (सफेद पर रंग खूबसूरत दिखते हैं), आरामदायक वाटरप्रूफ जूते, और कीमती सामान वाटरप्रूफ बैग में रखें। महंगे आभूषण या नाजुक कपड़ों से बचें।'
      }
    },
    {
      question: {
        en: 'Can I visit temples during Holi?',
        hi: 'क्या होली के दौरान मंदिर जा सकते हैं?'
      },
      answer: {
        en: 'Yes! Temples are the main centers of celebration. However, follow temple rules - remove footwear, dress modestly before entering inner sanctums. Some temples may restrict entry during peak hours.',
        hi: 'हाँ! मंदिर उत्सव के मुख्य केंद्र हैं। हालांकि, मंदिर के नियमों का पालन करें - जूते उतारें, गर्भगृह में प्रवेश से पहले शालीन कपड़े पहनें। कुछ मंदिर पीक आवर्स में प्रवेश प्रतिबंधित कर सकते हैं।'
      }
    },
    {
      question: {
        en: 'Is it safe to eat street food during Holi?',
        hi: 'क्या होली के दौरान स्ट्रीट फूड खाना सुरक्षित है?'
      },
      answer: {
        en: 'Exercise caution with street food. Eat from busy stalls with fresh preparation. Try traditional Holi treats like gujiya, thandai, and malpua from reputed shops. Stay hydrated with bottled water.',
        hi: 'स्ट्रीट फूड के साथ सावधानी बरतें। ताज़े तैयार भोजन वाले व्यस्त स्टॉल से खाएं। प्रतिष्ठित दुकानों से गुजिया, ठंडाई और मालपुआ जैसी होली की पारंपरिक मिठाइयां आज़माएं।'
      }
    },
    {
      question: {
        en: 'How do I get to Braj region?',
        hi: 'ब्रज क्षेत्र कैसे पहुंचें?'
      },
      answer: {
        en: 'Mathura Junction is the main railway station (2-3 hours from Delhi). By road, Mathura is on NH-2 (160 km from Delhi). Nearest airports are Agra (58 km) and Delhi (160 km). Book transport in advance during Holi.',
        hi: 'मथुरा जंक्शन मुख्य रेलवे स्टेशन है (दिल्ली से 2-3 घंटे)। सड़क मार्ग से, मथुरा NH-2 पर है (दिल्ली से 160 किमी)। निकटतम हवाई अड्डे आगरा (58 किमी) और दिल्ली (160 किमी) हैं।'
      }
    },
    {
      question: {
        en: 'What is the best time to visit each location?',
        hi: 'प्रत्येक स्थान पर जाने का सबसे अच्छा समय क्या है?'
      },
      answer: {
        en: 'Early morning (6-9 AM) is best to avoid peak crowds. Temple celebrations usually start after morning prayers. Check our schedule page for specific event timings and use the live crowd map for real-time updates.',
        hi: 'सुबह जल्दी (6-9 AM) भीड़ से बचने के लिए सबसे अच्छा है। मंदिर का उत्सव आमतौर पर सुबह की प्रार्थना के बाद शुरू होता है। विशिष्ट कार्यक्रम समय के लिए हमारा शेड्यूल पेज देखें।'
      }
    },
    {
      question: {
        en: 'What if I get separated from my group?',
        hi: 'अगर मैं अपने समूह से बिछड़ जाऊं तो क्या करूं?'
      },
      answer: {
        en: 'Stay calm. Use this app\'s SOS feature to share your location. Head to the nearest police booth (marked on our map). Keep emergency contacts saved. Set a meeting point with your group beforehand.',
        hi: 'शांत रहें। अपना स्थान साझा करने के लिए इस ऐप की SOS सुविधा का उपयोग करें। निकटतम पुलिस बूथ पर जाएं (हमारे मैप पर चिह्नित)। आपातकालीन संपर्क सहेज कर रखें।'
      }
    }
  ];

  return (
    <div className="min-h-screen pb-24" data-testid="faq-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF9933]/20 to-[#FFB700]/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-[#FF9933]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">
              {t('Frequently Asked Questions', 'अक्सर पूछे जाने वाले प्रश्न')}
            </h1>
          </div>
          <p className="text-[#4B5563]">
            {t(
              'Find answers to common questions about Braj Holi',
              'ब्रज होली के बारे में सामान्य प्रश्नों के उत्तर खोजें'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-md overflow-hidden"
              data-testid={`faq-${index}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-[#1F2937]">
                      {t(faq.question.en, faq.question.hi)}
                    </h3>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-[#FF9933] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#FF9933] shrink-0" />
                    )}
                  </div>
                  {openIndex === index && (
                    <p className="mt-3 text-[#4B5563] text-sm leading-relaxed">
                      {t(faq.answer.en, faq.answer.hi)}
                    </p>
                  )}
                </CardContent>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
