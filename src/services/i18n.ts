export type UiLanguage = 'bn' | 'en' | 'ar' | 'hi' | 'ur' | 'tr';

export const UI_LANGUAGES: { code: UiLanguage; name: string; nativeName: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
];

const messages: Record<UiLanguage, Record<string, string>> = {
  bn: {
    home:'হোম', qibla:'কিবলা', salat:'সালাত', adhkar:'আযকার', planner:'প্ল্যানার', topicAyah:'বিষয়ভিত্তিক আয়াত', library:'লাইব্রেরি',
    settings:'সেটিংস', language:'অ্যাপের ভাষা', languageHelp:'অ্যাপের মেনু ও নিয়ন্ত্রণের ভাষা নির্বাচন করুন।', chooseLanguage:'আপনার ভাষা নির্বাচন করুন',
    welcome:'বিশ্বজুড়ে কুরআন পাঠকদের জন্য', continue:'শুরু করুন', offlineLibrary:'অফলাইন কুরআন লাইব্রেরি',
    support:'প্রকল্পে সহায়তা করুন', theme:'থিম', account:'অনলাইন অ্যাকাউন্ট', search:'অনুসন্ধান',
    salatTimes:'সালাতের সময়', bookmarks:'সংরক্ষিত আয়াত', appMenu:'অ্যাপ মেনু'
  },
  en: {
    home:'Home', qibla:'Qibla', salat:'Salat', adhkar:'Adhkar', planner:'Planner', topicAyah:'Topic Ayah', library:'Library',
    settings:'Settings', language:'App language', languageHelp:'Choose the language for app menus and controls.', chooseLanguage:'Choose your language',
    welcome:'For Quran readers around the world', continue:'Continue', offlineLibrary:'Offline Quran Library',
    support:'Support this project', theme:'Theme', account:'Online account', search:'Search',
    salatTimes:'Prayer times', bookmarks:'Saved verses', appMenu:'App menu'
  },
  ar: {
    home:'الرئيسية', qibla:'القبلة', salat:'الصلاة', adhkar:'الأذكار', planner:'المخطط', topicAyah:'آيات حسب الموضوع', library:'المكتبة',
    settings:'الإعدادات', language:'لغة التطبيق', languageHelp:'اختر لغة قوائم التطبيق وأدوات التحكم.', chooseLanguage:'اختر لغتك',
    welcome:'لقراء القرآن في جميع أنحاء العالم', continue:'متابعة', offlineLibrary:'مكتبة القرآن دون اتصال',
    support:'ادعم هذا المشروع', theme:'المظهر', account:'الحساب عبر الإنترنت', search:'بحث',
    salatTimes:'مواقيت الصلاة', bookmarks:'الآيات المحفوظة', appMenu:'قائمة التطبيق'
  },
  hi: {
    home:'होम', qibla:'क़िबला', salat:'नमाज़', adhkar:'अज़कार', planner:'योजना', topicAyah:'विषय अनुसार आयत', library:'लाइब्रेरी',
    settings:'सेटिंग्स', language:'ऐप की भाषा', languageHelp:'ऐप मेनू और नियंत्रण की भाषा चुनें।', chooseLanguage:'अपनी भाषा चुनें',
    welcome:'दुनिया भर के कुरआन पाठकों के लिए', continue:'जारी रखें', offlineLibrary:'ऑफ़लाइन कुरआन लाइब्रेरी',
    support:'इस परियोजना का समर्थन करें', theme:'थीम', account:'ऑनलाइन खाता', search:'खोजें',
    salatTimes:'नमाज़ का समय', bookmarks:'सहेजी गई आयतें', appMenu:'ऐप मेनू'
  },
  ur: {
    home:'ہوم', qibla:'قبلہ', salat:'نماز', adhkar:'اذکار', planner:'منصوبہ', topicAyah:'موضوع کے لحاظ سے آیات', library:'لائبریری',
    settings:'ترتیبات', language:'ایپ کی زبان', languageHelp:'ایپ کے مینو اور کنٹرول کی زبان منتخب کریں۔', chooseLanguage:'اپنی زبان منتخب کریں',
    welcome:'دنیا بھر کے قرآن پڑھنے والوں کے لیے', continue:'جاری رکھیں', offlineLibrary:'آف لائن قرآن لائبریری',
    support:'اس منصوبے کی معاونت کریں', theme:'تھیم', account:'آن لائن اکاؤنٹ', search:'تلاش',
    salatTimes:'نماز کے اوقات', bookmarks:'محفوظ آیات', appMenu:'ایپ مینو'
  },
  tr: {
    home:'Ana Sayfa', qibla:'Kıble', salat:'Namaz', adhkar:'Zikirler', planner:'Planlayıcı', topicAyah:'Konuya göre ayet', library:'Kütüphane',
    settings:'Ayarlar', language:'Uygulama dili', languageHelp:'Uygulama menüleri ve kontrolleri için dili seçin.', chooseLanguage:'Dilinizi seçin',
    welcome:'Dünyanın dört bir yanındaki Kur’an okuyucuları için', continue:'Devam et', offlineLibrary:'Çevrimdışı Kur’an Kitaplığı',
    support:'Bu projeyi destekleyin', theme:'Tema', account:'Çevrimiçi hesap', search:'Ara',
    salatTimes:'Namaz vakitleri', bookmarks:'Kaydedilen ayetler', appMenu:'Uygulama menüsü'
  }
};

export function translateUi(language: UiLanguage, key: string): string {
  return messages[language]?.[key] ?? messages.en[key] ?? key;
}
