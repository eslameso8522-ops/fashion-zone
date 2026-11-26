'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, BellRing, Sparkles, X, Check, Copy, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerPushSubscription } from '@/lib/pushHelper';

interface SettingsData {
  announcementText?: string;
  announcementEnabled?: boolean;
  promoPopupTitle?: string;
  promoPopupText?: string;
  promoPopupImage?: string;
  promoCouponCode?: string;
  promoPopupEnabled?: boolean;
}

export default function PwaNotificationBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Fashion Zone SW registered successfully'))
        .catch((err) => console.log('SW registration note:', err));
    }

    // 2. Check Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // 3. Listen for PWA Install Prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('fz_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Fetch dynamic ads & promo popup settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (data.settings.promoPopupEnabled) {
            const promoDismissed = sessionStorage.getItem('fz_promo_dismissed');
            if (!promoDismissed) {
              // Friendly delay (2.5 seconds)
              setTimeout(() => setShowPromoPopup(true), 2500);
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Handle PWA Install click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('fz_install_dismissed', 'true');
  };

  // Handle Web Push Notifications
  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('المتصفح الحالي لا يدعم إشعارات الويب.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        confetti({ particleCount: 60, spread: 60 });
        
        // Register Push Subscription on Backend
        await registerPushSubscription('CUSTOMER');

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification('مرحباً بكِ في Fashion Zone ✨', {
              body: 'تم تفعيل إشعارات العروض بنجاح! ستصلكِ أحدث التشكيلات وكوبونات الخصم فور نزولها.',
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            });
          });
        }
      }
    } catch (err) {
      console.error('Error enabling notifications', err);
    }
  };

  // Copy coupon code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const dismissPromo = () => {
    setShowPromoPopup(false);
    sessionStorage.setItem('fz_promo_dismissed', 'true');
  };

  const couponCode = settings?.promoCouponCode || 'GIRL10';
  const promoTitle = settings?.promoPopupTitle || 'عرض خاص وحصري لكِ يا جميلة ✨';
  const promoText =
    settings?.promoPopupText ||
    'استخدمي كود الخصم الحصري للحصول على خصم إضافي 10% على جميع فساتين السهرة والعبايات والحقائب!';

  return (
    <>
      {/* 1. PWA Install Bottom Bar */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-pink-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-200">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900">تطبيق Fashion Zone على هاتفكِ</h4>
                <p className="text-[11px] text-stone-500">تصفح أسرع، بدون استهلاك باقة، وعروض فورية</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
              >
                تثبيت 📲
              </button>
              <button
                onClick={dismissInstall}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification Permission Floating Pill */}
      {notificationPermission === 'default' && (
        <div className="fixed bottom-24 left-4 z-40 hidden md:block animate-fadeIn">
          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-pink-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition group"
            title="تفعيل إشعارات العروض"
          >
            <BellRing className="w-4 h-4 text-rose-500 group-hover:rotate-12 transition-transform" />
            <span>تفعيل إشعارات الخصومات 🔔</span>
          </button>
        </div>
      )}

      {/* 3. Professional In-App Promo Modal (Managed from Admin Dashboard) */}
      {showPromoPopup && settings?.promoPopupEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-pink-100 relative animate-scaleUp">
            
            <button
              onClick={dismissPromo}
              className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md text-stone-500 hover:text-stone-900 p-1.5 rounded-full hover:bg-white shadow-sm transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Optional Ad Image uploaded by Admin */}
            {settings?.promoPopupImage ? (
              <div className="relative w-full h-44 bg-pink-100">
                <Image
                  src={settings.promoPopupImage}
                  alt={promoTitle}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 p-6 text-center text-white">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  هدية خاصة لكِ 🎁
                </span>
              </div>
            )}

            <div className="p-6 text-center space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-stone-900 font-serif">
                  {promoTitle}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {promoText}
                </p>
              </div>

              {/* Coupon Code Box */}
              <div className="bg-pink-50/90 p-3.5 rounded-2xl border border-dashed border-rose-300 flex items-center justify-between gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block font-semibold">كود الخصم الحصري:</span>
                  <span className="font-mono font-black text-base text-rose-600 tracking-wider">
                    {couponCode}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCoupon(couponCode)}
                  className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={dismissPromo}
                className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold py-3.5 rounded-2xl transition shadow-md"
              >
                تسوّقي التشكيلة الآن 🛍️
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
