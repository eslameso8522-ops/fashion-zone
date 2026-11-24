'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag, MessageCircle, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import QuickOrderModal from './QuickOrderModal';

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const isFavorite = isInWishlist(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <div className="group bg-white rounded-3xl overflow-hidden border border-pink-100/80 shadow-sm hover:shadow-soft-pink hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-pink-50/50">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {discountPercent > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <span>خصم {discountPercent}%</span>
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-white/95 text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1 border border-pink-200">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>جديد</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-rose-500 shadow-sm flex items-center justify-center transition backdrop-blur-sm z-10 active:scale-90"
            aria-label="إضافة للمفضلة"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
              }`}
            />
          </button>

          {/* Fashion Zone Boutique Brandmark */}
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none select-none">
            <span className="bg-white/90 backdrop-blur-xs text-[10px] font-black tracking-tight text-stone-900 px-2 py-0.5 rounded-lg border border-pink-200/90 shadow-2xs flex items-center gap-1 font-serif">
              <span className="text-rose-500">✨</span>
              <span>Fashion Zone</span>
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs text-rosegold-500 font-semibold mb-1">
              <div className="flex items-center gap-1.5">
                <span>{product.category}</span>
                {product.code && (
                  <span className="font-mono text-[10px] text-rose-700 bg-pink-100/80 px-1.5 py-0.5 rounded font-bold border border-pink-200">
                    #{product.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
              </div>
            </div>

            <Link href={`/product/${product.slug}`} className="block group-hover:text-rose-600 transition-colors">
              <h3 className="font-bold text-stone-800 text-sm sm:text-base leading-snug line-clamp-1">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Pricing & Stock */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg sm:text-xl font-black text-rose-600">
              {product.price} <span className="text-xs font-semibold">جنيه</span>
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {product.originalPrice} جنيه
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-50">
            {/* Quick WhatsApp Order Button */}
            <button
              onClick={() => setQuickOrderOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-2 px-2.5 rounded-xl text-xs font-bold transition shadow-sm"
              title="طلب مباشر عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>طلب واتساب</span>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={() => addToCart(product, 1, product.sizes?.[0], product.colors?.[0]?.name)}
              className="flex items-center justify-center gap-1.5 bg-blush-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-pink-200 active:scale-95 py-2 px-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-sm"
              title="إضافة للسلة"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>للسلة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Order Modal */}
      {quickOrderOpen && (
        <QuickOrderModal
          product={product}
          onClose={() => setQuickOrderOpen(false)}
        />
      )}
    </>
  );
}
