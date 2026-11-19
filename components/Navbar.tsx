'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Truck,
  ChevronDown,
  Flame,
  ArrowLeft,
  Gift,
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showInNavbar?: boolean;
  itemCount?: number;
}

export default function Navbar() {
  const { cartCount, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('201000000000');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic categories and site settings
  useEffect(() => {
    // 1. Fetch categories
    fetch('/api/categories?navbar=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories?.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    // 2. Fetch site settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
      })
      .catch(() => {});

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-rose-500 rounded-xl transition"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Boutique Luxury Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-soft-pink group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </span>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 bg-clip-text text-transparent font-serif">
                  Fashion Zone
                </span>
                <span className="text-[10px] tracking-widest text-rosegold-500 font-semibold -mt-1 uppercase">
                  Boutique & Beauty
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links with Sleek Mega Dropdown */}
          <nav className="hidden lg:flex items-center gap-7">
            {/* Home */}
            <Link
              href="/"
              className="text-sm font-bold text-stone-700 hover:text-rose-600 transition py-1 relative group"
            >
              الرئيسية
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-rose-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Categories Rich Dropdown (Mega Menu) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-bold text-stone-700 hover:text-rose-600 transition py-2 group"
              >
                <span>الأقسام والتشكيلات</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 group-hover:text-rose-500 transition-transform duration-200 ${
                    categoriesDropdownOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>

              {/* Luxury Mega Dropdown Card with Photos */}
              {categoriesDropdownOpen && (
                <div className="absolute right-0 top-full pt-3 w-[560px] max-w-[92vw] z-[100] animate-fadeIn">
                  <div 
                    className="bg-white rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-pink-200 ring-1 ring-black/5"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-pink-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-extrabold text-stone-900 font-serif">
                          تشكيلات وأقسام Fashion Zone الفاخرة
                        </span>
                      </div>
                      <Link
                        href="/search"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <span>تصفحي كافة المنتجات</span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Categories Grid with Images */}
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-pink-50/40 hover:bg-pink-100/70 border border-pink-100 hover:border-pink-300 transition group"
                        >
                          <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-pink-100 flex-shrink-0 border border-pink-200/80 shadow-sm group-hover:scale-105 transition-transform">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">✨</div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-800 group-hover:text-rose-600 text-xs sm:text-sm transition">
                              {cat.name}
                            </h4>
                            <span className="text-[11px] text-stone-400 group-hover:text-rose-500 flex items-center gap-1 mt-0.5">
                              <span>تصفحي القسم</span>
                              <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Bottom Promo Strip inside Dropdown */}
                    <div className="mt-4 pt-3.5 border-t border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-2xl border border-pink-200/60">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-rose-500" />
                        <span className="text-xs text-stone-700 font-semibold">
                          كود خصم إضافي <strong>10%</strong> للطلبات فوق 200 ج.م
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-pink-200 shadow-xs">
                        GIRL10
                      </span>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* New Arrivals */}
            <Link
              href="/search?filter=new"
              className="text-sm font-bold text-stone-700 hover:text-rose-600 transition py-1 relative group"
            >
              وصل حديثاً 🎀
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-rose-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Exclusive Offers */}
            <Link
              href="/search?filter=sale"
              className="flex items-center gap-1 text-sm font-bold text-rose-600 hover:text-rose-700 transition py-1 relative group"
            >
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>تخفيضات حصرية</span>
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-rose-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Beautiful, Proportional Track Order Pill Badge */}
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 bg-pink-50/80 hover:bg-pink-100 text-rose-600 border border-pink-200/90 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm hover:scale-105 active:scale-95"
              title="تتبعي حالة طلبكِ وشحنتكِ"
            >
              <Truck className="w-3.5 h-3.5 text-rose-500" />
              <span>تتبع طلبكِ 🚚</span>
            </Link>
          </nav>

          {/* Action Icons & Fast Customer Help */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-stone-600 hover:text-rose-600 hover:bg-pink-50 rounded-full transition"
              title="بحث في المتجر"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2.5 text-stone-600 hover:text-rose-600 hover:bg-pink-50 rounded-full transition relative"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="p-2.5 text-stone-600 hover:text-rose-600 hover:bg-pink-50 rounded-full transition relative"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Direct WhatsApp help button */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                'مرحباً Fashion Zone أود الاستفسار عن متجركم'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مساعدة واتساب</span>
            </a>
          </div>

        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-pink-100 animate-fadeIn">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative max-w-xl mx-auto"
            >
              <input
                type="text"
                placeholder="ابحثي عن فساتين، عبايات، حقائب، عطور..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/50 text-sm text-stone-800"
                autoFocus
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer (NO ADMIN LOGIN BUTTON AS REQUESTED) */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-pink-100 space-y-3 animate-fadeIn">
            
            {/* Mobile Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative px-2 mb-2"
            >
              <input
                type="text"
                placeholder="ابحثي في المتجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-pink-200 bg-pink-50/40 text-xs"
              />
              <Search className="w-4 h-4 text-rose-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-bold text-stone-800 hover:bg-pink-50 hover:text-rose-600 rounded-xl transition"
            >
              الرئيسية
            </Link>

            {/* Mobile Categories Accordion with Photos */}
            <div className="px-3 py-2 bg-pink-50/30 rounded-2xl border border-pink-100/60 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 px-1 block">أقسام وتشكيلات المتجر:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-100/60 transition"
                  >
                    <div className="w-8 h-9 relative rounded-lg overflow-hidden bg-pink-100 flex-shrink-0">
                      {cat.image ? (
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                      ) : (
                        <span className="text-xs">✨</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-stone-800">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/search?filter=new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-bold text-stone-800 hover:bg-pink-50 hover:text-rose-600 rounded-xl transition"
            >
              وصل حديثاً 🎀
            </Link>

            <Link
              href="/search?filter=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-pink-50 rounded-xl transition"
            >
              <Flame className="w-4 h-4" />
              <span>تخفيضات حصرية 🔥</span>
            </Link>

            {/* Prominent Track Order Link */}
            <div className="pt-2 px-2 space-y-2">
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 rounded-2xl font-bold text-xs border border-rose-200 transition shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>تتبعي حالة طلبكِ الآن 🚚</span>
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white py-3 rounded-2xl font-bold text-xs shadow-sm hover:bg-emerald-600 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة واتساب فورية</span>
              </a>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
