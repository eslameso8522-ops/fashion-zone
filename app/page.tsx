'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowLeft, Heart, ShoppingBag, ShieldCheck, Truck, Star, Play, Video, Flame, Clock, CheckCircle2, X } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

const FASHION_REELS = [
  {
    id: 'reel-1',
    title: 'بيجامة هايدي زراير مطعمة فرو 😍',
    code: '#2061',
    views: '14.2K',
    duration: '0:24',
    thumbnail: 'https://res.cloudinary.com/p4abpsol/image/upload/v1795214686/fashion_zone_products/og1uxgytaio9nqh870cm.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-off-a-dress-41551-large.mp4',
    price: 650,
    slug: '6268',
  },
  {
    id: 'reel-2',
    title: 'ترينج وسوت خروج ميلتون شتوي فاخر',
    code: '#4102',
    views: '18.9K',
    duration: '0:31',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-modelling-a-dress-in-a-studio-41549-large.mp4',
    price: 720,
    slug: '6268',
  },
  {
    id: 'reel-3',
    title: 'جاكت ووتر بروف مبطن فرو مستورد',
    code: '#3095',
    views: '22.4K',
    duration: '0:28',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-turning-around-in-a-dress-41550-large.mp4',
    price: 890,
    slug: '6268',
  },
  {
    id: 'reel-4',
    title: 'طقم بيجامة قطيفة شين فاخرة للمنزل',
    code: '#1088',
    views: '11.6K',
    duration: '0:20',
    thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-studio-41552-large.mp4',
    price: 580,
    slug: '6268',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'homewear' | 'featured' | 'sale'>('all');
  const [activeReel, setActiveReel] = useState<any | null>(null);

  // Live Flash Sale Countdown Timer
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 5, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [heroSettings, setHeroSettings] = useState({
    heroTitle: 'كوني الأجمل في كل إطلالة مع Fashion Zone',
    heroSubtitle: 'اكتشفي تشكيلة راقية ومختارة بعناية من فساتين السهرة الناعمة، العبايات المطرزة، الحقائب والمجوهرات التي تزيدكِ تألقاً وسحراً.',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
    heroBadgeText: 'أعلى تقييم ⭐ 4.9',
    heroBadgeSubtext: 'أزياء صيف 2026',
    heroCouponTitle: '',
    heroCouponCode: '',
    heroCouponDiscount: '',
    heroCouponEnabled: true,
    heroBadgeEnabled: true,
    heroCtaText: 'تسوقي الآن / Shop Now',
    heroCtaLink: '#catalog',
    heroBannerTitle: 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!',
    heroBannerSubtitle: 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.',
    heroBannerBadge: 'عرض محدود لفترة وجيزة',
    heroBannerCtaText: 'تصفحي العروض الآن',
    heroBannerCtaLink: '#catalog',
    heroBannerImage: '',
    heroBannerEnabled: true,
    watermarkEnabled: true,
    watermarkPosition: 'bottom-right',
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
            heroCouponTitle: data.settings.heroCouponTitle !== undefined ? data.settings.heroCouponTitle : prev.heroCouponTitle,
            heroCouponCode: data.settings.heroCouponCode !== undefined ? data.settings.heroCouponCode : prev.heroCouponCode,
            heroCouponDiscount: data.settings.heroCouponDiscount !== undefined ? data.settings.heroCouponDiscount : prev.heroCouponDiscount,
            heroCouponEnabled: data.settings.heroCouponEnabled !== undefined ? data.settings.heroCouponEnabled : prev.heroCouponEnabled,
            heroBadgeEnabled: data.settings.heroBadgeEnabled !== undefined ? data.settings.heroBadgeEnabled : prev.heroBadgeEnabled,
            heroCtaText: data.settings.heroCtaText || prev.heroCtaText,
            heroCtaLink: data.settings.heroCtaLink || prev.heroCtaLink,
            heroBannerTitle: data.settings.heroBannerTitle || prev.heroBannerTitle,
            heroBannerSubtitle: data.settings.heroBannerSubtitle || prev.heroBannerSubtitle,
            heroBannerBadge: data.settings.heroBannerBadge || prev.heroBannerBadge,
            heroBannerCtaText: data.settings.heroBannerCtaText || prev.heroBannerCtaText,
            heroBannerCtaLink: data.settings.heroBannerCtaLink || prev.heroBannerCtaLink,
            heroBannerImage: data.settings.heroBannerImage !== undefined ? data.settings.heroBannerImage : prev.heroBannerImage,
            heroBannerEnabled: data.settings.heroBannerEnabled !== undefined ? data.settings.heroBannerEnabled : prev.heroBannerEnabled,
            watermarkEnabled: data.settings.watermarkEnabled !== undefined ? data.settings.watermarkEnabled : prev.watermarkEnabled,
            watermarkPosition: data.settings.watermarkPosition || prev.watermarkPosition,
          }));
        }
      })
      .catch((err) => console.log('Loaded default settings', err));

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = (data.products || []).map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            nameEn: p.nameEn,
            code: p.code,
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
    if (selectedFilter === 'homewear') {
      return product.categorySlug === 'homewear-winter-pyjamas' || product.category?.includes('هوم وير') || product.category?.includes('بيجامات');
    }
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

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-5xl font-black text-stone-900 leading-[1.2] tracking-tight">
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
                  href="#catalog"
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-pink-50 text-stone-800 border border-pink-200 font-bold text-base transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>أحدث كوليكشن الشتاء ❄️</span>
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
              <Link
                href={heroSettings.heroCtaLink || '#catalog'}
                className="block relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                title="اضغطي هنا لعرض وشراء هذا الموديل"
              >
                <Image
                  src={heroSettings.heroImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80'}
                  alt="Fashion Zone New Collection"
                  fill
                  priority
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Hover indicator overlay */}
                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/95 text-stone-900 font-bold text-xs px-4 py-2 rounded-full shadow-lg border border-pink-200 transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1.5">
                    <span>عرض تفاصيل الموديل 👗</span>
                    <ArrowLeft className="w-4 h-4 text-rose-600" />
                  </span>
                </div>
                
                {/* Floating chic badge 1 (Rating / Tag) */}
                {heroSettings.heroBadgeEnabled !== false &&
                  Boolean(heroSettings.heroBadgeText?.trim() || heroSettings.heroBadgeSubtext?.trim()) && (
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md py-2 px-4 rounded-2xl shadow-soft-pink border border-pink-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                      ⭐
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-stone-800">{heroSettings.heroBadgeText}</p>
                      {heroSettings.heroBadgeSubtext && (
                        <p className="text-[10px] text-stone-500">{heroSettings.heroBadgeSubtext}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Floating chic badge 2 (Promo Coupon / Discount) */}
                {heroSettings.heroCouponEnabled !== false &&
                  Boolean(
                    heroSettings.heroCouponDiscount?.trim() ||
                    heroSettings.heroCouponCode?.trim() ||
                    heroSettings.heroCouponTitle?.trim()
                  ) && (
                  <div className={`absolute ${
                    heroSettings.watermarkEnabled !== false && heroSettings.watermarkPosition === 'bottom-left'
                      ? 'bottom-20 left-6'
                      : 'bottom-6 left-6'
                  } bg-white/95 backdrop-blur-md py-3 px-4 rounded-2xl shadow-soft-pink border border-pink-100 flex items-center gap-3 animate-fadeIn z-10`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      {heroSettings.heroCouponTitle && (
                        <p className="text-xs font-bold text-stone-800">{heroSettings.heroCouponTitle}</p>
                      )}
                      {(heroSettings.heroCouponCode || heroSettings.heroCouponDiscount) && (
                        <p className="text-sm font-black text-rose-600 font-sans">
                          {heroSettings.heroCouponCode}{' '}
                          {heroSettings.heroCouponDiscount ? `(${heroSettings.heroCouponDiscount})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Official Fashion Zone Boutique Luxury Watermark on Hero Image */}
                {heroSettings.watermarkEnabled !== false && (
                  <div
                    className={`absolute z-10 pointer-events-none select-none transition-all duration-300 ${
                      heroSettings.watermarkPosition === 'bottom-left'
                        ? 'bottom-6 left-6'
                        : heroSettings.watermarkPosition === 'center'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110'
                        : 'bottom-6 right-6'
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
              </Link>

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
          {categories.map((cat: any) => (
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
                {cat.itemCount ? `${cat.itemCount} قطعة متوفرة` : 'قسم شتوي مميز'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          VIDEO REELS & REAL LIFE STORIES SHOWCASE (فيديوهات من الواقع)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-1">
              <Video className="w-3.5 h-3.5" />
              <span>فيديوهات حصرية من أرض الواقع</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              شاهدي الموديلات على الطبيعة 🎥✨
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            تصوير حقيقي لخامات البيجامات والترينجات والجواكت الشتوية للتأكد من الملمس والفخامة قبل الشراء.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {FASHION_REELS.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white hover:border-rose-400"
            >
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/90 transition-colors" />

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </span>
              </div>

              {/* Video Badge / Views */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold">
                <span>{reel.views} مشاهدة</span>
              </div>

              {/* Boutique Watermark Pill */}
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] font-black text-stone-900 font-serif">
                Fashion Zone
              </div>

              {/* Bottom Caption & Price */}
              <div className="absolute bottom-3 right-3 left-3 space-y-1 text-white">
                <span className="text-[10px] font-mono text-pink-300 font-bold block">{reel.code}</span>
                <h4 className="text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm">{reel.title}</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-black text-pink-300 font-sans">{reel.price} ج.م</span>
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-lg">
                    معاينة 📹
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          WINTER FLASH SALE COUNTDOWN SECTION
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white shadow-xl border border-rose-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-2 bg-rose-500/30 text-pink-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/40">
              <Flame className="w-4 h-4 text-rose-400 fill-current animate-bounce" />
              <span>عروض شتاء 2026 الحصرية (Flash Sale)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-serif">
              تخفيضات تصل إلى 35% على تشكيلة الهوم وير والخروج! 🔥
            </h3>
            <p className="text-xs text-stone-300 max-w-xl">
              استمتعي بأقوى عروض الموسم مع شحن مجاني لكافة محافظات مصر عند طلب قطعتين أو أكثر.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-pink-200 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>ينتهي العرض المؤقت خلال:</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-black">
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-center min-w-[54px]">
                <span className="block text-rose-400">{String(flashSaleTime.hours).padStart(2, '0')}</span>
                <span className="text-[9px] text-stone-400 font-sans block">ساعة</span>
              </div>
              <span className="text-rose-400 text-lg font-bold">:</span>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-center min-w-[54px]">
                <span className="block text-rose-400">{String(flashSaleTime.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] text-stone-400 font-sans block">دقيقة</span>
              </div>
              <span className="text-rose-400 text-lg font-bold">:</span>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-center min-w-[54px]">
                <span className="block text-rose-400">{String(flashSaleTime.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] text-stone-400 font-sans block">ثانية</span>
              </div>
            </div>
            <a
              href="#catalog"
              onClick={() => setSelectedFilter('sale')}
              className="mt-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition active:scale-95"
            >
              تسوقي عروض الفلاش سيل الآن ←
            </a>
          </div>
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
              onClick={() => setSelectedFilter('homewear')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'homewear'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-rose-600'
              }`}
            >
              هوم وير وبيجامات
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

      {/* Video Reel Player Modal */}
      {activeReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm aspect-[9/16] max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                <span className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold font-serif">
                  FZ
                </span>
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate max-w-[180px]">{activeReel.title}</h4>
                  <span className="text-[10px] text-pink-300 font-mono">{activeReel.code}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveReel(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Visual Stream */}
            <div className="absolute inset-0 w-full h-full">
              <video
                src={activeReel.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Actions Overlay */}
            <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-3">
              <div className="flex items-baseline justify-between text-white">
                <div>
                  <span className="text-[11px] text-stone-300 block">سعر الموديل:</span>
                  <span className="text-xl font-black text-pink-400 font-sans">{activeReel.price} ج.م</span>
                </div>
                <span className="text-[10px] bg-emerald-500/80 text-white font-bold px-2 py-0.5 rounded-full">
                  متوفر بالمخزون ✓
                </span>
              </div>

              <Link
                href={`/product/${activeReel.slug}`}
                onClick={() => setActiveReel(null)}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <span>طلب وشراء هذا الموديل الآن 🛍️</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
