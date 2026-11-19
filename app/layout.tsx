import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialProofToast from '@/components/SocialProofToast';
import PwaNotificationBanner from '@/components/PwaNotificationBanner';
import { MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'https://fashion-zone.vercel.app'),
  title: {
    default: 'Fashion Zone 👕👖👗 | متجر ملابس الشتاء، الهوم وير، والبيجامات وملابس الأطفال',
    template: '%s | Fashion Zone',
  },
  description: 'متجر Fashion Zone - أرقى صيحات كوليكشن شتاء 2026/2027: بيجامات قطيفة وهايدي وشين، ترينجات وسوت خروج ميلتون، ملابس أطفال وشبابي، وجواكت ووتر بروف مبطن فرو بأسعار مميزة وجودة مستوردة مع شحن سريع ومعاينة قبل الاستلام.',
  keywords: [
    'Fashion Zone',
    'فاشون زون',
    'بيجامات شتوي',
    'هوم وير حريمي',
    'قطيفة هايدي وشين',
    'ترينجات ميلتون',
    'سوت خروج قطعتين',
    'ملابس أطفال وشبابي',
    'جواكت ووتر بروف',
    'مقاسات خاصة وبيج سايز',
    'PEEKO FASHION',
    'MASSA HOME WEAR',
    'Moka brand',
    'ملابس شتوية مصر',
    'كوليكشن شتاء 2027',
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Fashion Zone 👕👖👗 | كوليكشن الشتاء، الهوم وير والملابس الشبابية',
    description: 'تسوقي أفضل عروض الشتاء: بيجامات قطيفة هايدي، ترينجات ميلتون، ملابس أطفال وجواكت ووتر بروف بأفضل الأسعار ومعاينة قبل الاستلام.',
    url: 'https://fashion-zone.vercel.app',
    siteName: 'Fashion Zone',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Fashion Zone Winter Collection Preview',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Zone 👕👖👗 | كوليكشن الشتاء والهوم وير',
    description: 'أرقى البيجامات القطيفة والترينجات وملابس الأطفال والجواكت المستوردة.',
    images: ['https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=1200&auto=format&fit=crop&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://fashion-zone.vercel.app/#organization',
        name: 'Fashion Zone 👕👖👗',
        url: 'https://fashion-zone.vercel.app',
        logo: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800',
        description: 'متجر Fashion Zone - أرقى صيحات كوليكشن شتاء 2026/2027: بيجامات قطيفة وهايدي، ترينجات ميلتون خروج، ملابس أطفال وشبابي، وجواكت ووتر بروف.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://fashion-zone.vercel.app/#website',
        url: 'https://fashion-zone.vercel.app',
        name: 'Fashion Zone',
        publisher: { '@id': 'https://fashion-zone.vercel.app/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://fashion-zone.vercel.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900">
        <CartProvider>
          <div>
            <AnnouncementBar />
            <Navbar />
            <main>{children}</main>
          </div>

          <Footer />

          {/* Social Proof Live Sales Toast */}
          <SocialProofToast />

          {/* PWA Smart Install Prompt & Push Notifications & Announcement Popup */}
          <PwaNotificationBanner />

          {/* Floating WhatsApp Action Button */}
          <aside aria-label="محادثة واتساب">
            <a
              href="https://wa.me/201000000000?text=مرحباً%20Fashion%20Zone%20أود%20الاستفسار%20عن%20منتجاتكم"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group"
              title="تحدثي معنا مباشرة على واتساب"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="absolute right-16 bg-white text-stone-800 text-xs font-bold py-1.5 px-3 rounded-xl shadow-md border border-pink-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                مساعدة واتساب فورية ✨
              </span>
            </a>
          </aside>
        </CartProvider>
      </body>
    </html>
  );
}
