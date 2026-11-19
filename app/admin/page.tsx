'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  CheckCircle2,
  X,
  ExternalLink,
  Store,
  RefreshCw,
  Clock,
  Phone,
  MapPin,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: { name: string };
  images: string[];
  inStock: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'products' | 'orders'>('add');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'وردي ناعم', hex: '#fecdd3' },
  ]);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'مقاس موحد', '52', '54', '56', '58'];
  const presetColors = [
    { name: 'وردي ناعم', hex: '#fecdd3' },
    { name: 'روز جولد', hex: '#b76e79' },
    { name: 'أبيض لؤلؤي', hex: '#fdfbf9' },
    { name: 'أسود ملكي', hex: '#1c1917' },
    { name: 'كافيه هادئ', hex: '#c79e97' },
    { name: 'سماوي باستيل', hex: '#bae6fd' },
    { name: 'أحمر قرمزي', hex: '#f43f5e' },
  ];

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [catsRes, prodsRes, ordersRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();
      const ordersData = await ordersRes.json();

      if (catsData.success) {
        setCategories(catsData.categories);
        if (catsData.categories.length > 0 && !categoryId) {
          setCategoryId(catsData.categories[0].id);
        }
      }
      if (prodsData.success) {
        setProducts(prodsData.products);
      }
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentAdmin(data.admin);
          setAuthLoading(false);
          fetchData();
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  // Automated image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          setUploadedImages((prev) => [...prev, data.url]);
        } else {
          alert('تعذر رفع الصورة: ' + (data.error || 'خطأ غير معروف'));
        }
      }
    } catch (err: any) {
      alert('خطأ أثناء الرفع: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeUploadedImage = (urlToRemove: string) => {
    setUploadedImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    setSelectedColors((prev) => {
      const exists = prev.some((c) => c.name === color.name);
      return exists ? prev.filter((c) => c.name !== color.name) : [...prev, color];
    });
  };

  // Submit new product to MySQL
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedImages.length === 0) {
      alert('يرجى رفع صورة واحدة على الأقل للمنتج!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameEn,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          categoryId,
          images: uploadedImages,
          sizes: selectedSizes,
          colors: selectedColors,
          isFeatured,
          isNewArrival,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}

        setSuccessMessage(`تمت إضافة منتج "${name}" بنجاح وتخزينه في MySQL!`);
        // Reset form
        setName('');
        setNameEn('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setUploadedImages([]);
        fetchData(); // Refresh list

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert('حدث خطأ: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف "${prodName}" من المتجر وقاعدة البيانات؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSuccessMessage(`تم حذف منتج "${prodName}" بنجاح.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر حذف المنتج: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
  };

  // Toggle inStock
  const handleToggleStock = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: !p.inStock } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pink-50/50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-rose-500 animate-spin mb-3"></div>
        <p className="text-xs font-bold text-stone-600">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 pb-16">
      
      {/* Top Admin Header */}
      <div className="bg-white border-b border-pink-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-soft-pink">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 font-serif">
                لوحة تحكم Fashion Zone 🛍️
              </h1>
              <p className="text-[11px] text-stone-500">
                مرحباً بكِ، {currentAdmin?.name || 'مديرة المتجر'} ({currentAdmin?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 py-2 px-3.5 rounded-full transition"
            >
              <Store className="w-4 h-4" />
              <span>المتجر</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-red-600 bg-stone-100 hover:bg-red-50 py-2 px-3.5 rounded-full transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 border-t border-stone-100 pt-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد (رفع صور تلقائي)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات الحالية ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات الواردة ({orders.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: ADD NEW PRODUCT
        ======================================================== */}
        {activeTab === 'add' && (
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-stone-900">إضافة قطعة أزياء جديدة إلى المتجر</h2>
              <p className="text-xs text-stone-500 mt-1">
                املأي البيانات أدناه، وسيتم رفع الصور أوتوماتيكياً إلى Cloudinary وتخزين كافة التفاصيل في MySQL.
              </p>
            </div>

            {/* Product Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  اسم المنتج بالعربية: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فستان شيفون مورد ناعم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  الاسم بالإنجليزية (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="Floral Summer Maxi Dress"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/10"
                />
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  قسم المتجر: <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  سعر البيع (جنيه): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="650"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  السعر الأصلي قبل الخصم (اختياري):
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="850"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/10"
                />
              </div>
            </div>

            {/* AUTOMATED IMAGE UPLOAD (CLOUDINARY) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                صور المنتج (رفع تلقائي عبر Cloudinary): <span className="text-rose-500">*</span>
              </label>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-pink-200 hover:border-rose-400 rounded-3xl p-6 text-center bg-pink-50/30 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-pink-100 text-rose-500 flex items-center justify-center">
                    {uploadingImage ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">
                      {uploadingImage
                        ? 'جاري ضغط ورفع الصور تلقائياً إلى Cloudinary...'
                        : 'انقري لاختيار الصور أو اسحبيها وأفلتيها هنا'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      يتم تحويل الصور تلقائياً لصيغة WebP فائقة السرعة بدون أي استهلاك لمساحة الاستضافة
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Thumbnails Preview */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {uploadedImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 rounded-2xl overflow-hidden border border-pink-200 group bg-white shadow-sm"
                    >
                      <Image src={url} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(url)}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                        title="حذف الصورة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                وصف وتفاصيل المنتج: <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="تفاصيل القماش، قصة الفستان، المناسبات المناسبة، إرشادات الغسيل..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/10 leading-relaxed"
              ></textarea>
            </div>

            {/* Sizes & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-pink-100">
              {/* Sizes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  المقاسات المتوفرة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedSizes.includes(size)
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-white text-stone-700 border-pink-200 hover:border-rose-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  الألوان المتوفرة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => {
                    const isSelected = selectedColors.some((c) => c.name === color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-pink-100 text-rose-700 border-rose-400'
                            : 'bg-white text-stone-700 border-pink-200 hover:border-rose-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Badges / Switches */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-pink-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>عرض في قائمة "الأكثر طلباً" في الصفحة الرئيسية</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>تمييز بوسام "وصل حديثاً ✨"</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-pink-100">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-soft-pink flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span>حفظ ونشر المنتج في المتجر</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            TAB 2: PRODUCT INVENTORY LIST
        ======================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">مخزون المنتجات في MySQL</h2>
                <p className="text-xs text-stone-500">إجمالي القطع المعروضة في المتجر: {products.length}</p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-stone-600 hover:text-rose-600 rounded-xl hover:bg-pink-50 transition"
                title="تحديث القائمة"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-pink-100">
              <table className="w-full text-xs text-right">
                <thead className="bg-pink-50 text-stone-700 font-bold">
                  <tr>
                    <th className="py-3 px-4">الصورة</th>
                    <th className="py-3 px-4">اسم المنتج</th>
                    <th className="py-3 px-4">القسم</th>
                    <th className="py-3 px-4">السعر</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50 font-medium text-stone-700">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-pink-50/30">
                      <td className="py-2.5 px-4">
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-pink-50">
                          <Image src={prod.images[0]} alt="" fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">
                        {prod.name}
                      </td>
                      <td className="py-2.5 px-4 text-rosegold-600">
                        {prod.category?.name || 'عام'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-rose-600">
                        {prod.price} جنيه
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => handleToggleStock(prod)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {prod.inStock ? 'متوفر (In Stock)' : 'نفد (Out of Stock)'}
                        </button>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 text-rose-600 hover:bg-pink-50 rounded-lg transition"
                            title="معاينة المنتج"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="حذف المنتج نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: INCOMING ORDERS
        ======================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">سجل الطلبات الواردة (MySQL)</h2>
                <p className="text-xs text-stone-500">إجمالي الطلبات المستلمة: {orders.length}</p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-stone-600 hover:text-rose-600 rounded-xl hover:bg-pink-50 transition"
                title="تحديث الطلبات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-pink-50/40 rounded-2xl border border-pink-100">
                <ShoppingBag className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                <p className="text-xs text-stone-600 font-bold">لا توجد طلبات جديدة حتى الآن</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  بمجرد أن تقوم عميلة بطلب فستان عبر الواتساب أو السلة، سيظهر طلبها هنا مباشرة!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-pink-100">
                <table className="w-full text-xs text-right">
                  <thead className="bg-pink-50 text-stone-700 font-bold">
                    <tr>
                      <th className="py-3 px-4">رقم الطلب</th>
                      <th className="py-3 px-4">العميلة</th>
                      <th className="py-3 px-4">الهاتف</th>
                      <th className="py-3 px-4">العنوان</th>
                      <th className="py-3 px-4">المبلغ</th>
                      <th className="py-3 px-4">حالة الطلب</th>
                      <th className="py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50 font-medium text-stone-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-pink-50/30">
                        <td className="py-3 px-4 font-bold text-rose-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          {order.customerName}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700">
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </a>
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                          {order.customerAddress}
                        </td>
                        <td className="py-3 px-4 font-black text-stone-900">
                          {order.total} جنيه
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-xl border focus:outline-none transition ${
                              order.status === 'CONFIRMED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : order.status === 'SHIPPED'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : order.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="PENDING">قيد الانتظار (Pending)</option>
                            <option value="CONFIRMED">تم التأكيد (Confirmed)</option>
                            <option value="SHIPPED">تم الشحن (Shipped)</option>
                            <option value="DELIVERED">تم التوصيل (Delivered)</option>
                            <option value="CANCELLED">ملغي (Cancelled)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-stone-400 text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
