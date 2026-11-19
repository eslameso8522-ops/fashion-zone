'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ShieldCheck, Truck, RotateCcw, MessageCircle, Lock } from 'lucide-react';

interface SiteSettings {
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export default function Footer() {
  const clicksRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    whatsappNumber: '201000000000',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
  });

  // Fetch dynamic settings from database
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        window.location.href = '/admin/login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret Easter Egg: Click copyright 3 times consecutively to open Admin Login
  const handleCopyrightClick = () => {
    clicksRef.current += 1;
    const currentClicks = clicksRef.current;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (currentClicks >= 3) {
      clicksRef.current = 0;
      setHint('جاري توجيهك إلى لوحة تحكم الآدمن 🚀...');
      window.location.href = '/admin';
      return;
    }

    if (currentClicks >= 1) {
      setHint(`اضغطي ${3 - currentClicks} مرات إضافية للدخول للوحة التحكم 🔒`);
    }

    // Reset after 3 seconds of no clicking
    clickTimerRef.current = setTimeout(() => {
      clicksRef.current = 0;
      setHint(null);
    }, 3000);
  };

  return (
    <footer className="bg-gradient-to-b from-white via-pink-50/40 to-pink-100/60 border-t border-pink-100 pt-14 pb-8 text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features highlight row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-pink-200/60">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-800">شحن سريع ومجاني</h4>
              <p className="text-xs text-stone-500 mt-0.5">توصيل لباب بيتك لجميع المحافظات</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-800">معاينة واستبدال سهل</h4>
              <p className="text-xs text-stone-500 mt-0.5">حق المعاينة قبل الاستلام واستبدال خلال 14 يوماً</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-800">ضمان الجودة والفخامة</h4>
              <p className="text-xs text-stone-500 mt-0.5">خامات ممتازة وأصلية 100%</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xl font-black bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent font-serif">
                Fashion Zone
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              وجهتكِ الأولى لأرقى ملابس الشتاء، الهوم وير والبيجامات القطيفة الهايدي، ترينجات وسوت خروج ميلتون، ملابس الأطفال والشبابي، والجواكت المستوردة بأسعار حنينة وخامات أصلية.
            </p>
            
            {/* Dynamic Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:scale-110 transition"
                title="واتساب المتجر"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {/* Facebook */}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm hover:scale-110 transition"
                  title="صفحتنا على فيسبوك"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm hover:scale-110 transition"
                  title="حسابنا على إنستغرام"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* TikTok */}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm hover:scale-110 transition"
                  title="حسابنا على تيك توك"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31 0 2.6.37 3.73 1.05.07.04.14.09.2.14.15.11.29.23.42.36.14.14.26.29.38.45.1.13.2.27.29.41.08.12.15.25.21.38.07.15.12.3.17.46.04.14.07.28.09.43.02.16.03.32.03.48v5.19c-.84-.28-1.72-.43-2.63-.43-2.4 0-4.57 1.09-6.04 2.82V.02h3.69zm-1.85 10.74c-.31-.05-.63-.08-.96-.08-3.32 0-6.01 2.69-6.01 6.01s2.69 6.01 6.01 6.01 6.01-2.69 6.01-6.01v-6.31c1.23.86 2.72 1.38 4.34 1.38v-3.7c-2.4 0-4.34-1.95-4.34-4.34V0h-3.69v13.56c-.4-.5-.91-.91-1.36-1.2v-1.6z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-stone-800 text-sm mb-3">أقسام المتجر</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/homewear-winter-pyjamas" className="hover:text-rose-600 transition">هوم وير وبيجامات شتوي</Link>
              </li>
              <li>
                <Link href="/category/winter-tracksuits-and-suits" className="hover:text-rose-600 transition">ترينجات وسوت خروج ميلتون</Link>
              </li>
              <li>
                <Link href="/category/kids-and-teens-winter" className="hover:text-rose-600 transition">ملابس أطفال وشبابي</Link>
              </li>
              <li>
                <Link href="/category/waterproof-winter-jackets" className="hover:text-rose-600 transition">جواكت ومعاطف ووتر بروف</Link>
              </li>
              <li>
                <Link href="/category/plus-size-winter-fashion" className="hover:text-rose-600 transition">مقاسات خاصة وبيج سايز</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="font-bold text-stone-800 text-sm mb-3">خدمة العملاء</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="text-rose-600 font-bold hover:underline flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>تتبع شحنتك وطلبك 🚚</span>
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-rose-600 transition">قائمة المفضلة</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-rose-600 transition">سلة التسوق</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-stone-500 hover:text-rose-600 font-bold hover:underline flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>دخول الإدارة (Admin)</span>
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 transition"
                >
                  تواصل عبر واتساب مباشر
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Discount */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 text-sm">اشتركي في نادي أناقة Fashion Zone</h4>
            <p className="text-xs text-stone-500">احصلي على كود خصم 10% فور اشتراكك لمتابعة جديد الفساتين والعروض الحصرية.</p>
            <div className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="بريدك الإلكتروني..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              />
              <button className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm flex-shrink-0">
                اشتراك
              </button>
            </div>
          </div>
        </div>

        {/* Secret Click Countdown Toast */}
        {hint && (
          <div className="mb-4 p-3 bg-pink-100/90 border border-pink-300 text-rose-800 text-xs rounded-xl text-center font-bold animate-pulse">
            {hint}
          </div>
        )}

        {/* Bottom Copyright & Direct Admin Access */}
        <div className="pt-8 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p
            onClick={handleCopyrightClick}
            className="cursor-pointer select-none hover:text-rose-600 transition py-1"
            title="انقري هنا 3 مرات للدخول للوحة التحكم 🔒"
          >
            © {new Date().getFullYear()} <strong>Fashion Zone</strong>. جميع الحقوق محفوظة بكل حب لصاحبات الذوق الرفيع.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="text-stone-600 hover:text-rose-600 font-semibold transition"
            >
              تتبع الطلبات
            </Link>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-stone-400 hover:text-rose-600 transition p-1"
              title="دخول مباشر للوحة التحكم"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
