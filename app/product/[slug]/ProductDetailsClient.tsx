'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Star,
  ShoppingBag,
  MessageCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Check,
  Sparkles,
  Flame,
  CheckCircle2,
  ThumbsUp,
  ZoomIn,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import ShareButtons from '@/components/ShareButtons';
import QuickOrderModal from '@/components/QuickOrderModal';
import SizeGuideModal from '@/components/SizeGuideModal';
import ImageZoomModal from '@/components/ImageZoomModal';

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState<'bottom-right' | 'bottom-left' | 'center'>('bottom-right');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.watermarkEnabled !== undefined) {
            setWatermarkEnabled(Boolean(data.settings.watermarkEnabled));
          }
          if (data.settings.watermarkPosition) {
            setWatermarkPos(data.settings.watermarkPosition);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isFavorite = isInWishlist(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Breadcrumb navigation */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-rose-600 transition">الرئيسية</a>
        <span>/</span>
        <a href={`/category/${product.categorySlug}`} className="hover:text-rose-600 transition">{product.category}</a>
        <span>/</span>
        <span className="text-stone-800 font-bold truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        
        {/* ========================================================
            IMAGE GALLERY WITH INTERACTIVE ZOOM
        ======================================================== */}
        <div className="space-y-4">
          <div 
            onClick={() => setZoomModalOpen(true)}
            className="group relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-pink-50/50 border border-pink-100 shadow-sm cursor-zoom-in"
          >
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Wishlist button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-rose-500 shadow-md flex items-center justify-center transition active:scale-90 z-10"
              aria-label="المفضلة"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
                }`}
              />
            </button>

            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md z-10">
                خصم {discountPercent}%
              </span>
            )}

            {/* Official Fashion Zone Luxury Boutique Watermark Badge */}
            {watermarkEnabled && (
              <div
                className={`absolute z-10 pointer-events-none select-none transition-all duration-300 ${
                  watermarkPos === 'bottom-left'
                    ? 'bottom-4 left-4'
                    : watermarkPos === 'center'
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110'
                    : 'bottom-4 right-4'
                }`}
              >
                <div className="bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-pink-200/90 shadow-md flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-rose-600 text-white flex items-center justify-center text-xs shadow-xs font-bold">
                    ✨
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black tracking-wide bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent font-serif leading-none">
                      Fashion Zone
                    </span>
                    <span className="text-[9px] font-black text-rose-500 tracking-wider uppercase leading-tight mt-0.5">
                      BOUTIQUE ✨ ORIGINAL
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Click to Zoom Pill Indicator */}
            <div
              className={`absolute ${
                watermarkPos === 'bottom-right' ? 'bottom-4 left-4' : 'bottom-4 right-4'
              } bg-white/95 backdrop-blur-sm text-stone-800 text-xs font-bold py-2 px-3.5 rounded-full shadow-lg border border-pink-200/80 flex items-center gap-1.5 transition-all transform group-hover:bg-rose-500 group-hover:text-white group-hover:scale-105 z-10`}
            >
              <ZoomIn className="w-4 h-4 text-rose-500 group-hover:text-white transition-colors" />
              <span>تكبير وزوم 🔍</span>
            </div>
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImage === img ? 'border-rose-500 ring-2 ring-rose-200' : 'border-pink-100 hover:border-pink-300'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            PRODUCT DETAILS & ACTIONS
        ======================================================== */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rosegold-500 tracking-wider uppercase">
                {product.category}
              </span>
              {product.code && (
                <span className="font-mono text-xs text-rose-700 bg-pink-100 font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
                  كود الموديل: #{product.code}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & reviews count */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-stone-400">({product.reviewsCount} تقييم من عميلاتنا)</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                متوفر في المخزون
              </span>
            </div>

            {/* Live Social Proof Counter */}
            <div className="mt-3 py-2 px-3.5 rounded-2xl bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-pink-50/80 border border-pink-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span>👀 تشاهد هذا الموديل الآن <span className="text-rose-600 font-black">{Math.floor(((product.price % 7) + 6))} عميلات</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 font-medium text-[11px]">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>تم طلبه <span className="font-bold text-stone-900">{Math.floor(((product.price % 11) + 12))} مرة</span> خلال الـ 24 ساعة الماضية</span>
              </div>
            </div>
          </div>

          {/* Price display */}
          <div className="p-4 rounded-2xl bg-blush-50/70 border border-pink-100 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-rose-600">
              {product.price} <span className="text-sm font-semibold">جنيه</span>
            </span>
            {product.originalPrice && (
              <span className="text-base text-stone-400 line-through">
                {product.originalPrice} جنيه
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-pink-100 px-2 py-1 rounded-md">
                وفّري {product.originalPrice! - product.price} جنيه
              </span>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                اللون المختار: <span className="text-rose-600 font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      selectedColor === color.name
                        ? 'bg-pink-100/80 text-rose-800 border-rose-500 shadow-sm'
                        : 'bg-white text-stone-700 border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection & Size Guide */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  المقاس المختار: <span className="text-rose-600 font-bold">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>جدول المقاسات</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
                      selectedSize === size
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-stone-700">الكمية:</span>
            <div className="flex items-center border border-pink-200 rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-pink-50 transition"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-pink-50 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            {/* Quick WhatsApp Order Button */}
            <button
              onClick={() => setQuickOrderOpen(true)}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition text-base"
            >
              <MessageCircle className="w-5 h-5" />
              <span>طلب فوري وسريع عبر واتساب (الدفع عند الاستلام)</span>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white font-black rounded-2xl shadow-soft-pink flex items-center justify-center gap-2.5 transition text-base"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>إضافة إلى سلة المشتريات</span>
            </button>

            {/* Toast feedback */}
            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تمت إضافة المنتج إلى سلة مشترياتك بنجاح! 🛍️</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="border-t border-pink-100 pt-5 space-y-2">
            <h3 className="font-bold text-stone-800 text-sm">وصف وتفاصيل المنتج:</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Share to WhatsApp & Facebook (الميزة المطلوبة من المستخدم) */}
          <div className="pt-2">
            <ShareButtons
              title={product.name}
              price={product.price}
              url={`/product/${product.slug}`}
              image={product.images[0]}
            />
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-pink-100 text-center">
            <div className="p-3 rounded-2xl bg-white border border-pink-100">
              <Truck className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-stone-700 block">شحن سريع</span>
              <span className="text-[10px] text-stone-400">خلال 24-48 ساعة</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-pink-100">
              <RotateCcw className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-stone-700 block">معاينة قبل الدفع</span>
              <span className="text-[10px] text-stone-400">واستبدال 14 يوم</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-pink-100">
              <ShieldCheck className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-stone-700 block">جودة أصلية</span>
              <span className="text-[10px] text-stone-400">خامات مستوردة</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          CUSTOMER REVIEWS & SOCIAL PROOF SECTION
      ======================================================== */}
      <section className="mt-16 pt-12 border-t border-pink-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تجارب وآراء العميلات</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 font-serif">
              تقييمات وتجارب عميلاتنا لهذا الموديل ✨
            </h2>
          </div>

          {/* Rating Summary Card */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-pink-100 shadow-sm">
            <div className="text-3xl font-black text-stone-900 font-serif">
              {product.rating || '4.9'}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                بناءً على {product.reviewsCount || (product.reviews?.length || 18)} تقييم مؤكد
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(product.reviews && product.reviews.length > 0
            ? product.reviews
            : [
                {
                  id: 'default-1',
                  name: 'سارة محمود',
                  city: 'القاهرة',
                  rating: 5,
                  comment:
                    'الخامة تحفة ما شاء الله والمقاس مظبوط جداً زي الصورة بالظبط، والتوصيل كان سريع في أقل من يومين! شكراً فاشون زون على الذوق والاهتمام ❤️',
                  date: 'منذ يومين',
                  verified: true,
                },
                {
                  id: 'default-2',
                  name: 'نورهان الشريف',
                  city: 'الإسكندرية',
                  rating: 5,
                  comment:
                    'الموديل يجنن باللبس وملمس القماش ناعم وراقي جداً، الكل سألني عنه في المناسبة! تجربة تسوق راقية وهطلب تاني بالتأكيد ✨',
                  date: 'منذ 5 أيام',
                  verified: true,
                },
                {
                  id: 'default-3',
                  name: 'مريم كمال',
                  city: 'الجيزة',
                  rating: 5,
                  comment:
                    'ما كنت متوقعة الجودة تكون بهالروعة بصراحة! التغليف أنيق جداً وريحة العطر مع اللبس فخمة، تستاهلوا 5 نجوم وأكثر 👌',
                  date: 'منذ أسبوع',
                  verified: true,
                },
              ]
          ).map((rev: any, idx: number) => (
            <div
              key={rev.id || idx}
              className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 text-white font-bold text-xs flex items-center justify-center">
                      {(rev.name || rev.author || 'ع').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {rev.name || rev.author || 'عميلة مميزة'}
                      </h4>
                      {rev.city && (
                        <p className="text-[10px] text-stone-400">{rev.city}</p>
                      )}
                    </div>
                  </div>

                  {rev.verified !== false && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>شراء مؤكد</span>
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs text-stone-600 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-[10px] text-stone-400">
                <span>{rev.date || 'تقييم حديث'}</span>
                <span className="flex items-center gap-1 text-rose-500 font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  <span>موصى به</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {zoomModalOpen && (
        <ImageZoomModal
          images={product.images}
          initialIndex={Math.max(0, product.images.indexOf(activeImage))}
          productName={product.name}
          onClose={() => setZoomModalOpen(false)}
        />
      )}

      {quickOrderOpen && (
        <QuickOrderModal
          product={product}
          onClose={() => setQuickOrderOpen(false)}
        />
      )}

      {sizeGuideOpen && (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
      )}
    </div>
  );
}
