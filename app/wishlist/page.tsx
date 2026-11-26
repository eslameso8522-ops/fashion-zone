'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'قائمة المفضلة والأمنيات | Fashion Zone';
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const mapped = data.products.map((p: any) => ({
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

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-full bg-pink-100 text-rose-500 mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
          قائمة أمنياتك والمفضلة ({favoriteProducts.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          جميع القطع التي نالت إعجابك محفوظة هنا لتتمكني من طلبها في أي وقت
        </p>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 max-w-lg mx-auto p-8 space-y-5">
          <p className="text-sm text-stone-600">
            قائمتك المفضلة فارغة حالياً. اضغطي على علامة القلب ❤️ في أي منتج لإضافته هنا!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-full text-xs shadow-soft-pink"
          >
            <span>استكشاف المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
