'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ShieldCheck, Truck, RotateCcw, MessageCircle, Lock } from 'lucide-react';

export default function Footer() {
  const clicksRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hint, setHint] = useState<string | null>(null);

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

  // Secret Easter Egg: Click copyright 5 times consecutively to open Admin Login
  const handleCopyrightClick = () => {
    clicksRef.current += 1;
    const currentClicks = clicksRef.current;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (currentClicks >= 5) {
      clicksRef.current = 0;
      setHint('جاري توجيهك إلى لوحة تحكم الآدمن 🚀...');
      window.location.href = '/admin/login';
      return;
    }

    if (currentClicks >= 2) {
      setHint(`اضغطي ${5 - currentClicks} مرات إضافية للدخول للوحة التحكم 🔒`);
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
              وجهتكِ الأولى للأناقة والجمال. نوفر أرقى تشكيلات الفساتين، العبايات، الحقائب، والمجوهرات المختارة بعناية لتناسب ذوق كل بنوتة عصرية.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:scale-105 transition"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition"
                title="فيسبوك"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition"
                title="إنستغرام"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-stone-800 text-sm mb-3">أقسام المتجر</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/dresses" className="hover:text-rose-600 transition">فساتين سهرة ومناسبات</Link>
              </li>
              <li>
                <Link href="/category/abayas" className="hover:text-rose-600 transition">عبايات وكيمونو راقي</Link>
              </li>
              <li>
                <Link href="/category/bags" className="hover:text-rose-600 transition">حقائب يد نسائية</Link>
              </li>
              <li>
                <Link href="/category/jewelry" className="hover:text-rose-600 transition">مجوهرات وأقراط زيركون</Link>
              </li>
              <li>
                <Link href="/category/perfumes" className="hover:text-rose-600 transition">عطور ومستحضرات تجميل</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="font-bold text-stone-800 text-sm mb-3">خدمة العملاء</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/wishlist" className="hover:text-rose-600 transition">قائمة المفضلة</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-rose-600 transition">سلة التسوق</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>دخول الإدارة (Admin)</span>
                </Link>
              </li>
              <li>
                <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 transition">
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
          <div className="flex justify-center my-3 animate-bounce">
            <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              <Lock className="w-3.5 h-3.5 text-pink-200" />
              <span>{hint}</span>
            </span>
          </div>
        )}

        {/* Bottom copyright (Click 5 times secretly to access Admin Login) */}
        <div className="pt-6 border-t border-pink-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <div className="flex items-center gap-3">
            <p
              onClick={handleCopyrightClick}
              className="cursor-pointer select-none transition-all py-1.5 px-3 rounded-xl hover:bg-pink-100/60 active:scale-95 text-stone-600 font-medium"
              title="Fashion Zone"
            >
              © {new Date().getFullYear()} متجر Fashion Zone - جميع الحقوق محفوظة.
            </p>
            <Link
              href="/admin/login"
              className="text-[11px] text-stone-400 hover:text-rose-600 font-semibold underline flex items-center gap-1 transition"
              title="تسجيل دخول الآدمن"
            >
              <Lock className="w-3 h-3" />
              <span>دخول الآدمن</span>
            </Link>
          </div>
          <p className="flex items-center gap-1">
            <span>صُنع بحب لأجمل بنوتة</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
