# SWVM - Music Player App
## React Native / Expo

---

## الملفات الموجودة

```
swvm/
├── App.jsx                          ← نقطة البداية
├── app.json                         ← إعدادات Expo + Android permissions
├── package.json                     ← المكتبات
├── babel.config.js                  ← إعدادات Babel
├── eas.json                         ← إعدادات البناء السحابي
├── service.js                       ← TrackPlayer background service
└── src/
    ├── constants/
    │   ├── themes.js                ← 5 ثيمات (purple/blue/green/red/rose)
    │   ├── i18n.js                  ← ترجمات (AR/EN/FR/ES)
    │   └── eqPresets.js             ← 10 ضبطات EQ
    ├── store/
    │   └── useStore.js              ← Zustand store (كل state التطبيق)
    ├── hooks/
    │   ├── useMediaLibrary.js       ← مسح ملفات الموسيقى (إذن حقيقي)
    │   └── useAudioPlayer.js        ← مشغل الصوت (background + notification)
    ├── components/
    │   ├── SongCard.jsx             ← بطاقة الأغنية
    │   └── MiniPlayer.jsx           ← المشغل الصغير
    ├── screens/
    │   ├── HomeScreen.jsx           ← الشاشة الرئيسية (tabs)
    │   ├── NowPlayingScreen.jsx     ← شاشة التشغيل
    │   ├── LyricsScreen.jsx         ← الكلمات
    │   ├── EqualizerScreen.jsx      ← الإيكوالايزر
    │   ├── SettingsScreen.jsx       ← الإعدادات
    │   ├── PlaytimeScreen.jsx       ← إحصائيات
    │   └── PermissionScreen.jsx     ← شاشة الأذونات
    └── utils/
        └── format.js                ← دوال التنسيق
```

---

## طريقة الرفع والبناء

### الخطوة 1: رفع على GitHub
1. اعمل repo جديد اسمه `swvm`
2. ارفع كل الملفات

### الخطوة 2: بناء APK بـ EAS Build (مجاني)
```bash
# على أي جهاز عنده Node.js:
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

**أو** استخدم GitHub Actions للبناء التلقائي (أضف workflow).

### الخطوة 3: تنزيل APK
بعد انتهاء البناء، EAS يعطيك رابط لتنزيل APK مباشرة.

---

## الميزات

### ✅ وصول حقيقي للملفات
- `expo-media-library` يطلب إذن Android حقيقي
- يمسح كل ملفات الموسيقى تلقائياً (MP3, FLAC, AAC, OGG...)
- لا يحتاج اليوزر يختار ملفات منفردة

### ✅ تشغيل في الخلفية
- `react-native-track-player` يشغل الموسيقى حتى لو التطبيق مقفول
- يظهر في notification bar مع أزرار التحكم
- أزرار الصوت الجانبية تشتغل

### ✅ الأداء
- FlatList مع `removeClippedSubviews` و `maxToRenderPerBatch`
- Zustand (أخف من Redux)
- Progress bar يتحدث كل 250ms فقط
- Reanimated للأنيميشن السلس (60fps حقيقي)

### ✅ الواجهة
- Dark theme مع 5 ألوان
- RTL كامل للعربية
- بطاقات مع shadow
- شريط تقدم قابل للسحب

---

## ملاحظات مهمة

1. **react-native-track-player**: يحتاج إضافة السطر في `index.js`:
```js
import TrackPlayer from 'react-native-track-player';
TrackPlayer.registerPlaybackService(() => require('./service'));
```

2. **أذونات Android 13+**: `READ_MEDIA_AUDIO` (موجود في app.json)

3. **EAS Build مجاني**: 30 build/شهر للـ free plan
