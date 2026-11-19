'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/lib/cartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal + shippingFee;

  const handleCheckoutViaWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
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
          customerName,
          customerPhone,
          customerAddress,
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
          })),
          total: grandTotal,
          notes: `طلب سلة مشتريات (${cartCount} قطع) - الشحن: ${shippingFee} جنيه`,
        }),
      }).catch(console.error);
    } catch {}

    const storeWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';

    const itemsSummary = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.product.name}* \n   - الكمية: ${item.quantity}\n   - المقاس: ${item.selectedSize || 'افتراضي'}\n   - اللون: ${item.selectedColor || 'افتراضي'}\n   - السعر: ${item.product.price * item.quantity} جنيه`
      )
      .join('\n\n');

    const orderMessage = `*طلب شراء جديد من متجر Fashion Zone 🛍️*
-----------------------------
👤 *اسم العميلة:* ${customerName}
📱 *رقم الهاتف:* ${customerPhone}
📍 *العنوان:* ${customerAddress}
-----------------------------
📋 *المنتجات المطلوبة:*
${itemsSummary}
-----------------------------
💰 *إجمالي المنتجات:* ${cartTotal} جنيه
🚚 *الشحن:* ${shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee} جنيه`}
💎 *المبلغ الإجمالي المستحق:* ${grandTotal} جنيه
-----------------------------
_الدفع عند الاستلام بعد المعاينة_`;

    const url = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(orderMessage)}`;
    window.open(url, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-rose-500">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            سلة المشتريات فارغة
          </h1>
          <p className="text-stone-500 text-sm">
            لم تقومي باختيار أي قطع بعد، استكشفي أحدث تشكيلاتنا وأضيفي ما يعجبكِ!
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-soft-pink hover:shadow-lg transition active:scale-95 text-sm"
        >
          <span>ابدأي التسوق الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">سلة التسوق</span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            مشترياتك الأنيقة ({cartCount} قطع)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
        >
          إفراغ السلة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
              className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-pink-100 shadow-sm"
            >
              {/* Product Thumbnail */}
              <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-pink-50 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-bold text-stone-800 text-sm sm:text-base hover:text-rose-600 transition block truncate"
                >
                  {item.product.name}
                </Link>

                <div className="flex flex-wrap gap-2 text-xs text-stone-500 mt-1">
                  {item.selectedSize && <span>المقاس: <strong>{item.selectedSize}</strong></span>}
                  {item.selectedColor && <span>اللون: <strong>{item.selectedColor}</strong></span>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm sm:text-base font-black text-rose-600">
                    {item.product.price * item.quantity} جنيه
                  </span>

                  {/* Quantity Controller */}
                  <div className="flex items-center border border-pink-200 rounded-xl bg-pink-50/50">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity - 1,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-rose-600 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-rose-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() =>
                  removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                }
                className="p-2 text-stone-400 hover:text-rose-500 transition"
                title="حذف القطعة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & WhatsApp Checkout */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-stone-900 border-b border-pink-100 pb-3">
            ملخص الطلب
          </h2>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600">
              <span>إجمالي المنتجات:</span>
              <span className="font-bold text-stone-800">{cartTotal} جنيه</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>رسوم الشحن:</span>
              <span className="font-bold text-emerald-600">
                {shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee} جنيه`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-[11px] text-rose-500 bg-pink-50 p-2 rounded-xl">
                أضيفي منتجات بقيمة {500 - cartTotal} جنيه للحصول على شحن مجاني!
              </p>
            )}
            <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-pink-100">
              <span>المبلغ الكلي:</span>
              <span className="text-rose-600 text-lg">{grandTotal} جنيه</span>
            </div>
          </div>

          {/* Quick Checkout Form */}
          <form onSubmit={handleCheckoutViaWhatsApp} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكريم:</label>
              <input
                type="text"
                required
                placeholder="اسمك الكامل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">رقم الموبايل / واتساب:</label>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">عنوان التوصيل بالتفصيل:</label>
              <input
                type="text"
                required
                placeholder="المحافظة - المنطقة - اسم الشارع"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>إتمام وتأكيد الطلب عبر واتساب</span>
            </button>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>معاينة المنتجات متاحة ومجانية قبل دفع أي مليم</span>
            </p>
          </form>

        </div>

      </div>
    </div>
  );
}
