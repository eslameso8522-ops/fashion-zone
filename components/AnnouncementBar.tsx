'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<{
    announcementText?: string;
    announcementEnabled?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If disabled by Admin, don't display
  if (!loading && settings && !settings.announcementEnabled) {
    return null;
  }

  const announcementText =
    settings?.announcementText ||
    'تألقي مع تشكيلة Fashion Zone الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم إضافي: GIRL10';

  return (
    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-200 animate-pulse hidden sm:inline" />
        <span className="leading-tight">{announcementText}</span>
        <Sparkles className="w-4 h-4 text-pink-200 animate-pulse hidden sm:inline" />
      </div>
    </div>
  );
}
