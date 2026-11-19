'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Search, Menu, X, Sparkles, MessageCircle, Lock } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const { cartCount, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'فساتين سهرة', href: '/category/dresses' },
    { name: 'عبايات وكيمونو', href: '/category/abayas' },
    { name: 'حقائب فاخرة', href: '/category/bags' },
    { name: 'مجوهرات وإكسسوار', href: '/category/jewelry' },
    { name: 'عطور راقية', href: '/category/perfumes' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-rose-500 rounded-lg transition"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="group flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-soft-pink group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 bg-clip-text text-transparent font-serif">
                  Fashion Zone
                </span>
                <span className="text-[10px] tracking-widest text-rosegold-500 font-semibold -mt-1 uppercase">
                  Boutique & Beauty
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-stone-700 hover:text-rose-500 transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-rose-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-stone-600 hover:text-rose-500 hover:bg-pink-50 rounded-full transition"
              title="بحث في المتجر"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2.5 text-stone-600 hover:text-rose-500 hover:bg-pink-50 rounded-full transition relative"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="p-2.5 text-stone-600 hover:text-rose-500 hover:bg-pink-50 rounded-full transition relative"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin Dashboard Access Link */}
            <Link
              href="/admin/login"
              className="p-2.5 text-stone-500 hover:text-rose-600 hover:bg-pink-50 rounded-full transition"
              title="لوحة تحكم الإدارة"
            >
              <Lock className="w-4 h-4" />
            </Link>

            {/* Direct WhatsApp help button */}
            <a
              href="https://wa.me/201000000000?text=مرحباً%20Fashion%20Zone%20أود%20الاستفسار%20عن%20المتجر"
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-pink-100 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-base font-semibold text-stone-700 hover:bg-pink-50 hover:text-rose-500 rounded-lg transition"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 px-4 space-y-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-pink-50 text-rose-600 hover:bg-pink-100 py-2.5 rounded-xl font-bold text-sm border border-pink-200 transition"
              >
                <Lock className="w-4 h-4" />
                <span>دخول لوحة تحكم الإدارة</span>
              </Link>

              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل مباشر عبر واتساب</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
