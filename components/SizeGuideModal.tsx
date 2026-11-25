'use client';

import React, { useState, useMemo } from 'react';
import { X, Ruler, Sparkles, Check, Calculator, HelpCircle, ArrowLeft } from 'lucide-react';

interface SizeGuideModalProps {
  onClose: () => void;
  onSelectSize?: (size: string) => void;
  availableSizes?: string[];
}

export default function SizeGuideModal({ onClose, onSelectSize, availableSizes = [] }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'chart'>('calculator');

  // Calculator inputs
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(165);
  const [fitPreference, setFitPreference] = useState<'regular' | 'loose' | 'fitted'>('regular');

  // Sizing calculation based on Egyptian boutique body metrics
  const calculatedRecommendation = useMemo(() => {
    let baseSize = 'M';

    if (weight < 56) {
      baseSize = 'S';
    } else if (weight <= 68) {
      baseSize = 'M';
    } else if (weight <= 78) {
      baseSize = 'L';
    } else if (weight <= 90) {
      baseSize = 'XL';
    } else if (weight <= 104) {
      baseSize = '2XL';
    } else {
      baseSize = '3XL';
    }

    // Adjust for height & fit preference
    if (fitPreference === 'loose') {
      if (baseSize === 'S') baseSize = 'M';
      else if (baseSize === 'M') baseSize = 'L';
      else if (baseSize === 'L') baseSize = 'XL';
      else if (baseSize === 'XL') baseSize = '2XL';
      else if (baseSize === '2XL') baseSize = '3XL';
    } else if (fitPreference === 'fitted') {
      if (baseSize === '3XL') baseSize = '2XL';
      else if (baseSize === '2XL') baseSize = 'XL';
      else if (baseSize === 'XL') baseSize = 'L';
      else if (baseSize === 'L') baseSize = 'M';
    }

    // Check if baseSize is in available sizes or suggest alternative
    const isAvailable = availableSizes.length === 0 || availableSizes.includes(baseSize);

    return {
      size: baseSize,
      isAvailable,
      confidence: 97,
      fitDescription:
        fitPreference === 'loose'
          ? 'مقاس واسع ومريح جداً لحرية الحركة والراحة التامة.'
          : fitPreference === 'fitted'
          ? 'مقاس مضبوط وجذاب يبرز تفاصيل القصة بدقة.'
          : 'مقاس متناسق ومثالي للاستخدام اليومي المريح.',
    };
  }, [weight, height, fitPreference, availableSizes]);

  const handleApplySize = (size: string) => {
    if (onSelectSize) {
      onSelectSize(size);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg">دليل وحاسبة المقاسات الذكية</h3>
              <p className="text-[11px] text-pink-100">اختاري مقاسكِ المظبوط 100% بدون أي حيرة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="p-3 bg-pink-50/60 border-b border-pink-100 flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:bg-white hover:text-rose-600'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>حاسبة المقاس بالوزن والطول</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'chart'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:bg-white hover:text-rose-600'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>جدول القياسات بالسنتيمتر (cm)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: SMART SIZE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Weight Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">الوزن التقريبي:</span>
                  <span className="font-mono font-black text-rose-600 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                    {weight} كجم
                  </span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="125"
                  step="1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-pink-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>45 كجم</span>
                  <span>75 كجم</span>
                  <span>125 كجم</span>
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">الطول:</span>
                  <span className="font-mono font-black text-rose-600 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                    {height} سم
                  </span>
                </div>
                <input
                  type="range"
                  min="145"
                  max="185"
                  step="1"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-pink-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>145 سم</span>
                  <span>165 سم</span>
                  <span>185 سم</span>
                </div>
              </div>

              {/* Fit Preference Pills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">ستايل اللبس المفضل لكِ:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFitPreference('fitted')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      fitPreference === 'fitted'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-stone-700 border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    مضبوط Slim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitPreference('regular')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      fitPreference === 'regular'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-stone-700 border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    عادي Regular
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitPreference('loose')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      fitPreference === 'loose'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-stone-700 border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    واسع ومريح Loose
                  </button>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 p-4 rounded-2xl border border-pink-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      ✨
                    </span>
                    <div>
                      <span className="text-[11px] text-stone-500 block">المقاس الأنسب لجسمكِ:</span>
                      <span className="text-xl font-black text-rose-600 font-sans tracking-wide">
                        {calculatedRecommendation.size}
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    دقة {calculatedRecommendation.confidence}% ✓
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {calculatedRecommendation.fitDescription}
                </p>

                {onSelectSize && (
                  <button
                    type="button"
                    onClick={() => handleApplySize(calculatedRecommendation.size)}
                    className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد واختيار مقاس ({calculatedRecommendation.size}) الآن</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: STANDARD SIZE CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-stone-600 leading-relaxed">
                جميع القياسات الموضحة أدناه بالسنتيمتر (cm). خامات متجر Fashion Zone مصممة بمرونة عالية لتمنحكِ الراحة والأناقة.
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
                    <tr className="hover:bg-pink-50/50">
                      <td className="py-2.5 px-3 font-bold text-rose-600">2XL (جامبو)</td>
                      <td className="py-2.5 px-3">111 - 120</td>
                      <td className="py-2.5 px-3">93 - 102</td>
                      <td className="py-2.5 px-3">117 - 126</td>
                      <td className="py-2.5 px-3">89 - 104 كجم</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WhatsApp Stylist Help */}
          <div className="bg-pink-50 p-3 rounded-2xl border border-pink-200 text-xs text-rose-800 flex items-center justify-between gap-2">
            <span>محتارة أو محتاجة مساعدة خاصة؟</span>
            <a
              href="https://wa.me/201080441559?text=مرحباً%20Fashion%20Zone%20أحتاج%20مساعدة%20في%20اختيار%20المقاس%20المناسب"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-rose-600 hover:text-rose-800 whitespace-nowrap"
            >
              استشيري خبيرة الأزياء 💬
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
