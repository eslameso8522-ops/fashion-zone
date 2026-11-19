'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Search, Heart, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = (data.products || [])
            .filter((p: any) => p.isNewArrival)
            .map((p: any) => ({
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
              reviewsCount: p.reviewsCount || 1,
            }));
          setProducts(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.code && p.code.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-rose-600 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>أحدث الصيحات الحصرية</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-serif">
          تشكيلة وصل حديثاً 🎀
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          اكتشفي أحدث الموديلات التي وصلت متجر Fashion Zone حديثاً بأعلى خامات وأفضل أسعار
        </p>

        {/* Live Search */}
        <div className="relative pt-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحثي في وصل حديثاً بكود الموديل أو الاسم..."
            className="w-full text-xs sm:text-sm px-5 py-3 pr-11 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white shadow-xs"
          />
          <Search className="w-4 h-4 text-rose-500 absolute right-4 top-1/2 translate-y-[-10%]" />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 border-b border-pink-100 pb-3">
        <span>
          المعروض: <strong>{filteredProducts.length}</strong> منتج
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-xs font-bold text-stone-500">جاري تحميل تشكيلة وصل حديثاً...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 max-w-lg mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 text-rose-500 mx-auto flex items-center justify-center text-2xl shadow-xs">
            🎀
          </div>
          <h3 className="font-bold text-stone-800 text-base">
            لا توجد منتجات مضافة في قسم وصل حديثاً حالياً
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            يمكنكِ تصفح بقية أقسام المتجر أو الرجوع للرئيسية لاكتشاف الموديلات المتاحة.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs"
            >
              <span>تصفحي أقسام المتجر</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
