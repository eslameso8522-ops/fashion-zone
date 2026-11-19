'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  price: number;
  url?: string;
  image?: string;
}

export default function ShareButtons({ title, price, url, image }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Get current window url if url prop is not provided or relative
  const shareUrl = typeof window !== 'undefined' ? (url ? `${window.location.origin}${url}` : window.location.href) : '';

  const shareText = `✨ شوفي المنتج الرائع ده من متجر Fashion Zone!
👗 *${title}*
💰 السعر: *${price} جنيه*
🔗 رابط المنتج: ${shareUrl}`;

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fashion Zone - ${title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-rose-500" />
          <span>مشاركة هذا المنتج مع صديقاتك أو الجروبات:</span>
        </span>
        {copied && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> تم نسخ الرابط بنجاح
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp Share Button */}
        <button
          onClick={shareToWhatsApp}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.184 0 5.77-2.587 5.77-5.766.001-3.184-2.585-5.766-5.77-5.766zm9.969 5.766c0 5.485-4.485 9.97-9.969 9.97-1.745 0-3.376-.46-4.801-1.258l-5.23 1.35 1.396-5.097c-.902-1.488-1.434-3.238-1.434-5.093 0-5.485 4.485-9.969 9.969-9.969 5.484 0 9.969 4.484 9.969 9.969z"/>
          </svg>
          <span>جروبات الواتساب</span>
        </button>

        {/* Facebook Share Button */}
        <button
          onClick={shareToFacebook}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
          </svg>
          <span>فيسبوك</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className="p-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-pink-200 rounded-xl transition"
          title="نسخ الرابط"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Native Mobile Share Button */}
        <button
          onClick={handleNativeShare}
          className="p-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-pink-200 rounded-xl transition sm:hidden"
          title="مشاركة عبر تطبيقات أخرى"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
