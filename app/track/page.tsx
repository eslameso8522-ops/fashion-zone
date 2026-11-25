'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Gift,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

const STEPS = [
  { key: 'PENDING', label: 'تم الاستلام والتأكيد', desc: 'تم استلام طلبك ومراجعته بنجاح', icon: Package },
  { key: 'PREPARING', label: 'جاري التجهيز والتغليف', desc: 'نقوم بتغليف فستانك وقطعك المفضلة بعناية', icon: Gift },
  { key: 'SHIPPED', label: 'تم الشحن مع المندوب', desc: 'شحنتك في الطريق إليك مع شركة الشحن', icon: Truck },
  { key: 'DELIVERED', label: 'تم التوصيل بنجاح', desc: 'نتمنى أن تسعدي بطلبيتك ومظهركِ الفاتن 🎉', icon: CheckCircle2 },
];

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('201000000000');

  useEffect(() => {
    document.title = 'تتبع الطلب والشحنة | Fashion Zone';
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.orders?.length > 0) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'لم يتم العثور على أي طلب مسجل بهذا الرقم.');
      }
    } catch (err) {
      setError('تعذر الاتصال بالنظام، يرجى المحاولة بعد لحظات.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PREPARING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام التتبع المباشر لمتجر Fashion Zone</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            تتبعي حالة طلبكِ خطوة بخطوة 🚚✨
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
            أدخلي كود الطلب الذي استلمتيه (مثال: <span className="font-mono font-bold text-rose-600">FZ-123456</span>) أو رقم الهاتف الذي سجلتِ به الطلب لمعرفة أين وصلت شحنتكِ الآن.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="أدخلي كود الطلب (مثل FZ-489201) أو رقم هاتفكِ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/30 text-stone-800 text-sm font-medium transition"
              />
              <Search className="w-5 h-5 text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-md shadow-pink-300/40 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>تتبع الشحنة</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}
        </div>

        {/* Results */}
        {orders.map((order) => {
          const currentStep = getStepIndex(order.status);
          const isCancelled = order.status === 'CANCELLED';

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/70 border border-pink-100 space-y-8 animate-fadeIn"
            >
              {/* Top Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-pink-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">كود الطلب:</span>
                    <span className="font-mono text-base font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isCancelled ? (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                      تم إلغاء الطلب
                    </span>
                  ) : currentStep === 3 ? (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم التوصيل بنجاح</span>
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 animate-pulse">
                      <Truck className="w-4 h-4" />
                      <span>{STEPS[currentStep]?.label || 'قيد المعالجة'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Stepper Timeline */}
              {!isCancelled ? (
                <div className="py-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div
                          key={step.key}
                          className={`flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition border ${
                            isCurrent
                              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                              : isCompleted
                              ? 'bg-pink-50/40 border-pink-100'
                              : 'bg-stone-50/40 border-stone-100 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-sm transition-transform ${
                              isCurrent
                                ? 'bg-gradient-to-tr from-rose-500 to-pink-500 scale-110 shadow-pink-300'
                                : isCompleted
                                ? 'bg-rose-500'
                                : 'bg-stone-300'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <span
                            className={`text-xs font-bold mb-1 ${
                              isCurrent ? 'text-rose-600' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[11px] text-stone-500 leading-tight">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-xs">
                  تم إلغاء هذا الطلب. إذا كان لديكِ أي استفسار يرجى مراسلة خدمة عملاء المتجر.
                </div>
              )}

              {/* Order Info & Tracking Number details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-50/40 p-4 sm:p-6 rounded-2xl border border-pink-100 text-xs sm:text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-700">
                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span><strong>عنوان التوصيل:</strong> {order.customerAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span><strong>الهاتف:</strong> {order.customerPhone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 text-stone-800 bg-white p-2.5 rounded-xl border border-pink-200">
                      <Truck className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>
                        <strong>رقم بوليصة الشحن:</strong>{' '}
                        <span className="font-mono font-bold text-rose-600">{order.trackingNumber}</span>
                      </span>
                    </div>
                  )}
                  <div className="text-stone-700">
                    <strong>الإجمالي المطلوب عند الاستلام:</strong>{' '}
                    <span className="text-base font-extrabold text-rose-600 font-sans">
                      {order.total} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in the order */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-rose-500" />
                  <span>القطع المطلوبة في هذه الشحنة:</span>
                </h3>
                <div className="divide-y divide-pink-100 border border-pink-100 rounded-2xl overflow-hidden">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, i: number) => (
                      <div key={i} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-pink-50/20 transition">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 border border-pink-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-800 text-xs sm:text-sm">{item.name}</div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              {item.size && <span>المقاس: <strong>{item.size}</strong></span>}
                              {item.color && <span>اللون: <strong>{item.color}</strong></span>}
                              <span>الكمية: <strong>{item.quantity || 1}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-rose-600 text-xs sm:text-sm whitespace-nowrap">
                          {item.price * (item.quantity || 1)} ج.م
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Direct WhatsApp Help for this specific order */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>معاينة مجانية للمنتجات عند الاستلام مع المندوب.</span>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `مرحباً فريق Fashion Zone ✨ أود الاستفسار عن طلبي كود ${order.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>استفسار عبر واتساب بخصوص هذا الطلب</span>
                </a>
              </div>
            </div>
          );
        })}

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm text-center space-y-1.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-pink-100 text-rose-500 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-800">مدة الشحن والتوصيل</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              من 2 إلى 4 أيام عمل لكافة محافظات مصر لباب البيت.
            </p>
          </div>

          <div className="bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm text-center space-y-1.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-pink-100 text-rose-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-800">حق المعاينة قبل الدفع</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              يمكنكِ فتح الشحنة والتأكد من الفستان والمقاس والخامة أمام المندوب.
            </p>
          </div>

          <div className="bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm text-center space-y-1.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-pink-100 text-rose-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-800">خدمة عملاء راقية</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              فريقنا متواجد يومياً لمساعدتك عبر واتساب على مدار الساعة.
            </p>
          </div>
        </div>

        {/* Back to store button */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            <span>العودة للتسوق وتصفح تشكيلة الأزياء الجديدة</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>

      </div>
    </div>
  );
}
