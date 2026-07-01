# HOS Tools Backend

هذا المستودع يحتوي على **الخلفية (Backend)** فقط لمنصة HOS Tools. تم تصميمه ليعمل على بيئة Node.js ومعد للنشر المباشر على Vercel.

## 🛠️ هيكل المشروع
*   `/api/index.js`: الملف الرئيسي الذي يحتوي على جميع نقاط النهاية (Endpoints).
*   `package.json`: يحتوي على التبعيات (Express, Axios, CORS).
*   `vercel.json`: إعدادات النشر على Vercel.

## 🔗 طريقة ربط الواجهة الأمامية (Frontend) بالباك اند

لربط أي واجهة أمامية بهذا الباك اند، يجب إرسال طلبات `POST` إلى الروابط التالية (بافتراض أنك رفعت الباك اند على Vercel):

### 1. استوديو المحادثة (Chat)
*   **Endpoint:** `/api/chat`
*   **Method:** `POST`
*   **Body (JSON):**
```json
{
  "messages": [{"role": "user", "content": "نص الرسالة هنا"}],
  "model": "mercury" 
}
```

### 2. استوديو الصور (Image)
*   **Endpoint:** `/api/image`
*   **Method:** `POST`
*   **Body (JSON):**
```json
{
  "prompt": "وصف الصورة هنا",
  "model": "nanobanana-pro",
  "size": "1:1"
}
```

### 3. استوديو الفيديو (Video)
*   **Endpoint:** `/api/video`
*   **Method:** `POST`
*   **Body (JSON):**
```json
{
  "prompt": "وصف الفيديو هنا",
  "model": "wan-pro",
  "size": "16:9"
}
```

## 🚀 كيفية التشغيل محلياً
1. قم بتحميل التبعيات: `npm install`
2. قم بتشغيل السيرفر: `node api/index.js`
3. سيكون السيرفر متاحاً على `http://localhost:3000`
