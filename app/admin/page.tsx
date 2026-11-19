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
  Layers,
  Settings,
  BarChart3,
  Truck,
  Eye,
  EyeOff,
  MessageCircle,
  Share2,
  Search,
  Check,
  Save,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  showInNavbar: boolean;
  orderIndex: number;
  itemCount?: number;
}

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: { name: string; id?: string };
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
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
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

interface SiteSettings {
  storeName: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  announcementText: string;
  announcementEnabled: boolean;
}

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'settings';

export default function AdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Main data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    storeName: 'Fashion Zone',
    whatsappNumber: '201000000000',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    announcementText: 'تألقي مع تشكيلة Fashion Zone الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم: GIRL10',
    announcementEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Product Form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Category Form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatShowInNavbar, setNewCatShowInNavbar] = useState(true);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  // Orders filter & tracking edit
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  // Settings saving state
  const [savingSettings, setSavingSettings] = useState(false);

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
      const [catsRes, prodsRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/settings'),
      ]);

      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();
      const ordersData = await ordersRes.json();
      const settingsData = await settingsRes.json();

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
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
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

  // 1. Upload Product Image to Cloudinary
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // 2. Upload Category Image to Cloudinary
  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCatImage(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setNewCatImage(data.url);
      } else {
        alert('تعذر رفع صورة القسم: ' + (data.error || 'خطأ'));
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setUploadingCatImage(false);
      e.target.value = '';
    }
  };

  // Add Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatImage) {
      alert('يرجى كتابة اسم القسم ورفع صورته أولاً!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          image: newCatImage,
          showInNavbar: newCatShowInNavbar,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`تم إنشاء قسم "${newCatName}" بنجاح!`);
        confetti({ particleCount: 50, spread: 60 });
        setNewCatName('');
        setNewCatImage('');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('خطأ: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Category Navbar Display
  const handleToggleCategoryNavbar = async (cat: CategoryItem) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          showInNavbar: !cat.showInNavbar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, showInNavbar: !c.showInNavbar } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`هل أنتِ متأكدة من حذف قسم "${cat.name}" وجميع المنتجات المرتبطة به؟`)) return;

    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setSuccessMessage(`تم حذف قسم "${cat.name}" بنجاح.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر حذف القسم: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
  };

  // Add Product Submit
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
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage(`تمت إضافة منتج "${name}" بنجاح!`);
        setName('');
        setNameEn('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setUploadedImages([]);
        setShowAddProductModal(false);
        fetchData();
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

  // Update order tracking number
  const handleSaveTrackingNumber = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, trackingNumber: tempTrackingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, trackingNumber: tempTrackingNumber } : o))
        );
        setEditingTrackingId(null);
        setTempTrackingNumber('');
        setSuccessMessage('تم تحديث رقم بوليصة التتبع للطلب بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 60, spread: 50 });
        setSuccessMessage('تم حفظ إعدادات المتجر والسوشيال ميديا وشريط الإعلانات بنجاح!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert('خطأ أثناء حفظ الإعدادات: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Calculations for Overview Stats
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const shippedOrdersCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const navbarCatsCount = categories.filter((c) => c.showInNavbar).length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'ALL' || o.status === orderFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery);
    return matchesStatus && matchesSearch;
  });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-soft-pink">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-stone-900 font-serif">
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
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 py-2 px-3.5 rounded-full transition"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">معاينة المتجر</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              href="/track"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 py-2 px-3.5 rounded-full transition"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">صفحة التتبع</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2 border-t border-pink-50 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والمخزون ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام والناف بار ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'orders'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات والشحن ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المتجر والسوشيال</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="p-1 text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN BODY PER TAB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW & STATS */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-semibold">إجمالي المبيعات المؤكدة</span>
                  <div className="text-2xl font-black text-rose-600 font-sans mt-1">
                    {totalRevenue.toLocaleString()} ج.م
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">من الطلبات النشطة</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-semibold">عدد الطلبات الإجمالي</span>
                  <div className="text-2xl font-black text-stone-900 font-sans mt-1">
                    {orders.length} طلب
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
                    {pendingOrdersCount} قيد الانتظار والتأكيد
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-semibold">المنتجات في المتجر</span>
                  <div className="text-2xl font-black text-stone-900 font-sans mt-1">
                    {products.length} قطعة
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                    {inStockCount} متوفر بالمخزون
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-rose-500 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-semibold">أقسام المتجر والناف بار</span>
                  <div className="text-2xl font-black text-stone-900 font-sans mt-1">
                    {categories.length} قسم
                  </div>
                  <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">
                    {navbarCatsCount} يظهر في الناف بار
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-right">
                <h3 className="text-lg font-bold">تحكم كامل ومباشر في متجر Fashion Zone ✨</h3>
                <p className="text-xs text-pink-100">
                  يمكنكِ إضافة منتجات جديدة بصور Cloudinary، التحكم في أقسام الناف بار، وتعديل رقم الواتساب بضغطة زر واحدة.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setShowAddProductModal(true);
                  }}
                  className="bg-white text-rose-600 hover:bg-pink-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>تعديل أقسام الناف بار</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  <span>تعديل رقم الواتساب</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-500" />
                  <span>أحدث الطلبات الواردة</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  عرض كافة الطلبات ({orders.length}) ←
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  لا توجد طلبات مسجلة حتى الآن.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400">
                        <th className="pb-3 font-semibold">كود الطلب</th>
                        <th className="pb-3 font-semibold">العميلة</th>
                        <th className="pb-3 font-semibold">الهاتف</th>
                        <th className="pb-3 font-semibold">الإجمالي</th>
                        <th className="pb-3 font-semibold">الحالة</th>
                        <th className="pb-3 font-semibold">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-pink-50/30 transition">
                          <td className="py-3 font-mono font-bold text-rose-600">{order.orderNumber}</td>
                          <td className="py-3 font-bold text-stone-800">{order.customerName}</td>
                          <td className="py-3 text-stone-600">{order.customerPhone}</td>
                          <td className="py-3 font-bold text-stone-900">{order.total} ج.م</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'PREPARING'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {order.status === 'PENDING'
                                ? 'قيد الانتظار'
                                : order.status === 'PREPARING'
                                ? 'جاري التجهيز'
                                : order.status === 'SHIPPED'
                                ? 'تم الشحن'
                                : order.status === 'DELIVERED'
                                ? 'تم التوصيل'
                                : 'ملغي'}
                            </span>
                          </td>
                          <td className="py-3 text-stone-400">
                            {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900">إدارة المنتجات والمخزون</h2>
                <p className="text-xs text-stone-500">إضافة وتعديل وحذف المنتجات ورفع الصور تلقائياً لـ Cloudinary</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(!showAddProductModal)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProductModal ? 'إغلاق نافذة الإضافة' : 'إضافة منتج جديد'}</span>
              </button>
            </div>

            {/* Product Add Form (Collapsible/Modal) */}
            {showAddProductModal && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-md animate-scaleUp">
                <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <span>إضافة منتج نسائي جديد للمتجر</span>
                  </h3>
                  <button
                    onClick={() => setShowAddProductModal(false)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">اسم المنتج (بالعربي) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: فستان سهرة وردي مطرز"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">الاسم بالإنجليزية (اختياري)</label>
                      <input
                        type="text"
                        placeholder="e.g. Pink Embroidered Evening Dress"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">السعر بالجنيه (EGP) *</label>
                      <input
                        type="number"
                        required
                        placeholder="850"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">السعر قبل الخصم (اختياري)</label>
                      <input
                        type="number"
                        placeholder="1100"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">القسم التابع له *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">وصف المنتج وتفاصيل الخامة والمظهر *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="اكتبي وصفاً جذاباً للفستان أو العباية يوضح روعة الخامة والتفاصيل الأنيقة..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                    ></textarea>
                  </div>

                  {/* Cloudinary Automated Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700">
                      صور المنتج (رفع تلقائي سحابي مجاني على Cloudinary) *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((imgUrl, i) => (
                        <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden border border-pink-200 group">
                          <Image src={imgUrl} alt="Uploaded" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((u) => u !== imgUrl))}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-90 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <label className="w-20 h-24 rounded-xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/50 hover:bg-pink-50 flex flex-col items-center justify-center cursor-pointer transition">
                        <Upload className="w-5 h-5 text-rose-500 mb-1" />
                        <span className="text-[10px] font-bold text-rose-600">
                          {uploadingImage ? 'جاري الرفع...' : 'رفع صورة'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleProductImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">المقاسات المتوفرة:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() =>
                              setSelectedSizes((prev) =>
                                prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                : 'bg-white text-stone-600 border-pink-200 hover:border-rose-300'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingImage}
                      className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      {loading ? (
                        <span>جاري الحفظ في MySQL...</span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>نشر المنتج في المتجر</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-pink-100 text-stone-400">
                      <th className="pb-3 font-semibold">الصورة</th>
                      <th className="pb-3 font-semibold">اسم المنتج</th>
                      <th className="pb-3 font-semibold">القسم</th>
                      <th className="pb-3 font-semibold">السعر</th>
                      <th className="pb-3 font-semibold">حالة التوفر</th>
                      <th className="pb-3 font-semibold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-pink-50/20 transition">
                        <td className="py-3">
                          <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-pink-50 border border-pink-100">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">بدون</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-bold text-stone-800">
                          <div>{product.name}</div>
                          {product.nameEn && <div className="text-[10px] text-stone-400">{product.nameEn}</div>}
                        </td>
                        <td className="py-3 text-stone-600">{product.category?.name || 'غير محدد'}</td>
                        <td className="py-3 font-bold text-rose-600">{product.price} ج.م</td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleStock(product)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                              product.inStock
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {product.inStock ? 'متوفر بالمخزون ✓' : 'نفذت الكمية ✕'}
                          </button>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-pink-50"
                              title="معاينة في المتجر"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                              title="حذف المنتج"
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
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CATEGORIES & NAVBAR CONTROL */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-stone-900">إدارة الأقسام والتحكم بالناف بار</h2>
              <p className="text-xs text-stone-500">
                يمكنكِ هنا تحديد الأقسام التي تظهر في شريط التنقل العلوي (الناف بار) وإضافة أقسام جديدة بصورها.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Category Form (Left / Col 1) */}
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 h-fit">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  <span>إضافة قسم جديد</span>
                </h3>

                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">اسم القسم *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: فساتين خطوبة، طرح وشيلان..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">صورة القسم الغلاف *</label>
                    {newCatImage ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-pink-200 mb-2">
                        <Image src={newCatImage} alt="Category preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewCatImage('')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-28 rounded-xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/40 flex flex-col items-center justify-center cursor-pointer transition">
                        <Upload className="w-5 h-5 text-rose-500 mb-1" />
                        <span className="text-xs font-bold text-rose-600">
                          {uploadingCatImage ? 'جاري الرفع لـ Cloudinary...' : 'رفع صورة القسم'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageUpload}
                          disabled={uploadingCatImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                    <input
                      type="checkbox"
                      id="showInNavbar"
                      checked={newCatShowInNavbar}
                      onChange={(e) => setNewCatShowInNavbar(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                    />
                    <label htmlFor="showInNavbar" className="text-xs font-bold text-stone-700 cursor-pointer">
                      إظهار في الناف بار العلوي تلقائياً
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploadingCatImage}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء القسم وحفظه</span>
                  </button>
                </form>
              </div>

              {/* Categories List (Right / Col 2-3) */}
              <div className="lg:col-span-2 space-y-3">
                <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <span className="text-xs font-bold text-stone-700">الأقسام الحالية والظهور في الناف بار</span>
                    <span className="text-xs text-rose-600 font-bold">
                      {navbarCatsCount} أقسام مفعلة في الناف بار
                    </span>
                  </div>

                  <div className="divide-y divide-pink-50">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-pink-50/20 transition px-2 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-pink-50 border border-pink-100 flex-shrink-0">
                            {cat.image ? (
                              <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">بدون</div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{cat.name}</h4>
                            <span className="text-[11px] text-stone-500">
                              {cat.itemCount !== undefined ? `${cat.itemCount} منتج` : 'قسم نشط'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Navbar Visibility */}
                          <button
                            onClick={() => handleToggleCategoryNavbar(cat)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              cat.showInNavbar
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                            }`}
                            title="تبديل الظهور في الناف بار"
                          >
                            {cat.showInNavbar ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>يظهر بالناف بار ✓</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                <span>مخفي من الناف بار</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف القسم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ORDERS & TRACKING MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900">إدارة الطلبات والشحن وتتبع الشحنات</h2>
                <p className="text-xs text-stone-500">
                  تغيير حالة الطلب وإصدار أرقام بوليصات الشحن ومراسلة العملاء عبر واتساب مباشرة
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-pink-100">
                {['ALL', 'PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      orderFilter === st
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-pink-50'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'الكل'
                      : st === 'PENDING'
                      ? 'قيد المراجعة'
                      : st === 'PREPARING'
                      ? 'جاري التجهيز'
                      : st === 'SHIPPED'
                      ? 'تم الشحن'
                      : st === 'DELIVERED'
                      ? 'تم التوصيل'
                      : 'ملغي'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Orders */}
            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="ابحثي برقم الطلب (FZ-123456) أو اسم العميلة أو رقم الهاتف..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
              />
              {orderSearchQuery && (
                <button onClick={() => setOrderSearchQuery('')} className="text-stone-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 text-stone-400 text-xs">
                لا توجد طلبات تطابق هذا التصفية أو البحث.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isEditingTracking = editingTrackingId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-100">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-stone-400">
                            {new Date(order.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-500">حالة الطلب:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'SHIPPED'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : order.status === 'PREPARING'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : order.status === 'CANCELLED'
                                ? 'bg-stone-100 text-stone-600 border-stone-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="PENDING">⏳ قيد المراجعة والتأكيد</option>
                            <option value="PREPARING">🎀 جاري التجهيز والتغليف</option>
                            <option value="SHIPPED">🚚 تم التسليم لمندوب الشحن</option>
                            <option value="DELIVERED">🎉 تم التوصيل بنجاح</option>
                            <option value="CANCELLED">✕ تم الإلغاء</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details & Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-stone-800 text-sm">{order.customerName}</div>
                          <div className="flex items-center gap-1.5 text-stone-600">
                            <Phone className="w-3.5 h-3.5 text-rose-500" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-stone-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                            <span className="leading-tight">{order.customerAddress}</span>
                          </div>
                        </div>

                        {/* Tracking Number Section */}
                        <div className="space-y-1.5 bg-pink-50/40 p-3 rounded-2xl border border-pink-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-rose-500" />
                              <span>رقم بوليصة الشحن (تتبع):</span>
                            </span>
                          </div>

                          {isEditingTracking ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="مثال: ARAMEX-98421"
                                value={tempTrackingNumber}
                                onChange={(e) => setTempTrackingNumber(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-pink-300 bg-white"
                              />
                              <button
                                onClick={() => handleSaveTrackingNumber(order.id)}
                                className="bg-emerald-500 text-white p-1.5 rounded-xl hover:bg-emerald-600"
                                title="حفظ"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingTrackingId(null)}
                                className="bg-stone-200 text-stone-600 p-1.5 rounded-xl"
                                title="إلغاء"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-stone-800">
                                {order.trackingNumber || 'لم يتم إدخال بوليصة بعد'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingTrackingId(order.id);
                                  setTempTrackingNumber(order.trackingNumber || '');
                                }}
                                className="text-[10px] text-rose-600 font-bold hover:underline"
                              >
                                {order.trackingNumber ? 'تعديل' : '+ إضافة رقم بوليصة'}
                              </button>
                            </div>
                          )}
                          <p className="text-[10px] text-stone-400">يظهر فوراً للعميلة في صفحة تتبع الطلبات</p>
                        </div>

                        {/* Order Total & Direct WhatsApp Chat */}
                        <div className="flex flex-col justify-between items-start md:items-end gap-2">
                          <div className="text-right">
                            <span className="text-[11px] text-stone-500">إجمالي الطلب:</span>
                            <div className="text-lg font-black text-rose-600 font-sans">{order.total} ج.م</div>
                          </div>

                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `مرحباً يا فندم من متجر Fashion Zone بخصوص طلبكِ رقم ${order.orderNumber}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>مراسلة العميلة واتساب</span>
                          </a>
                        </div>
                      </div>

                      {/* Items Ordered list */}
                      <div className="pt-2 border-t border-pink-50">
                        <span className="text-[11px] font-bold text-stone-500 block mb-2">القطع المطلوبة:</span>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(order.items) &&
                            order.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                              >
                                <span className="font-bold text-stone-800">{item.name}</span>
                                {item.size && <span className="text-stone-500">({item.size})</span>}
                                <span className="text-rose-600 font-bold">x{item.quantity || 1}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: SITE SETTINGS & SOCIAL MEDIA */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-stone-900">إعدادات المتجر والتواصل الاجتماعي</h2>
              <p className="text-xs text-stone-500">
                تعديل رقم الواتساب الذي يستقبل الطلبات، وروابط فيسبوك وانستجرام وتيك توك، وشريط الإعلانات الترويجي
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
              
              {/* WhatsApp Number */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>رقم الواتساب الرئيسي لاستقبال الطلبات والاستفسارات *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 201000000000 مع كود الدولة"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono"
                />
                <p className="text-[11px] text-stone-400">
                  هذا الرقم هو الذي تذهب إليه محادثات العملاء فور الضغط على زر "طلب عبر واتساب" أو أيقونة المساعدة العائمة.
                </p>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 pt-4 border-t border-pink-100">
                <h3 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-rose-500" />
                  <span>روابط منصات التواصل الاجتماعي (تظهر في الفوتر والناف بار)</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">رابط صفحة الفيسبوك (Facebook)</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/your-page"
                    value={settings.facebookUrl}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">رابط حساب الإنستغرام (Instagram)</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/your-brand"
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">رابط حساب التيك توك (TikTok)</label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@your-brand"
                    value={settings.tiktokUrl}
                    onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono"
                  />
                </div>
              </div>

              {/* Announcement Bar & In-app promo */}
              <div className="space-y-4 pt-4 border-t border-pink-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>شريط الإعلانات الترويجي العلوي (Announcement Bar)</span>
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.announcementEnabled}
                      onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                    />
                    <span className="text-xs font-bold text-stone-700">تفعيل الشريط</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">نص الإعلان أو العرض الترويجي</label>
                  <textarea
                    rows={2}
                    value={settings.announcementText}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    placeholder="اكتبي العرض الذي يظهر أعلى شاشة الموقع ولعميلات تطبيق PWA..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                  ></textarea>
                </div>
              </div>

              {/* Submit Save */}
              <div className="pt-4 border-t border-pink-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  {savingSettings ? (
                    <span>جاري حفظ الإعدادات...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ كافة التعديلات في قاعدة البيانات</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
