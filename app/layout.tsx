import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialProofToast from '@/components/SocialProofToast';
import { MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'https://fashion-zone.vercel.app'),
  title: {
    default: 'Fashion Zone | متجر الأزياء النسائية والجمال الراقي',
    template: '%s | Fashion Zone',
  },
  description: 'متجر Fashion Zone - أرقى فساتين السهرة، العبايات، الحقائب الفاخرة، المجوهرات والعطور بأسعار مميزة وشحن سريع لجميع المحافظات.',
  keywords: ['Fashion Zone', 'فساتين سهرة', 'عبايات خليجية', 'حقائب نسائية', 'مجوهرات روز جولد', 'عطور نسائية', 'متجر بنات'],
  openGraph: {
    title: 'Fashion Zone | متجر الأزياء النسائية والجمال الراقي',
    description: 'تسوقي أحدث صيحات الموضة والفساتين الراقية بخصومات حصرية وتوصيل سريع لباب بيتك.',
    url: 'https://fashion-zone.vercel.app',
    siteName: 'Fashion Zone',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Fashion Zone Store Preview',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Zone | متجر الأزياء النسائية والجمال الراقي',
    description: 'أرقى فساتين السهرة والعبايات والحقائب والمجوهرات.',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
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
