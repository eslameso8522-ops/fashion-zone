'use client';

import React, { useState, useEffect } from 'react';
import { Download, Bell, BellRing, Sparkles, X, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsData {
  announcementText?: string;
  announcementEnabled?: boolean;
}

export default function PwaNotificationBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [promoText, setPromoText] = useState('');
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
      // Check if user previously dismissed install banner in this session
      const dismissed = sessionStorage.getItem('fz_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Fetch announcement and check for promo popup
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.announcementEnabled) {
          setPromoText(data.settings.announcementText || '');
          const promoDismissed = sessionStorage.getItem('fz_promo_dismissed');
          if (!promoDismissed) {
            // Show after 3 seconds for friendly experience
            setTimeout(() => setShowPromoPopup(true), 3000);
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

  // Dismiss Install Banner
  const dismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('fz_install_dismissed', 'true');
  };

  // Handle Request Notifications Permission
  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('المتصفح الحالي لا يدعم إشعارات الويب.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        confetti({ particleCount: 50, spread: 60 });
        // Send a friendly welcome test notification
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification('مرحباً بكِ في Fashion Zone ✨', {
              body: 'تم تفعيل إشعارات العروض بنجاح! سنرسل لكِ أحدث التشكيلات وكوبونات الخصم فور نزولها.',
              icon: '/icon.png',
              badge: '/icon.png',
            });
          });
        }
      }
    } catch (err) {
      console.error('Error enabling notifications', err);
    }
  };

  // Copy promo coupon code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const dismissPromo = () => {
    setShowPromoPopup(false);
    sessionStorage.setItem('fz_promo_dismissed', 'true');
  };

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
                <h4 className="font-bold text-xs sm:text-sm text-stone-900">تطبيق Fashion Zone على هاتفك</h4>
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

      {/* 2. Notification Permission Floating Pill (Shown if permission is still default) */}
      {notificationPermission === 'default' && (
        <div className="fixed bottom-24 left-4 z-40 hidden md:block animate-fadeIn">
          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-pink-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition group"
            title="تفعيل إشعارات العروض"
          >
            <BellRing className="w-4 h-4 text-rose-500 group-hover:rotate-12 transition-transform" />
            <span>تفعيل إشعارات الخصومات 🔔</span>
          </button>
        </div>
      )}

      {/* 3. In-App Announcement / Promo Modal */}
      {showPromoPopup && promoText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-pink-100 relative animate-scaleUp">
            <button
              onClick={dismissPromo}
              className="absolute top-4 left-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-pink-50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-300 text-white flex items-center justify-center shadow-lg shadow-pink-200">
              <Sparkles className="w-8 h-8 animate-spin-slow" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                عرض خاص وحصري ✨
              </span>
              <h3 className="text-lg font-black text-stone-900 pt-2 font-serif">
                مرحباً بكِ في Fashion Zone
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed pt-1">
                {promoText}
              </p>
            </div>

            {/* Coupon Code Action */}
            <div className="bg-pink-50/80 p-3 rounded-2xl border border-dashed border-rose-300 flex items-center justify-between gap-2">
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">كود الخصم الإضافي:</span>
                <span className="font-mono font-black text-sm text-rose-600 tracking-wider">GIRL10</span>
              </div>
              <button
                onClick={() => handleCopyCoupon('GIRL10')}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95 shadow-sm"
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
              className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold py-3 rounded-2xl transition shadow-md"
            >
              تسوقي العروض الآن 🛍️
            </button>
          </div>
        </div>
      )}
    </>
  );
}
