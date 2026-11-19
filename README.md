# 🛍️ Fashion Zone - متجر الأزياء النسائية والجمال الراقي

متجر إلكتروني عصري ومتكامل بنكهة أنثوية فاخرة (Blush Pink & Rose Gold)، مبني بأحدث التقنيات السحابية ومصمم ليعمل **مجاناً 100% (Free Forever)** على منصة **Vercel**، متصل بقاعدة بيانات **MySQL** سحابية على **TiDB Cloud**، ونظام رفع وتخزين صور تلقائي فائق السرعة عبر **Cloudinary**.

---

## ✨ المميزات الرئيسية للمتجر

- 🌸 **تصميم بنّاتي عصري ومتجاوب 100%**: متوافق تماماً مع جميع الهواتف الذكية والأجهزة اللوحية وشاشات الكمبيوتر.
- 👗 **أقسام متكاملة**: فساتين سهرة، عبايات راقية، حقائب فاخرة، مجوهرات وإكسسوارات، وعطور فرنسية.
- 📸 **رفع تلقائي ومجاني للصور (Cloudinary)**: سحب وإفلات صور المنتجات ليتم ضغطها وتحويلها تلقائياً لصيغة WebP فائقة السرعة.
- 🗄️ **قاعدة بيانات MySQL حقيقية (TiDB Cloud)**: تخزين المنتجات والطلبات والتصنيفات عبر Prisma ORM باتصال مشفر SSL.
- 📲 **مشاركة اجتماعية فائقة لواتساب وفيسبوك**: بطاقات معاينة تفاعلية (Open Graph) تظهر صورة الفستان وسعره وتفاصيله عند المشاركة في الجروبات والشات.
- ⚡ **طلب فوري وسريع عبر واتساب**: رسائل تلقائية منسقة باسم المنتج والمقاس واللون والعنوان والدفع عند الاستلام.
- 🔍 **محرك بحث وتصفية حية (`/search`)**: بحث فوري في كافة تفاصيل وأقسام المنتجات.
- 🔒 **لوحة تحكم إدارية محمية (`/admin`)**:
  - نظام تسجيل دخول مشفر بكلمة مرور مشفرة بـ `bcryptjs`.
  - إدارة المخزون، إضافة المنتجات، وتعديل الأسعار والمقاسات.
  - متابعة الطلبات وتحديث حالات الشحن (قيد الانتظار ⏳ -> تم التأكيد 📞 -> تم الشحن 🚚 -> تم التوصيل ✅).
  - **ميزة الدخول السري (Easter Egg)**: النقر 5 مرات متتالية على حقوق النشر بالفوتر أو الضغط على `Ctrl + Shift + A`.
- 🚀 **أرشفة فورية لجوجل (SEO)**: خريطة موقع ديناميكية (`/sitemap.xml`)، وملف (`/robots.txt`)، وبيانات منظمة (`Schema.org / JSON-LD`).
- 📱 **تطبيق ويب تقدمي (PWA)**: إمكانية تثبيت المتجر كأيقونة تطبيق على الشاشة الرئيسية للهواتف.

---

## 🛠️ البنية التقنية (Tech Stack)

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: MySQL 8.0 via [TiDB Cloud Serverless](https://tidbcloud.com/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Image Storage & CDN**: [Cloudinary](https://cloudinary.com/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 النشر على Vercel (1-Click Deploy)

يمكنك نشر المتجر على Vercel مجاناً بضغطة زر واحدة:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feslameso8522-ops%2Ffashion-zone&env=DATABASE_URL,NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET,NEXT_PUBLIC_STORE_NAME,NEXT_PUBLIC_WHATSAPP_NUMBER)

### المتغيرات البيئية المطلوبة في Vercel:
```env
DATABASE_URL="mysql://2KytGbhmPgNgdBr.root:rfxToGmS1vXw8zVS@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="p4abpsol"
CLOUDINARY_API_KEY="199842741455217"
CLOUDINARY_API_SECRET="30NmDv_fK5TZHQqfSDtG4HJoTpw"
NEXT_PUBLIC_STORE_NAME="Fashion Zone"
NEXT_PUBLIC_WHATSAPP_NUMBER="201000000000"
```

---

## 🔑 بيانات دخول لوحة تحكم الآدمن الافتراضية

- **رابط تسجيل الدخول**: `/admin/login`
- **البريد الإلكتروني**: `admin@fashionzone.com`
- **كلمة المرور**: `admin123456`

---

© 2026 متجر **Fashion Zone** - صُنع بحب لأجمل بنوتة ✨
