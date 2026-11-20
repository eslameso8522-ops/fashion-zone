'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '@/lib/types';

interface QuickOrderModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickOrderModal({ product, onClose }: QuickOrderModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger sweet confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff']
      });
    } catch {}

    // Save order in MySQL database in background
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items: [
            {
              productId: product.id,
              name: product.name,
              code: product.code || null,
              price: product.price,
              quantity: 1,
              size: selectedSize,
              color: selectedColor,
            },
          ],
          total: product.price,
          notes: 'طلب سريع عبر نافذة المنتج',
        }),
      }).catch(console.error);
    } catch {}

    const storeWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';

    const orderMessage = `*طلب جديد من متجر Fashion Zone ✨*
-----------------------------
👗 *المنتج:* ${product.name} ${product.code ? `[كود: ${product.code}]` : ''}
💰 *السعر:* ${product.price} جنيه${product.sizes && product.sizes.length > 0 ? `\n📏 *المقاس:* ${selectedSize || 'حسب الاختيار'}` : ''}${product.colors && product.colors.length > 0 ? `\n🎨 *اللون:* ${selectedColor || 'حسب الاختيار'}` : ''}
-----------------------------
👤 *اسم العميلة:* ${name || 'غير مذكور'}
📱 *رقم الهاتف:* ${phone || 'غير مذكور'}
📍 *العنوان / المحافظة:* ${address || 'سيتم تأكيده عبر الشات'}
-----------------------------
🔗 *رابط المنتج:* ${window.location.origin}/product/${product.slug}`;

    const url = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(orderMessage)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-200" />
            <h3 className="font-bold text-lg sm:text-xl">طلب سريع بضغطة زر</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Mini Product Preview */}
          <div className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-stone-800 text-sm">{product.name}</h4>
              <p className="text-rose-600 font-extrabold text-base mt-1">
                {product.price} جنيه
              </p>
            </div>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  اختاري المقاس:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedSize === size
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-pink-200 hover:border-rose-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  اختاري اللون:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedColor === color.name
                          ? 'bg-pink-100 text-rose-700 border-rose-400'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-pink-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Inputs */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الاسم الكريم:
              </label>
              <input
                type="text"
                required
                placeholder="مثال: ياسمين أحمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-pink-50/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الواتساب / الموبايل:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-pink-50/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  المحافظة / المدينة:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: القاهرة - المعادي"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-pink-50/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              <span>إرسال الطلب فوراً على واتساب</span>
            </button>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>الدفع عند الاستلام مع إمكانية المعاينة قبل الاستلام</span>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
