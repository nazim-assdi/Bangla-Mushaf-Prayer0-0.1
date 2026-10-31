# বাংলা কুরআন ও নামাজের সময় (Bangla Mushaf & Prayer)

React + TypeScript + Vite ভিত্তিক ওয়েব অ্যাপ এবং PWA। এটি এখনো native Android Studio project নয়।

## কী কী আছে
- কুরআন পাঠ, অনুবাদ/তাফসির UI এবং অডিও
- মুসহাফ থেকে ১১৪টি সূরা (আরবি + বাংলা অনুবাদ) IndexedDB-তে অফলাইনে সংরক্ষণের সুবিধা
- নামাজের সময় ও জেলা/GPS নির্বাচন (ডিভাইসের স্থানীয় UTC offset ও Karachi calculation defaults)
- কিবলা: GPS coordinates ও supported device absolute-orientation sensor
- কিবলা দিক ও কম্পাস UI
- মাসনুন আযকার/তাসবিহ
- বুকমার্ক ও সর্বশেষ পড়ার স্থান
- Firebase Authentication/Firestore sync
- ঐচ্ছিক PostgreSQL API backend

## Windows-এ চালানো

প্রয়োজন: Node.js-এর LTS সংস্করণ, Git এবং একটি আধুনিক browser।

```powershell
git clone https://github.com/nazim-assdi/Bangla-Mushaf-Prayer0-0.1.git
cd Bangla-Mushaf-Prayer0-0.1
npm install
npm run dev
```

টার্মিনালে দেখানো local URL browser-এ খুলুন। Production build যাচাই:

```powershell
npm run lint
npm test
npm run build
npm run preview
```

## Firebase সেটআপ

1. Firebase project-এ Authentication থেকে Google provider enable করুন।
2. Firestore Database তৈরি করুন।
3. এই repository-র `firestore.rules` নিয়মগুলো আপনার Firebase project-এ review করে deploy করুন।
4. `firebase-applet-config.json`-এ নিজের Firebase Web App config ব্যবহার করুন।
5. Authorized domains-এ localhost এবং আপনার deployed domain যোগ করুন।

Firebase web config-এ API key থাকে; এটিকে server password বা service-account key ভাববেন না। কখনো Firebase Admin service-account private key, database password, signing key বা অন্য secret GitHub-এ commit করবেন না।

## ঐচ্ছিক PostgreSQL backend

এই repository-র Express API-তে PostgreSQL লাগে। PostgreSQL database তৈরি করে environment variables দিন:

- `SQL_HOST`
- `SQL_USER`
- `SQL_PASSWORD`
- `SQL_DB_NAME`

Schema-র জন্য Drizzle migration/configuration আলাদাভাবে প্রস্তুত ও চালাতে হবে। শুধু Firebase config দিলেই Cloud SQL/PostgreSQL sync চালু হবে না। Production-এ Node.js server চালাতে হবে; শুধু static Vite hosting-এ `/api/*` route কাজ করবে না।

Development server:

```powershell
npm run dev
```

Production build ও server (environment variables সেট করার পর):

```powershell
npm run build
npm start
```

## APK সম্পর্কে

এটি PWA/web app। Android APK তৈরি করতে আলাদা Capacitor/TWA packaging, Android build environment, app icon, signing এবং বাস্তব device testing লাগবে। APK বা Play Store release এখনো এই repository-তে প্রস্তুত বলে ধরে নেওয়া যাবে না।

## অফলাইন কুরআন

মুসহাফ স্ক্রিনের “সম্পূর্ণ কুরআন ডাউনলোড” ব্যবহার করে প্রথমবার ইন্টারনেট থাকা অবস্থায় ১১৪টি সূরার আরবি পাঠ ও বাংলা অনুবাদ ডিভাইসে IndexedDB-তে সংরক্ষণ করুন। প্রতিটি সূরার আয়াত সংখ্যা metadata-র সঙ্গে না মিললে সেটি সম্পূর্ণ হিসেবে গ্রহণ করা হবে না। তিলাওয়াতের অডিও এই ডাউনলোডের অন্তর্ভুক্ত নয়।

## গুরুত্বপূর্ণ যাচাই

- কুরআনের আরবি, অনুবাদ, উচ্চারণ ও তাফসির প্রকাশের আগে নির্ভরযোগ্য প্রকাশিত উৎসের সঙ্গে আয়াত-ভিত্তিক যাচাই করুন।
- নামাজের সময় গণনা পদ্ধতি, আসর (হানাফি/শাফিঈ), স্থানীয় মসজিদের সময় এবং GPS অনুমতি বাস্তবে পরীক্ষা করুন।
- কিবলা কম্পাসের ফল ফোনের absolute-orientation sensor, calibration, magnetic interference এবং browser support-এর ওপর নির্ভর করে।
- নতুন অ্যাকাউন্টে বুকমার্ক ফাঁকা থাকবে; পুরোনো local bookmarks account link করার সময় প্রথম sync-এ migrate হবে।
