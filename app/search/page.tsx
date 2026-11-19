'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowLeft } from 'lucide-react';
import { Product } from '@/lib/types';
import { PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
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
            rating: p.rating,
            reviewsCount: p.reviewsCount,
          }));
          setProducts(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(term)) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">البحث في المتجر</span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
          نتائج البحث عن: "{searchTerm}"
        </h1>

        {/* Live Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحثي عن فساتين، عبايات، حقائب، عطور..."
            className="w-full text-sm px-5 py-3.5 pr-12 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white shadow-sm"
          />
          <Search className="w-5 h-5 text-rose-500 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 border-b border-pink-100 pb-3">
        <span>تم العثور على <strong>{filteredProducts.length}</strong> قطعة</span>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 max-w-lg mx-auto p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-rose-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">لم نتمكن من العثور على نتائج</h3>
          <p className="text-xs text-stone-500">
            جربي البحث بكلمات أخرى مثل (فستان، عباية، حقيبة، عطر) أو تصفحي أقسام المتجر الرئيسية.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-full font-bold text-xs shadow-soft-pink"
          >
            <span>العودة للرئيسية</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-bold text-rose-500">جاري تحميل نتائج البحث...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
