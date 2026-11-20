'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, MessageCircle, Sparkles, CheckCircle2, Tag, Check, X, AlertCircle, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/lib/cartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('201000000000');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  const shippingFee = discountedSubtotal >= 500 || cartTotal === 0 ? 0 : 50;
  const grandTotal = discountedSubtotal + shippingFee;

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch(
        `/api/coupons?code=${encodeURIComponent(couponCodeInput.trim())}&total=${cartTotal}`
      );
      const data = await res.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          description: data.coupon.description,
        });
        confetti({ particleCount: 70, spread: 60 });
        setCouponCodeInput('');
      } else {
        setCouponError(data.error || 'كود الخصم غير صحيح');
      }
    } catch (err) {
      setCouponError('تعذر التحقق من كود الخصم حالياً');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckoutViaWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'],
      });
    } catch {}

    // Save order in MySQL database
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
            code: (item.product as any).code || null,
            price: item.product.price,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
          })),
          total: grandTotal,
          discountAmount: discountAmount,
          couponCode: appliedCoupon?.code || null,
          notes: `طلب سلة مشتريات (${cartCount} قطع)${
            appliedCoupon ? ` - كود خصم: ${appliedCoupon.code} (وفّر: ${discountAmount} ج.م)` : ''
          } - الشحن: ${shippingFee} جنيه`,
        }),
      }).catch(console.error);
    } catch {}

    const itemsSummary = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.product.name}* ${(item.product as any).code ? `[كود: ${(item.product as any).code}]` : ''}\n   - الكمية: ${item.quantity}${
            item.selectedSize ? `\n   - المقاس: ${item.selectedSize}` : ''
          }${item.selectedColor ? `\n   - اللون: ${item.selectedColor}` : ''}\n   - السعر: ${
            item.product.price * item.quantity
          } جنيه`
      )
      .join('\n\n');

    const couponLine = appliedCoupon
      ? `🎟️ *كود الخصم المطبق:* ${appliedCoupon.code} (-${discountAmount} جنيه)\n`
      : '';

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
${couponLine}🚚 *الشحن:* ${shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee} جنيه`}
💎 *المبلغ الإجمالي المستحق:* ${grandTotal} جنيه
-----------------------------
_الدفع عند الاستلام بعد المعاينة_`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
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
      
      <div className="flex items-center justify-between pb-6 border-b border-pink-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            سلة مشترياتكِ الأنيقة 🛍️
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            لديكِ {cartCount} قطعة في السلة، راجعي المقاسات والألوان قبل الإرسال
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition underline"
        >
          إفراغ السلة
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      {(() => {
        const freeShippingThreshold = 500;
        const remainingForFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);
        const shippingProgress = Math.min(100, Math.round((discountedSubtotal / freeShippingThreshold) * 100));
        return (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 mb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-rose-500 animate-bounce" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-600">🎉 مبروك! لقد حصلتِ على شحن مجاني لكافة مشترياتكِ!</span>
                ) : (
                  <span>
                    أضيفي بـ <span className="text-rose-600 font-black">{remainingForFreeShipping} جنيه</span> إضافية واحصلي على <span className="text-rose-600">شحن مجاني 🚚</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-rose-600 font-black">{shippingProgress}%</span>
            </div>
            <div className="w-full bg-pink-200/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Cart Items List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
              className="flex gap-4 p-4 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition"
            >
              <div className="w-20 h-24 sm:w-24 sm:h-28 relative rounded-2xl overflow-hidden bg-pink-50 flex-shrink-0">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">✨</div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-bold text-stone-800 hover:text-rose-600 text-sm sm:text-base line-clamp-1 transition"
                >
                  {item.product.name}
                </Link>

                <div className="flex flex-wrap gap-2 text-xs text-stone-500 mt-1">
                  {item.selectedSize && <span>المقاس: <strong>{item.selectedSize}</strong></span>}
                  {item.selectedColor && <span>اللون: <strong>{item.selectedColor}</strong></span>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm sm:text-base font-black text-rose-600 font-sans">
                    {item.product.price * item.quantity} ج.م
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
                className="p-2 text-stone-400 hover:text-rose-500 transition self-start"
                title="حذف القطعة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & WhatsApp Checkout (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-5 h-fit">
          <h2 className="font-bold text-lg text-stone-900 border-b border-pink-100 pb-3">
            ملخص الطلب
          </h2>

          {/* Coupon Code Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>كود الخصم (كوبون التخفيض):</span>
            </label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-bold text-emerald-800 animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم تطبيق كود: <strong className="font-mono">{appliedCoupon.code}</strong> (-{appliedCoupon.discountAmount} ج.م)</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-stone-400 hover:text-red-500 p-1"
                  title="إلغاء الكود"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: GIRL10"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 uppercase font-mono font-bold"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCodeInput.trim()}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  {couponLoading ? '...' : 'تطبيق'}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-pink-100">
            <div className="flex justify-between text-stone-600">
              <span>إجمالي المنتجات:</span>
              <span className="font-bold text-stone-800 font-sans">{cartTotal} ج.م</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>خصم الكوبون ({appliedCoupon.code}):</span>
                <span>-{discountAmount} ج.م</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>رسوم الشحن:</span>
              <span className="font-bold text-emerald-600">
                {shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee} ج.م`}
              </span>
            </div>

            {shippingFee > 0 && (
              <p className="text-[11px] text-rose-500 bg-pink-50 p-2 rounded-xl">
                أضيفي منتجات بقيمة {500 - discountedSubtotal} جنيه للحصول على شحن مجاني!
              </p>
            )}

            <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-pink-100">
              <span>المبلغ الكلي المستحق:</span>
              <span className="text-rose-600 text-lg font-sans">{grandTotal} ج.م</span>
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
              <label className="block text-xs font-bold text-stone-700 mb-1">رقم الهاتف للتوصيل:</label>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عنوان التوصيل بالتفصيل:
              </label>
              <textarea
                rows={2}
                required
                placeholder="المحافظة، المدينة، اسم الشارع، رقم العمارة والشقة..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-emerald-200 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              <MessageCircle className="w-5 h-5" />
              <span>إرسال الطلب وتأكيده عبر واتساب 🛍️</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>الدفع عند الاستلام بعد المعاينة التامة للمنتجات</span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
