'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowLeft, Heart, ShoppingBag, ShieldCheck, Truck, Star } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'dresses' | 'featured' | 'sale'>('all');
  const [heroSettings, setHeroSettings] = useState({
    heroTitle: 'كوني الأجمل في كل إطلالة مع Fashion Zone',
    heroSubtitle: 'اكتشفي تشكيلة راقية ومختارة بعناية من فساتين السهرة الناعمة، العبايات المطرزة، الحقائب والمجوهرات التي تزيدكِ تألقاً وسحراً.',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
    heroBadgeText: 'أعلى تقييم ⭐ 4.9',
    heroBadgeSubtext: 'أزياء صيف 2026',
    heroCouponTitle: 'كود الخصم الفوري',
    heroCouponCode: 'GIRL10',
    heroCouponDiscount: 'خصم 10%',
    heroCtaText: 'تسوقي الآن / Shop Now',
    heroCtaLink: '#catalog',
    heroBannerTitle: 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!',
    heroBannerSubtitle: 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.',
    heroBannerBadge: 'عرض محدود لفترة وجيزة',
    heroBannerCtaText: 'تصفحي العروض الآن',
    heroBannerCtaLink: '#catalog',
    heroBannerImage: '',
    heroBannerEnabled: true,
  });

  // Fetch live products and hero settings from MySQL on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setHeroSettings((prev) => ({
            ...prev,
            heroTitle: data.settings.heroTitle || prev.heroTitle,
            heroSubtitle: data.settings.heroSubtitle || prev.heroSubtitle,
            heroImage: data.settings.heroImage || prev.heroImage,
            heroBadgeText: data.settings.heroBadgeText || prev.heroBadgeText,
            heroBadgeSubtext: data.settings.heroBadgeSubtext || prev.heroBadgeSubtext,
            heroCouponTitle: data.settings.heroCouponTitle || prev.heroCouponTitle,
            heroCouponCode: data.settings.heroCouponCode || prev.heroCouponCode,
            heroCouponDiscount: data.settings.heroCouponDiscount || prev.heroCouponDiscount,
            heroCtaText: data.settings.heroCtaText || prev.heroCtaText,
            heroCtaLink: data.settings.heroCtaLink || prev.heroCtaLink,
            heroBannerTitle: data.settings.heroBannerTitle || prev.heroBannerTitle,
            heroBannerSubtitle: data.settings.heroBannerSubtitle || prev.heroBannerSubtitle,
            heroBannerBadge: data.settings.heroBannerBadge || prev.heroBannerBadge,
            heroBannerCtaText: data.settings.heroBannerCtaText || prev.heroBannerCtaText,
            heroBannerCtaLink: data.settings.heroBannerCtaLink || prev.heroBannerCtaLink,
            heroBannerImage: data.settings.heroBannerImage !== undefined ? data.settings.heroBannerImage : prev.heroBannerImage,
            heroBannerEnabled: data.settings.heroBannerEnabled !== undefined ? data.settings.heroBannerEnabled : prev.heroBannerEnabled,
          }));
        }
      })
      .catch((err) => console.log('Loaded default settings', err));

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products?.length > 0) {
          const mapped = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            nameEn: p.nameEn,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category?.name || 'عام',
            categorySlug: p.category?.slug || 'all',
            images: p.images || [],
            sizes: p.sizes || [],
            colors: p.colors || [],
            isFeatured: p.isFeatured,
            isNewArrival: p.isNewArrival,
            inStock: p.inStock,
            rating: p.rating || 5.0,
            reviewsCount: p.reviewsCount || (p.reviews?.length || 0),
            reviews: p.reviews || [],
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => console.log('Loaded default products, live sync deferred', err));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories?.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.log('Loaded default categories', err));
  }, []);

  const filteredProducts = products.filter((product) => {
    if (selectedFilter === 'dresses') return product.categorySlug === 'dresses';
    if (selectedFilter === 'featured') return product.isFeatured;
    if (selectedFilter === 'sale') return product.originalPrice && product.originalPrice > product.price;
    return true;
  });

  return (
    <div className="space-y-16 pb-16">
      
      {/* ========================================================
          HERO BANNER SECTION
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-100 via-pink-50 to-creamy-100 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left/Right Text Content */}
            <div className="space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-200 py-1.5 px-4 rounded-full text-xs sm:text-sm font-bold text-rose-600 shadow-sm">
                <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
                <span>تشكيلة فساتين وأناقة حصرية 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 leading-[1.25] tracking-tight">
                {(() => {
                  const title = heroSettings.heroTitle || 'كوني الأجمل في كل إطلالة مع Fashion Zone';

                  if (title.includes('مع Fashion Zone')) {
                    const firstPart = title.split('مع Fashion Zone')[0].trim();
                    return (
                      <>
                        <span className="block">{firstPart}</span>
                        <span className="block mt-1.5 sm:mt-2">
                          <span className="text-stone-900">مع </span>
                          <span
                            dir="ltr"
                            className="inline-block whitespace-nowrap bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 bg-clip-text text-transparent font-serif font-black tracking-normal"
                          >
                            Fashion Zone
                          </span>
                        </span>
                      </>
                    );
                  }

                  if (title.includes('Fashion Zone')) {
                    const parts = title.split('Fashion Zone');
                    return (
                      <>
                        <span>{parts[0]}</span>
                        <span
                          dir="ltr"
                          className="inline-block whitespace-nowrap bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 bg-clip-text text-transparent font-serif font-black tracking-normal px-1"
                        >
                          Fashion Zone
                        </span>
                        <span>{parts[1]}</span>
                      </>
                    );
                  }

                  return title;
                })()}
              </h1>

              <p className="text-stone-600 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0">
                {heroSettings.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href={heroSettings.heroCtaLink || '#catalog'}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-base shadow-soft-pink hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <span>{heroSettings.heroCtaText || 'تسوقي الآن / Shop Now'}</span>
                  <ArrowLeft className="w-5 h-5" />
                </a>

                <Link
                  href="/category/dresses"
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-pink-50 text-stone-800 border border-pink-200 font-bold text-base transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>أحدث الفساتين</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-pink-200/60 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-rose-600 font-serif">+10,000</span>
                  <span className="text-[11px] text-stone-500 font-medium">عميلة سعيدة</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-rose-600 font-serif">100%</span>
                  <span className="text-[11px] text-stone-500 font-medium">خامات فاخرة</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-rose-600 font-serif">24h</span>
                  <span className="text-[11px] text-stone-500 font-medium">شحن سريع</span>
                </div>
              </div>
            </div>

            {/* Hero Image Mockup Visual */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={heroSettings.heroImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80'}
                  alt="Fashion Zone New Collection"
                  fill
                  priority
                  className="object-cover object-top"
                />
                
                {/* Floating chic badge 1 (Rating / Tag) */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md py-2 px-4 rounded-2xl shadow-soft-pink border border-pink-100 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                    ⭐
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-stone-800">{heroSettings.heroBadgeText || 'أعلى تقييم'}</p>
                    <p className="text-[10px] text-stone-500">{heroSettings.heroBadgeSubtext || 'أزياء صيف 2026'}</p>
                  </div>
                </div>

                {/* Floating chic badge 2 (Promo Coupon) */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md py-3 px-4 rounded-2xl shadow-soft-pink border border-pink-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">{heroSettings.heroCouponTitle || 'كود الخصم الفوري'}</p>
                    <p className="text-sm font-black text-rose-600">
                      {heroSettings.heroCouponCode || 'GIRL10'} {heroSettings.heroCouponDiscount ? `(${heroSettings.heroCouponDiscount})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Background ambient glow circle */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          CIRCULAR CATEGORIES SECTION (كما في الموك آب المقترح)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">تصفحي حسب الأقسام</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            تشكيلاتنا المميزة
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-3xl bg-white border border-pink-100 hover:border-rose-300 hover:shadow-soft-pink transition-all duration-300"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 border-2 border-dashed border-pink-300 group-hover:border-rose-500 transition-colors">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-pink-50">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="120px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-800 mt-3 group-hover:text-rose-600 transition">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-400 mt-0.5">
                {cat.itemCount} قطعة أنيقة
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          FEATURED PRODUCTS CATALOG WITH TABS
      ======================================================== */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">اختيارات خاصة لكِ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif mt-1">
              أحدث وأرقى المنتجات
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-pink-100/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-rose-600'
              }`}
            >
              جميع المنتجات
            </button>
            <button
              onClick={() => setSelectedFilter('dresses')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'dresses'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-rose-600'
              }`}
            >
              الفساتين
            </button>
            <button
              onClick={() => setSelectedFilter('featured')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'featured'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-rose-600'
              }`}
            >
              الأكثر طلباً ✨
            </button>
            <button
              onClick={() => setSelectedFilter('sale')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'sale'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-rose-600'
              }`}
            >
              التخفيضات 🏷️
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================
          CHIC SPECIAL OFFER BANNER (مربوط بالكامل بلوحة التحكم)
      ======================================================== */}
      {heroSettings.heroBannerEnabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white p-8 sm:p-12 shadow-rose-glow">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className={`${heroSettings.heroBannerImage ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                {heroSettings.heroBannerBadge && (
                  <span className="inline-block bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {heroSettings.heroBannerBadge}
                  </span>
                )}
                <h2 className="text-2xl sm:text-4xl font-black leading-tight font-serif">
                  {heroSettings.heroBannerTitle}
                </h2>
                <p className="text-pink-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  {heroSettings.heroBannerSubtitle}
                </p>
                <div className="pt-2">
                  <a
                    href={heroSettings.heroBannerCtaLink || '#catalog'}
                    className="inline-block px-8 py-3.5 bg-white text-rose-600 hover:bg-pink-50 font-black rounded-full shadow-lg transition active:scale-95 text-sm"
                  >
                    {heroSettings.heroBannerCtaText || 'تصفحي العروض الآن'}
                  </a>
                </div>
              </div>

              {heroSettings.heroBannerImage && (
                <div className="md:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl">
                  <Image
                    src={heroSettings.heroBannerImage}
                    alt={heroSettings.heroBannerTitle || 'عرض خاص'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

            </div>

            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -translate-x-20 -translate-y-20 pointer-events-none"></div>
          </div>
        </section>
      )}

      {/* ========================================================
          CUSTOMER REVIEWS / SOCIAL TESTIMONIALS
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">آراء جميلاتنا</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            ماذا تقول عميلات Fashion Zone؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              "الفستان الحرير الوردي خيالي بجد! الخامة أحسن بكتير من الصور والتطريز متقن جداً، والتوصيل وصل في أقل من 48 ساعة."
            </p>
            <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">ياسمين مصطفى</span>
              <span className="text-stone-400">القاهرة</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              "الطلب من خلال الواتساب كان في قمة السهولة والذوق! خدمة العملاء ساعدوني في اختيار المقاس المناسب بالظبط وطلع مظبوط جداً."
            </p>
            <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">آية محمود</span>
              <span className="text-stone-400">الإسكندرية</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              "العباية اللؤلؤية تجنن والتغليف كان بناتي وشيك جداً كأنها هدية فاخرة! بالتأكيد هيكون متجري المفضل للمناسبات."
            </p>
            <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">سلمى عبد الرحمن</span>
              <span className="text-stone-400">المنصورة</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
