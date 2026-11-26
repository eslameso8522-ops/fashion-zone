'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialProofToast from '@/components/SocialProofToast';
import PwaNotificationBanner from '@/components/PwaNotificationBanner';
import { MessageCircle } from 'lucide-react';

export default function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
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
    </>
  );
}
