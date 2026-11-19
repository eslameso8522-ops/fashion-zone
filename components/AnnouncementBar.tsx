'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-200 animate-pulse hidden sm:inline" />
        <span>
          تألقي مع تشكيلة <strong>Fashion Zone</strong> الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم إضافي: <span className="bg-white/20 px-2 py-0.5 rounded font-bold">GIRL10</span>
        </span>
        <Sparkles className="w-4 h-4 text-pink-200 animate-pulse hidden sm:inline" />
      </div>
    </div>
  );
}
