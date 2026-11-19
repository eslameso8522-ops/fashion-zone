'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  onClose: () => void;
}

export default function SizeGuideModal({ onClose }: SizeGuideModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-pink-200" />
            <h3 className="font-bold text-lg">جدول المقاسات القياسي (Size Guide)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            جميع القياسات الموضحة أدناه بالسنتيمتر (cm). إذا كنتِ محتارة بين مقاسين، ننصحكِ باختيار المقاس الأكبر لضمان الراحة.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-pink-100">
            <table className="w-full text-xs text-center">
              <thead className="bg-pink-100/70 text-rose-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">المقاس</th>
                  <th className="py-2.5 px-3">محيط الصدر</th>
                  <th className="py-2.5 px-3">محيط الخصر</th>
                  <th className="py-2.5 px-3">محيط الأرداف</th>
                  <th className="py-2.5 px-3">الوزن التقريبي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 font-medium text-stone-700">
                <tr className="hover:bg-pink-50/50">
                  <td className="py-2.5 px-3 font-bold text-rose-600">S (صغير)</td>
                  <td className="py-2.5 px-3">84 - 88</td>
                  <td className="py-2.5 px-3">66 - 70</td>
                  <td className="py-2.5 px-3">90 - 94</td>
                  <td className="py-2.5 px-3">50 - 58 كجم</td>
                </tr>
                <tr className="hover:bg-pink-50/50">
                  <td className="py-2.5 px-3 font-bold text-rose-600">M (وسط)</td>
                  <td className="py-2.5 px-3">89 - 94</td>
                  <td className="py-2.5 px-3">71 - 76</td>
                  <td className="py-2.5 px-3">95 - 100</td>
                  <td className="py-2.5 px-3">59 - 68 كجم</td>
                </tr>
                <tr className="hover:bg-pink-50/50">
                  <td className="py-2.5 px-3 font-bold text-rose-600">L (كبير)</td>
                  <td className="py-2.5 px-3">95 - 102</td>
                  <td className="py-2.5 px-3">77 - 84</td>
                  <td className="py-2.5 px-3">101 - 108</td>
                  <td className="py-2.5 px-3">69 - 78 كجم</td>
                </tr>
                <tr className="hover:bg-pink-50/50">
                  <td className="py-2.5 px-3 font-bold text-rose-600">XL (خاص)</td>
                  <td className="py-2.5 px-3">103 - 110</td>
                  <td className="py-2.5 px-3">85 - 92</td>
                  <td className="py-2.5 px-3">109 - 116</td>
                  <td className="py-2.5 px-3">79 - 88 كجم</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-pink-50 p-3 rounded-xl border border-pink-200 text-xs text-rose-700 flex items-center justify-between">
            <span>هل ما زلتِ غير متأكدة؟</span>
            <a
              href="https://wa.me/201000000000?text=مرحباً%20Fashion%20Zone%20أحتاج%20مساعدة%20في%20اختيار%20المقاس%20المناسب"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-rose-800 hover:text-rose-950"
            >
              استشيري خبيرة الأزياء عبر واتساب
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
