'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Sparkles, CheckCircle2, Truck, ShieldCheck, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '@/lib/types';

interface QuickOrderModalProps {
  product: Product;
  onClose: () => void;
}

const EGYPT_GOVERNORATES = [
  { name: 'القاهرة', fee: 45, time: 'خلال 24-48 ساعة ⚡' },
  { name: 'الجيزة', fee: 45, time: 'خلال 24-48 ساعة ⚡' },
  { name: 'الإسكندرية', fee: 55, time: 'خلال 48 ساعة' },
  { name: 'القليوبية / بنها', fee: 50, time: 'خلال 48 ساعة' },
  { name: 'الدقهلية / المنصورة', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'الغربية / طنطا', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'الشرقية / الزقازيق', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'المنوفية', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'البحيرة / دمنهور', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'دمياط وكفر الشيخ', fee: 55, time: 'خلال 2-3 أيام' },
  { name: 'مدن القناة (بورسعيد / الإسماعيلية / السويس)', fee: 60, time: 'خلال 2-3 أيام' },
  { name: 'الفيوم وبني سويف', fee: 60, time: 'خلال 2-3 أيام' },
  { name: 'المنيا وأسيوط وسوهاج', fee: 65, time: 'خلال 3-4 أيام' },
  { name: 'قنا والأقصر وأسوان', fee: 70, time: 'خلال 3-5 أيام' },
  { name: 'البحر الأحمر والغردقة', fee: 75, time: 'خلال 3-5 أيام' },
  { name: 'مرسى مطروح والساحل الشمالي', fee: 75, time: 'خلال 3-5 أيام' },
];

export default function QuickOrderModal({ product, onClose }: QuickOrderModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [selectedGovIndex, setSelectedGovIndex] = useState(0);

  const selectedGov = EGYPT_GOVERNORATES[selectedGovIndex];
  const isFreeShipping = product.price >= 750;
  const actualShippingFee = isFreeShipping ? 0 : selectedGov.fee;
  const orderGrandTotal = product.price + actualShippingFee;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff']
      });
    } catch {}

    const fullAddress = `${selectedGov.name} - ${addressDetails.trim() || 'سيتم تأكيد العنوان بالتفصيل'}`;

    // Save order in MySQL database in background
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: fullAddress,
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
          total: orderGrandTotal,
          notes: `طلب سريع - المحافظة: ${selectedGov.name} (شحن: ${actualShippingFee} ج.م)`,
        }),
      }).catch(console.error);
    } catch {}

    const storeWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201080441559';

    const orderMessage = `*طلب شراء جديد من متجر Fashion Zone 🛍️✨*
-----------------------------
👗 *الموديل:* ${product.name} ${product.code ? `[كود: #${product.code}]` : ''}
💰 *سعر القطعة:* ${product.price} ج.م${product.sizes && product.sizes.length > 0 ? `\n📏 *المقاس:* ${selectedSize || 'حسب الرغبة'}` : ''}${product.colors && product.colors.length > 0 ? `\n🎨 *اللون:* ${selectedColor || 'حسب الرغبة'}` : ''}
🚚 *الشحن (${selectedGov.name}):* ${actualShippingFee === 0 ? 'مجاني 🎉' : `${actualShippingFee} ج.م`} (${selectedGov.time})
💎 *المبلغ المطلوب عند الاستلام:* ${orderGrandTotal} ج.م
-----------------------------
👤 *اسم العميلة:* ${name || 'غير مذكور'}
📱 *رقم الموبايل:* ${phone || 'غير مذكور'}
📍 *العنوان:* ${fullAddress}
-----------------------------
✨ _الدفع كاش عند الاستلام مع إمكانية المعاينة والتأكد من الخامة قبل الدفع._
🔗 *رابط الموديل:* ${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.slug}`;

    const url = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(orderMessage)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg">طلب سريع وتوصيل لباب بيتك</h3>
              <p className="text-[11px] text-pink-100">معاينة قبل الاستلام والدفع عند التأكد من الخامة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Mini Product Preview */}
          <div className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-2xs">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-stone-800 text-sm truncate">{product.name}</h4>
              {product.code && (
                <span className="inline-block text-[10px] font-mono text-rose-700 bg-pink-100 px-1.5 py-0.2 rounded font-bold mt-0.5">
                  #{product.code}
                </span>
              )}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-rose-600 font-black text-base">
                  {product.price} جنيه
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    {product.originalPrice} جنيه
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-3.5">
            
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  المقاس المختار: <span className="text-rose-600 font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedSize === size
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
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
                  اللون المختار: <span className="text-rose-600 font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedColor === color.name
                          ? 'bg-pink-100 text-rose-700 border-rose-400 shadow-2xs'
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
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm bg-pink-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رقم الموبايل / واتساب (للتأكيد قبل الشحن):
              </label>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm bg-pink-50/20"
              />
            </div>

            {/* Governorate & Shipping Calculator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  المحافظة:
                </label>
                <select
                  value={selectedGovIndex}
                  onChange={(e) => setSelectedGovIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs font-bold bg-pink-50/30 text-stone-800"
                >
                  {EGYPT_GOVERNORATES.map((gov, idx) => (
                    <option key={gov.name} value={idx}>
                      {gov.name} ({gov.fee} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  العنوان والمنطقة بالتفصيل:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شارع النصر، عمارة 12"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm bg-pink-50/20"
                />
              </div>
            </div>

            {/* Delivery & Cost Breakdown Summary */}
            <div className="bg-pink-50/70 p-3.5 rounded-2xl border border-pink-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-stone-600">
                <span>سعر الموديل:</span>
                <span className="font-bold text-stone-800">{product.price} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-rose-500" />
                  <span>مصاريف الشحن ({selectedGov.name}):</span>
                </span>
                <span className="font-bold text-stone-800">
                  {actualShippingFee === 0 ? (
                    <span className="text-emerald-600 font-black">مجاني 🎉</span>
                  ) : (
                    `${actualShippingFee} ج.م (${selectedGov.time})`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-pink-200 flex items-center justify-between font-bold text-stone-900 text-sm">
                <span>المبلغ الإجمالي عند الاستلام:</span>
                <span className="text-rose-600 font-black text-base">{orderGrandTotal} ج.م</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition text-sm sm:text-base cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تأكيد وإرسال الطلب عبر واتساب ({orderGrandTotal} ج.م)</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>الدفع عند الاستلام</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>حق المعاينة قبل الدفع</span>
              </span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
