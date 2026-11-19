'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'فشل تسجيل الدخول، تأكدي من صحة البيانات');
      }
    } catch (err: any) {
      setError('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-pink-50/50 to-creamy-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-8 text-center text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black font-serif">لوحة تحكم Fashion Zone</h1>
          <p className="text-xs text-pink-100 mt-1">تسجيل دخول مديرة المتجر</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@fashionzone.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                />
                <Mail className="w-4 h-4 text-rose-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                />
                <Lock className="w-4 h-4 text-rose-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-soft-pink flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm mt-2"
            >
              {loading ? (
                <span>جاري التحقق...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Quick info */}
          <div className="pt-4 border-t border-pink-100 flex items-center justify-between text-xs text-stone-500">
            <Link href="/" className="hover:text-rose-600 transition flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة للمتجر</span>
            </Link>
            <span className="text-[11px] text-stone-400">نظام أمان مشفر 🔒</span>
          </div>

        </div>

      </div>
    </div>
  );
}
