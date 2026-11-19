'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

const NOTIFICATIONS = [
  { name: 'سارة م.', city: 'القاهرة', item: 'فستان حرير ناعم بلون الورد', time: 'منذ 3 دقائق' },
  { name: 'ندى ع.', city: 'الإسكندرية', item: 'حقيبة يد مبطنة بسلسلة روز جولد', time: 'منذ 7 دقائق' },
  { name: 'مريم ك.', city: 'المنصورة', item: 'عطر فرنسي فواح بالورد والفانيليا', time: 'منذ 12 دقيقة' },
  { name: 'فاطمة ز.', city: 'الجيزة', item: 'عباية كلاسيكية راقية بتطريز لؤلؤي', time: 'منذ 18 دقيقة' },
];

export default function SocialProofToast() {
  const [current, setCurrent] = useState<typeof NOTIFICATIONS[0] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show first toast after 4 seconds
    const initialTimer = setTimeout(() => {
      showRandomToast();
    }, 4000);

    // Loop interval
    const interval = setInterval(() => {
      showRandomToast();
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const showRandomToast = () => {
    const random = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setCurrent(random);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, 5500);
  };

  if (!visible || !current) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md border border-pink-200 rounded-2xl p-3 shadow-soft-pink animate-slideUp flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0 text-rose-500">
        <ShoppingBag className="w-5 h-5" />
      </div>
      <div className="text-xs">
        <p className="font-bold text-stone-800 flex items-center gap-1">
          <span>{current.name}</span>
          <span className="font-normal text-stone-500">من {current.city}</span>
          <Sparkles className="w-3 h-3 text-rose-400" />
        </p>
        <p className="text-stone-600 line-clamp-1 mt-0.5">
          اشترت <span className="font-semibold text-rose-600">{current.item}</span>
        </p>
        <span className="text-[10px] text-stone-400">{current.time}</span>
      </div>
    </div>
  );
}
