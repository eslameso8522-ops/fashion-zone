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
  Tag,
  Megaphone,
  Gift,
  Copy,
  Star,
  Edit2,
  Smartphone,
  Calculator,
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
  code?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: { name: string; id?: string };
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  inStock: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
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
  discountAmount?: number;
  couponCode?: string;
  status: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
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
  promoPopupTitle?: string;
  promoPopupText?: string;
  promoPopupImage?: string;
  promoCouponCode?: string;
  promoPopupEnabled?: boolean;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  heroBannerBadge?: string;
  heroBannerCtaText?: string;
  heroBannerCtaLink?: string;
  heroBannerImage?: string;
  heroBannerEnabled?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroBadgeText?: string;
  heroBadgeSubtext?: string;
  heroCouponTitle?: string;
  heroCouponCode?: string;
  heroCouponDiscount?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
}

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'coupons' | 'ads_settings';

export default function AdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Main data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    storeName: 'Fashion Zone',
    whatsappNumber: '201000000000',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    announcementText: 'تألقي مع تشكيلة Fashion Zone الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم: GIRL10',
    announcementEnabled: true,
    promoPopupTitle: 'عرض خاص وحصري لكِ يا جميلة ✨',
    promoPopupText: 'خصم إضافي 10% بمناسبة إطلاق التشكيلة الجديدة! استخدمي كود الخصم الآن واستمتعي بشحن سريع لباب بيتك.',
    promoPopupImage: '',
    promoCouponCode: 'GIRL10',
    promoPopupEnabled: true,
    heroTitle: 'كوني الأجمل في كل إطلالة مع Fashion Zone',
    heroSubtitle: 'اكتشفي تشكيلة راقية ومختارة بعناية من فساتين السهرة الناعمة، العبايات المطرزة، الحقائب والمجوهرات التي تزيدكِ تألقاً وسحراً.',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
    heroBadgeText: 'أعلى تقييم ⭐ 4.9',
    heroBadgeSubtext: 'أزياء صيف 2026',
    heroCouponTitle: 'كود الخصم الفوري',
    heroCouponCode: 'GIRL10',
    heroCouponDiscount: 'خصم 10%',
    heroCtaText: 'تسوقي الآن / Shop Now',
    heroCtaLink: '#catalog',
    heroBannerTitle: 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!',
    heroBannerSubtitle: 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.',
    heroBannerBadge: 'عرض محدود لفترة وجيزة',
    heroBannerCtaText: 'تصفحي العروض الآن',
    heroBannerCtaLink: '#catalog',
    heroBannerImage: '',
    heroBannerEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Product Form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
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

  // Manual Order Creation states
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCustomerAddress, setManualCustomerAddress] = useState('');
  const [manualProductCode, setManualProductCode] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductPrice, setManualProductPrice] = useState('');
  const [manualProductSize, setManualProductSize] = useState('M');
  const [manualProductColor, setManualProductColor] = useState('أسود');
  const [manualNotes, setManualNotes] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Product Reviews Builder states
  const [productReviews, setProductReviews] = useState<Array<{
    id: string;
    name: string;
    rating: number;
    comment: string;
    city?: string;
    date: string;
    verified: boolean;
  }>>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Category Form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatShowInNavbar, setNewCatShowInNavbar] = useState(true);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  // Category Edit states
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatShowInNavbar, setEditCatShowInNavbar] = useState(true);
  const [uploadingEditCatImage, setUploadingEditCatImage] = useState(false);

  // WhatsApp Smart Importer states
  const [showWhatsAppImporter, setShowWhatsAppImporter] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');

  // Coupon Form states
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState('PERCENTAGE');
  const [couponVal, setCouponVal] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('0');

  // Ad, Hero & Banner Image Uploader state
  const [uploadingAdImage, setUploadingAdImage] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingMidBannerImage, setUploadingMidBannerImage] = useState(false);
  const [showAdPreviewModal, setShowAdPreviewModal] = useState(false);

  // Orders filter & tracking edit
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  // Settings saving state
  const [savingSettings, setSavingSettings] = useState(false);

  // Custom Sizes states & Presets
  const [customSizeInput, setCustomSizeInput] = useState('');
  const standardSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const plusAndSpecialSizes = ['فري سايز', 'وان سايز', 'أوفر سايز', 'مقاس خاص', 'جامبو', '50', '52', '54', '56', '58'];
  const weightBasedSizes = ['يلبس 60-80 ك', 'يلبس 80-100 ك', 'يلبس 100-120 ك'];
  const kidsAndNumberSizes = ['مقاس 1', 'مقاس 2', 'مقاس 3', 'سنتين', '4 سنين', '6 سنين', '8 سنين', '10 سنين', '12 سنة', '14 سنة', '16 سنة'];

  // Product Edit states
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdNameEn, setEditProdNameEn] = useState('');
  const [editProdCode, setEditProdCode] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('');
  const [editProdCategoryId, setEditProdCategoryId] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdSizes, setEditProdSizes] = useState<string[]>([]);
  const [editProdCustomSizeInput, setEditProdCustomSizeInput] = useState('');
  const [editProdImages, setEditProdImages] = useState<string[]>([]);
  const [editProdInStock, setEditProdInStock] = useState(true);
  const [editProdIsNewArrival, setEditProdIsNewArrival] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Order Edit states
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [editOrderCustomerName, setEditOrderCustomerName] = useState('');
  const [editOrderCustomerPhone, setEditOrderCustomerPhone] = useState('');
  const [editOrderCustomerAddress, setEditOrderCustomerAddress] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState('PENDING');
  const [editOrderTrackingNumber, setEditOrderTrackingNumber] = useState('');
  const [editOrderTotal, setEditOrderTotal] = useState('');
  const [editOrderNotes, setEditOrderNotes] = useState('');
  const [editOrderItems, setEditOrderItems] = useState<Array<{
    name: string;
    code?: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
  }>>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [catsRes, prodsRes, ordersRes, settingsRes, couponsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/settings'),
        fetch('/api/coupons'),
      ]);

      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();
      const ordersData = await ordersRes.json();
      const settingsData = await settingsRes.json();
      const couponsData = await couponsRes.json();

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
      if (couponsData.success && couponsData.coupons) {
        setCoupons(couponsData.coupons);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  // Check persistent session on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;

    fetch('/api/admin/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
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
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('fz_admin_token');
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  // Upload Product Image to Cloudinary
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

  // Upload Category Image to Cloudinary
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

  // Upload Promo Ad Image to Cloudinary
  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAdImage(true);
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
        setSettings((prev) => ({ ...prev, promoPopupImage: data.url }));
        setSuccessMessage('تم رفع صورة الإعلان الترويجي بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert('خطأ أثناء رفع صورة الإعلان: ' + err.message);
    } finally {
      setUploadingAdImage(false);
      e.target.value = '';
    }
  };

  // Upload Hero Banner Image to Cloudinary
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHeroImage(true);
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
        setSettings((prev) => ({ ...prev, heroImage: data.url }));
        setSuccessMessage('تم رفع وتعيين صورة الهيدر بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر رفع الصورة: ' + (data.error || 'خطأ'));
      }
    } catch (err: any) {
      alert('خطأ أثناء الرفع: ' + err.message);
    } finally {
      setUploadingHeroImage(false);
      e.target.value = '';
    }
  };

  // Upload Mid-page Promo Banner Image to Cloudinary
  const handleMidBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMidBannerImage(true);
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
        setSettings((prev) => ({ ...prev, heroBannerImage: data.url }));
        setSuccessMessage('تم رفع صورة بنر العروض بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر رفع الصورة: ' + (data.error || 'خطأ'));
      }
    } catch (err: any) {
      alert('خطأ أثناء الرفع: ' + err.message);
    } finally {
      setUploadingMidBannerImage(false);
      e.target.value = '';
    }
  };
  const generateRealisticReviews = () => {
    const realisticTemplates = [
      {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        name: 'سارة محمود',
        city: 'القاهرة',
        rating: 5,
        comment: 'الخامة تحفة ما شاء الله والمقاس مظبوط جداً زي الصورة بالظبط، والتوصيل كان سريع في أقل من يومين! شكراً فاشون زون على الذوق والاهتمام ❤️',
        date: 'منذ يومين',
        verified: true,
      },
      {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        name: 'نورهان الشريف',
        city: 'الإسكندرية',
        rating: 5,
        comment: 'الموديل يجنن باللبس وملمس القماش ناعم وراقي جداً، الكل سألني عنه في المناسبة! تجربة تسوق راقية وهطلب تاني بالتأكيد ✨',
        date: 'منذ 4 أيام',
        verified: true,
      },
      {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        name: 'مريم كمال',
        city: 'الجيزة',
        rating: 5,
        comment: 'ما كنت متوقعة الجودة تكون بهالروعة بصراحة! التغليف أنيق جداً وريحة العطر مع اللبس فخمة، تستاهلوا 5 نجوم وأكثر 👌',
        date: 'منذ أسبوع',
        verified: true,
      },
    ];

    setProductReviews(realisticTemplates);
    confetti({ particleCount: 40, spread: 50 });
  };

  // Add Custom Review Manually
  const handleAddCustomReview = () => {
    if (!newReviewAuthor.trim()) {
      alert('يرجى كتابة اسم العميلة أولاً');
      return;
    }
    const newRev = {
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      name: newReviewAuthor.trim(),
      city: newReviewCity.trim() || 'مصر',
      rating: newReviewRating || 5,
      comment: newReviewComment.trim() || 'منتج ممتاز وخامة راقية جداً وتوصيل سريع، أنصح به بشدة!',
      date: 'اليوم',
      verified: true,
    };
    setProductReviews((prev) => [newRev, ...prev]);
    setNewReviewAuthor('');
    setNewReviewCity('');
    setNewReviewComment('');
  };

  // Create Category
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

  // Start Editing Category
  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatImage(cat.image);
    setEditCatShowInNavbar(cat.showInNavbar);
  };

  // Upload Edit Category Image to Cloudinary
  const handleEditCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingEditCatImage(true);
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
        setEditCatImage(data.url);
      } else {
        alert('تعذر رفع صورة القسم: ' + (data.error || 'خطأ'));
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setUploadingEditCatImage(false);
      e.target.value = '';
    }
  };

  // Update Category Submit (PATCH)
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editCatName.trim()) {
      alert('يرجى كتابة اسم القسم');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editCatName.trim(),
          image: editCatImage,
          showInNavbar: editCatShowInNavbar,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`تم تعديل قسم "${editCatName}" بنجاح! ✨`);
        confetti({ particleCount: 60, spread: 60 });
        setEditingCategory(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('خطأ أثناء التعديل: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Smart WhatsApp Post Parser
  const handleParseWhatsAppPost = () => {
    if (!whatsAppText.trim()) {
      alert('يرجى لصق نص المنشور من واتساب أولاً!');
      return;
    }

    const text = whatsAppText;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Name: usually the first non-empty line
    let extractedName = lines[0] || 'فستان سهرة جديد';
    extractedName = extractedName.replace(/^[•\-\*✨🔥👗🎀]+\s*/, '').trim();

    // 2. Price extraction
    let extractedPrice = '';
    let extractedOriginalPrice = '';
    const priceMatch = text.match(/(\d+[\d,.]*)\s*(?:جنيه|ج\.م|ج|egp)?\s*(?:بدل|بدلاً من|بدلا من|قبل الخصم)\s*(\d+[\d,.]*)/i);
    if (priceMatch) {
      extractedPrice = priceMatch[1].replace(/,/g, '');
      extractedOriginalPrice = priceMatch[2].replace(/,/g, '');
    } else {
      const singlePriceMatch = text.match(/(?:السعر|سعر|price)[:\s]*(\d+[\d,.]*)/i) || text.match(/(\d{2,5})\s*(?:جنيه|ج\.م|ج)/);
      if (singlePriceMatch) {
        extractedPrice = singlePriceMatch[1].replace(/,/g, '');
      }
    }

    // 3. Sizes extraction
    const detectedSizes: string[] = [];
    const sizesKeywords = ['S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'مقاس موحد', '52', '54', '56', '58'];
    sizesKeywords.forEach((sz) => {
      const regex = new RegExp(`\\b${sz}\\b`, 'i');
      if (regex.test(text) || (sz === 'مقاس موحد' && text.includes('مقاس موحد')) || (sz === 'XXL' && (text.includes('XXL') || text.includes('2XL')))) {
        if (!detectedSizes.includes(sz === '2XL' ? 'XXL' : sz)) {
          detectedSizes.push(sz === '2XL' ? 'XXL' : sz);
        }
      }
    });

    // 4. Colors extraction
    const colorDictionary: { [key: string]: string } = {
      'أسود': '#18181b',
      'اسود': '#18181b',
      'أبيض': '#ffffff',
      'ابيض': '#ffffff',
      'وردي': '#f472b6',
      'روز': '#fb7185',
      'كشمير': '#e0a899',
      'نبيتي': '#881337',
      'أحمر': '#e11d48',
      'احمر': '#e11d48',
      'زيتي': '#3f6212',
      'أخضر': '#15803d',
      'اخضر': '#15803d',
      'كحلي': '#1e3a8a',
      'أزرق': '#2563eb',
      'ازرق': '#2563eb',
      'بيج': '#f5f5dc',
      'سيمون': '#fca5a5',
      'رمادي': '#71717a',
      'موف': '#9333ea',
      'بستاج': '#a7f3d0',
      'لافندر': '#c084fc',
    };
    const detectedColors: { name: string; hex: string }[] = [];
    Object.keys(colorDictionary).forEach((col) => {
      if (text.includes(col)) {
        if (!detectedColors.some((c) => c.name === col)) {
          detectedColors.push({ name: col, hex: colorDictionary[col] });
        }
      }
    });

    // 5. Category matching
    let matchedCatId = categoryId;
    if (categories.length > 0) {
      if (text.includes('فستان') || text.includes('دريس') || text.includes('سواريه')) {
        const found = categories.find((c) => c.name.includes('فساتين'));
        if (found) matchedCatId = found.id;
      } else if (text.includes('عبايه') || text.includes('عباية') || text.includes('كيمونو')) {
        const found = categories.find((c) => c.name.includes('عبايات'));
        if (found) matchedCatId = found.id;
      } else if (text.includes('شنطة') || text.includes('حقيبة') || text.includes('شنط')) {
        const found = categories.find((c) => c.name.includes('حقائب'));
        if (found) matchedCatId = found.id;
      } else if (text.includes('سلسلة') || text.includes('خاتم') || text.includes('مجوهرات') || text.includes('اكسسوار')) {
        const found = categories.find((c) => c.name.includes('مجوهرات'));
        if (found) matchedCatId = found.id;
      } else if (text.includes('عطر') || text.includes('برفيوم') || text.includes('ميك اب') || text.includes('تجميل')) {
        const found = categories.find((c) => c.name.includes('عطور'));
        if (found) matchedCatId = found.id;
      }
    }

    // Apply to product form
    setName(extractedName);
    const codeMatch = text.match(/(?:كود|CODE|الكود)[\s:➖–=._]*([A-Za-z0-9]+)/i);
    if (codeMatch) setCode(codeMatch[1].trim());
    if (extractedPrice) setPrice(extractedPrice);
    if (extractedOriginalPrice) setOriginalPrice(extractedOriginalPrice);
    if (detectedSizes.length > 0) setSelectedSizes(detectedSizes);
    if (detectedColors.length > 0) setSelectedColors(detectedColors);
    if (matchedCatId) setCategoryId(matchedCatId);
    setDescription(text);

    // Auto generate 3 realistic reviews
    generateRealisticReviews();

    confetti({ particleCount: 70, spread: 60 });
    setSuccessMessage('تم استخراج وقراءة بيانات المنتج من واتساب وتعبئتها في النموذج بنجاح! 🎉');
    setShowWhatsAppImporter(false);
    setShowAddProductModal(true);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Toggle Category Navbar
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
      const computedRating = productReviews.length > 0
        ? Number((productReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / productReviews.length).toFixed(1))
        : 5.0;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameEn,
          code: code.trim() || null,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          categoryId,
          images: uploadedImages,
          sizes: selectedSizes,
          colors: selectedColors,
          isFeatured,
          isNewArrival,
          reviews: productReviews,
          rating: computedRating,
          reviewsCount: productReviews.length || 18,
        }),
      });

      const data = await res.json();

      if (data.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage(`تمت إضافة منتج "${name}" بنجاح!`);
        setName('');
        setNameEn('');
        setCode('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setUploadedImages([]);
        setProductReviews([]);
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

  // Create Manual Order with Product Code
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName || !manualProductName || !manualProductPrice) {
      alert('يرجى إدخال اسم العميلة واسم المنتج وسعره!');
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: manualCustomerName.trim(),
          customerPhone: manualCustomerPhone.trim() || 'غير مسجل',
          customerAddress: manualCustomerAddress.trim() || 'تسجيل يدوي من الإدارة',
          items: [
            {
              name: manualProductName.trim(),
              code: manualProductCode.trim() || null,
              price: parseFloat(manualProductPrice),
              quantity: 1,
              size: manualProductSize || 'M',
              color: manualProductColor || 'أسود',
            },
          ],
          total: parseFloat(manualProductPrice),
          notes: manualNotes.trim() ? `[طلب يدوي] ${manualNotes.trim()}` : 'طلب يدوي مسجل من لوحة التحكم',
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        setSuccessMessage(`تم تسجيل الأوردر بكود (${manualProductCode || 'بدون كود'}) بنجاح! 🎉`);
        setShowManualOrderModal(false);
        setManualCustomerName('');
        setManualCustomerPhone('');
        setManualCustomerAddress('');
        setManualProductCode('');
        setManualProductName('');
        setManualProductPrice('');
        setManualNotes('');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert('حدث خطأ: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Custom Size Handlers (Supports comma-separated inputs)
  const handleAddCustomSize = (sizeStr: string, isEdit = false) => {
    if (!sizeStr || !sizeStr.trim()) return;
    const parts = sizeStr
      .split(/[,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEdit) {
      setEditProdSizes((prev) => {
        const next = [...prev];
        parts.forEach((p) => {
          if (!next.includes(p)) next.push(p);
        });
        return next;
      });
      setEditProdCustomSizeInput('');
    } else {
      setSelectedSizes((prev) => {
        const next = [...prev];
        parts.forEach((p) => {
          if (!next.includes(p)) next.push(p);
        });
        return next;
      });
      setCustomSizeInput('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string, isEdit = false) => {
    if (isEdit) {
      setEditProdSizes((prev) => prev.filter((s) => s !== sizeToRemove));
    } else {
      setSelectedSizes((prev) => prev.filter((s) => s !== sizeToRemove));
    }
  };

  const handleTogglePresetSize = (size: string, isEdit = false) => {
    if (isEdit) {
      setEditProdSizes((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
    } else {
      setSelectedSizes((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
    }
  };

  // Start Editing Product
  const handleStartEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdNameEn(prod.nameEn || '');
    setEditProdCode(prod.code || '');
    setEditProdPrice(prod.price ? prod.price.toString() : '');
    setEditProdOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setEditProdCategoryId(prod.category?.id || (categories.length > 0 ? categories[0].id : ''));
    setEditProdDescription(prod.description || '');
    setEditProdSizes(Array.isArray(prod.sizes) ? [...prod.sizes] : []);
    setEditProdCustomSizeInput('');
    setEditProdImages(Array.isArray(prod.images) ? [...prod.images] : []);
    setEditProdInStock(prod.inStock);
    setEditProdIsNewArrival(Boolean(prod.isNewArrival));
  };

  // Save Edited Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim() || !editProdPrice) {
      alert('يرجى كتابة اسم المنتج وسعره!');
      return;
    }

    setSavingProduct(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProdName.trim(),
          nameEn: editProdNameEn.trim() || null,
          code: editProdCode.trim() || null,
          price: parseFloat(editProdPrice),
          originalPrice: editProdOriginalPrice ? parseFloat(editProdOriginalPrice) : null,
          categoryId: editProdCategoryId || undefined,
          description: editProdDescription.trim(),
          sizes: editProdSizes,
          images: editProdImages,
          inStock: editProdInStock,
          isNewArrival: editProdIsNewArrival,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        setSuccessMessage(`تم تحديث بيانات منتج "${editProdName}" بنجاح! ✨`);
        setEditingProduct(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('حدث خطأ أثناء حفظ التعديلات: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  // Start Editing Order
  const handleStartEditOrder = (order: OrderItem) => {
    setEditingOrder(order);
    setEditOrderCustomerName(order.customerName || '');
    setEditOrderCustomerPhone(order.customerPhone || '');
    setEditOrderCustomerAddress(order.customerAddress || '');
    setEditOrderStatus(order.status || 'PENDING');
    setEditOrderTrackingNumber(order.trackingNumber || '');
    setEditOrderTotal(order.total ? order.total.toString() : '0');
    setEditOrderNotes(order.notes || '');
    setEditOrderItems(
      Array.isArray(order.items)
        ? order.items.map((it: any) => ({
            name: it.name || 'منتج',
            code: it.code || '',
            size: it.size || 'M',
            color: it.color || 'افتراضي',
            price: it.price || 0,
            quantity: it.quantity || 1,
          }))
        : []
    );
  };

  // Update item in order
  const handleUpdateOrderItem = (index: number, field: string, value: any) => {
    setEditOrderItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Remove item from order
  const handleRemoveOrderItem = (index: number) => {
    setEditOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add new item to order
  const handleAddNewItemToOrder = () => {
    setEditOrderItems((prev) => [
      ...prev,
      {
        name: 'قطعة إضافية',
        code: '',
        size: 'فري سايز',
        color: 'أسود',
        price: 0,
        quantity: 1,
      },
    ]);
  };

  // Recalculate order total from items
  const handleRecalculateOrderTotal = () => {
    const calc = editOrderItems.reduce(
      (sum, it) => sum + (parseFloat(String(it.price)) || 0) * (parseInt(String(it.quantity)) || 1),
      0
    );
    setEditOrderTotal(calc.toString());
  };

  // Save Edited Order
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editOrderCustomerName.trim() || !editOrderTotal) {
      alert('يرجى كتابة اسم العميلة وإجمالي الطلب!');
      return;
    }

    setSavingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id,
          customerName: editOrderCustomerName.trim(),
          customerPhone: editOrderCustomerPhone.trim(),
          customerAddress: editOrderCustomerAddress.trim(),
          status: editOrderStatus,
          trackingNumber: editOrderTrackingNumber.trim() || null,
          total: parseFloat(editOrderTotal),
          items: editOrderItems,
          notes: editOrderNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        setSuccessMessage(`تم حفظ وتعديل بيانات الأوردر (${editingOrder.orderNumber}) بنجاح! 🎉`);
        setEditingOrder(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        alert('حدث خطأ أثناء تعديل الطلب: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setSavingOrder(false);
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

  // Toggle isNewArrival (وصل حديثاً)
  const handleToggleNewArrival = async (product: ProductItem) => {
    const nextVal = !product.isNewArrival;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNewArrival: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isNewArrival: nextVal } : p))
        );
        setSuccessMessage(
          nextVal
            ? `تمت إضافة "${product.name}" إلى قسم وصل حديثاً 🎀 بنجاح!`
            : `تمت إزالة "${product.name}" من قسم وصل حديثاً بنجاح.`
        );
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر تحديث حالة وصل حديثاً: ' + data.error);
      }
    } catch (e: any) {
      alert('خطأ في الاتصال: ' + e.message);
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

  // Delete Order
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف الطلب "${orderNumber}" نهائياً من السجل؟`)) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setSuccessMessage(`تم حذف الطلب ${orderNumber} بنجاح.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تعذر حذف الطلب: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponVal) return;

    setLoading(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          description: couponDesc,
          discountType: couponType,
          discountValue: parseFloat(couponVal),
          minOrderAmount: parseFloat(couponMinOrder || '0'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        setSuccessMessage(`تم إنشاء كود الخصم "${data.coupon.code}" بنجاح!`);
        setCouponCode('');
        setCouponDesc('');
        setCouponVal('');
        setShowAddCouponModal(false);
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

  // Toggle Coupon Active
  const handleToggleCoupon = async (coupon: CouponItem) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon: CouponItem) => {
    if (!confirm(`هل أنتِ متأكدة من حذف كود الخصم "${coupon.code}"؟`)) return;

    try {
      const res = await fetch(`/api/coupons?id=${coupon.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
        setSuccessMessage(`تم حذف كود "${coupon.code}" بنجاح.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
  };

  // Save Settings & Ads
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
        setSuccessMessage('تم حفظ إعدادات المتجر والإعلانات والسوشيال ميديا بنجاح!');
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
                مرحباً بكِ، {currentAdmin?.name || 'مديرة المتجر'} (جلستكِ محفوظة دائماً ✓)
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
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>أكواد الخصم ({coupons.length})</span>
          </button>

          <Link
            href="/admin/accounting"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-xs"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>الحسابات والأرباح 📊</span>
          </Link>

          <button
            onClick={() => setActiveTab('ads_settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'ads_settings'
                ? 'bg-rose-500 text-white shadow-sm shadow-pink-200'
                : 'text-stone-600 hover:bg-pink-50 hover:text-rose-600'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>نظام الإعلانات والإعدادات</span>
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
                  <span className="text-xs text-stone-500 font-semibold">أكواد الخصم النشطة</span>
                  <div className="text-2xl font-black text-purple-600 font-sans mt-1">
                    {coupons.filter((c) => c.isActive).length} كوبون
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    كود {coupons[0]?.code || 'GIRL10'} فعال الآن
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-right">
                <h3 className="text-lg font-bold">تحكم كامل ومباشر في متجر Fashion Zone ✨</h3>
                <p className="text-xs text-pink-100">
                  إدارة المنتجات، التحكم في قوائم الأقسام المنسدلة، نظام أكواد الخصم، والإعلانات الترويجية.
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
                  onClick={() => {
                    setActiveTab('coupons');
                    setShowAddCouponModal(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Tag className="w-4 h-4" />
                  <span>كود خصم جديد</span>
                </button>
                <button
                  onClick={() => setActiveTab('ads_settings')}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>نظام الإعلانات</span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppImporter(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>استيراد سريع من واتساب 📲</span>
                </button>
                <button
                  onClick={() => setShowAddProductModal(!showAddProductModal)}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddProductModal ? 'إغلاق نافذة الإضافة' : 'إضافة منتج جديد'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Smart Importer Modal */}
            {showWhatsAppImporter && (
              <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-pink-200 shadow-2xl space-y-5 animate-scaleUp">
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">مستورد منتجات واتساب الذكي 📲✨</h3>
                        <p className="text-xs text-stone-500">انسخي تفاصيل المنتج من جروب الواتساب والصقيها هنا، وسيتم استخراج كل شيء بذكاء</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppImporter(false)}
                      className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>كيف يعمل المستورد الذكي؟</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800/90">
                      1. افتحي جروب الواتساب وانسخي رسالة المنتج (اسم الفستان/العباية، السعر، المقاسات، الألوان، خامة القماش).<br />
                      2. الصقي النص هنا واضغطي على الزر السحري بالأسفل.<br />
                      3. يقوم النظام آلياً باستخراج الاسم، السعر الأصلي وسعر الخصم، وتحديد المقاسات والألوان وتصنيف القسم، وتوليد 3 ريفيوهات عملاء واقعية 5 نجوم تلقائياً!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      نص المنشور المنسوخ من جروب الواتساب:
                    </label>
                    <textarea
                      rows={6}
                      value={whatsAppText}
                      onChange={(e) => setWhatsAppText(e.target.value)}
                      placeholder={`مثال من الواتساب:
فستان سهرة كريب حرير مطرز سواريه راقي ✨
السعر: 850 جنيه بدل 1200 جنيه لفترة محدودة 🔥
المقاسات المتاحة: M, L, XL, XXL
الألوان المتوفرة: وردي، أسود، كشمير، كحلي
خامة مستوردة فاخرة مع تقفيل سوبر لوكس وتوصيل مجاني`}
                      className="w-full text-xs p-3.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-pink-50/20 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleParseWhatsAppPost}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>🪄 استخراج البيانات وتعبئة المنتج تلقائياً</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppImporter(false)}
                      className="px-5 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Add Form Modal */}
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

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">كود الموديل / Code</label>
                      <input
                        type="text"
                        placeholder="مثال: 3606 أو 5314"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20 font-mono font-bold"
                      />
                    </div>

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

                  {/* Dynamic Custom Sizes & Presets Manager */}
                  <div className="space-y-3 bg-pink-50/40 p-4 rounded-2xl border border-pink-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <span>📏 مقاسات المنتج المختارة:</span>
                        <span className="text-rose-600 font-mono">({selectedSizes.length} مقاس)</span>
                      </label>
                      {selectedSizes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSizes([])}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          مسح جميع المقاسات
                        </button>
                      )}
                    </div>

                    {/* Currently Added Sizes Tags with (x) delete */}
                    <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-white rounded-xl border border-pink-200">
                      {selectedSizes.length === 0 ? (
                        <span className="text-xs text-stone-400 italic">
                          لم يتم تحديد أي مقاس بعد. يمكنك اختيار مقاسات من الأسفل أو كتابة مقاساتك بحرية.
                        </span>
                      ) : (
                        selectedSizes.map((size) => (
                          <span
                            key={size}
                            className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs animate-fadeIn"
                          >
                            <span>{size}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="text-stone-400 hover:text-red-500 rounded-full"
                              title="حذف هذا المقاس"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Custom Size Free Input & Add Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="اكتبي أي مقاس مخصص (مثال: يلبس من 60 ل 85 ك / أوفر سايز / 44 / مقاس 1 / 12 سنة)..."
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSize(customSizeInput);
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(customSizeInput)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة المقاس</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      💡 يمكنك كتابة عدة مقاسات مفصولة بفاصلة (مثال: M, L, XL, XXL) وإضافتها دفعة واحدة.
                    </p>

                    {/* Quick Preset Buttons (Grouped) */}
                    <div className="space-y-2 pt-2 border-t border-pink-100/70">
                      <span className="text-[11px] font-bold text-stone-600 block">اختيار سريع من المقاسات الجاهزة:</span>
                      
                      {/* Standard S-5XL */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-bold ml-1">العادية:</span>
                        {standardSizes.map((size) => {
                          const isSel = selectedSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePresetSize(size)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                isSel
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                                  : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                              }`}
                            >
                              {size} {isSel && '✓'}
                            </button>
                          );
                        })}
                      </div>

                      {/* Plus & Free Sizes */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-bold ml-1">الخاصة والفري:</span>
                        {plusAndSpecialSizes.map((size) => {
                          const isSel = selectedSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePresetSize(size)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                isSel
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                                  : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                              }`}
                            >
                              {size} {isSel && '✓'}
                            </button>
                          );
                        })}
                      </div>

                      {/* Weight-based & Kids */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-bold ml-1">الأوزان والأطفال:</span>
                        {[...weightBasedSizes, ...kidsAndNumberSizes].map((size) => {
                          const isSel = selectedSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePresetSize(size)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                isSel
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                                  : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                              }`}
                            >
                              {size} {isSel && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews & Social Proof Builder for this product */}
                  <div className="pt-4 border-t border-pink-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-stone-800">
                          ⭐ تجارب وريفيوهات العميلات الواقعية (Social Proof)
                        </label>
                        <p className="text-[11px] text-stone-400">
                          يمكنكِ توليد 3 ريفيوهات تلقائية ممتازة ومقنعة بنقرة واحدة، أو كتابة ريفيوهات مخصصة
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={generateRealisticReviews}
                        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>🪄 توليد 3 ريفيوهات تلقائية جاهزة</span>
                      </button>
                    </div>

                    {/* Review List */}
                    {productReviews.length > 0 && (
                      <div className="space-y-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-200">
                        {productReviews.map((rev, index) => (
                          <div
                            key={rev.id || index}
                            className="bg-white p-3 rounded-xl border border-pink-100 shadow-xs flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-800">{rev.name}</span>
                                {rev.city && <span className="text-[10px] text-stone-400">({rev.city})</span>}
                                <span className="text-amber-500 font-bold text-[11px]">
                                  {'★'.repeat(rev.rating)}
                                </span>
                                {rev.verified && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                                    شراء مؤكد ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-stone-600 text-[11px]">"{rev.comment}"</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setProductReviews((prev) => prev.filter((_, i) => i !== index))}
                              className="text-stone-400 hover:text-red-500 p-1"
                              title="حذف هذا الريفيو"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Custom Review Manually */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="اسم العميلة (مثال: منى حسن)"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="المدينة (مثال: المنصورة)"
                        value={newReviewCity}
                        onChange={(e) => setNewReviewCity(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none"
                      />
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="text-xs px-2 py-2 rounded-xl border border-pink-200 focus:outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 نجوم)</option>
                        <option value={3}>⭐⭐⭐ (3 نجوم)</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCustomReview}
                        className="bg-white hover:bg-pink-50 text-rose-600 border border-pink-300 text-xs font-bold px-3 py-2 rounded-xl transition"
                      >
                        + إضافة الريفيو
                      </button>
                    </div>
                    {newReviewAuthor && (
                      <input
                        type="text"
                        placeholder="نص تعليق العميلة ورأيها في الخامة والتوصيل..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none"
                      />
                    )}
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
                      <th className="pb-3 font-semibold">وصل حديثاً 🎀</th>
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {product.code && (
                              <span className="inline-block bg-pink-100 text-rose-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                                كود: {product.code}
                              </span>
                            )}
                            {product.nameEn && <span className="text-[10px] text-stone-400">{product.nameEn}</span>}
                          </div>
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
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleNewArrival(product)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                              product.isNewArrival
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-pink-300'
                                : 'bg-stone-100 text-stone-500 hover:bg-pink-50 hover:text-rose-600'
                            }`}
                            title={product.isNewArrival ? 'إزالة من وصل حديثاً' : 'إضافة إلى وصل حديثاً'}
                          >
                            <span>{product.isNewArrival ? 'معروض في وصل حديثاً 🎀 ✓' : '+ إضافة لوصل حديثاً'}</span>
                          </button>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEditProduct(product)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-pink-50 transition"
                              title="تعديل بيانات المنتج والمقاسات"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
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

            {/* ==================================================== */}
            {/* EDIT PRODUCT MODAL */}
            {/* ==================================================== */}
            {editingProduct && (
              <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-pink-100">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-rose-600 flex items-center justify-center">
                        <Edit2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">تعديل بيانات المنتج والمقاسات ✏️</h3>
                        <p className="text-[11px] text-stone-500">عدّلي الاسم، السعر، الكود، وقائمة المقاسات المخصصة</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name AR */}
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">اسم المنتج بالعربي *</label>
                        <input
                          type="text"
                          required
                          value={editProdName}
                          onChange={(e) => setEditProdName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      {/* Name EN */}
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">الاسم بالإنجليزي (اختياري)</label>
                        <input
                          type="text"
                          value={editProdNameEn}
                          onChange={(e) => setEditProdNameEn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Product Code */}
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">كود الموديل (اختياري)</label>
                        <input
                          type="text"
                          placeholder="مثال: 3606"
                          value={editProdCode}
                          onChange={(e) => setEditProdCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">سعر البيع الحالي (ج.م) *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={editProdPrice}
                          onChange={(e) => setEditProdPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                        />
                      </div>

                      {/* Original Price */}
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">السعر قبل الخصم (ج.م)</label>
                        <input
                          type="number"
                          step="any"
                          value={editProdOriginalPrice}
                          onChange={(e) => setEditProdOriginalPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">القسم *</label>
                      <select
                        value={editProdCategoryId}
                        onChange={(e) => setEditProdCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">وصف المنتج والخامات</label>
                      <textarea
                        rows={3}
                        value={editProdDescription}
                        onChange={(e) => setEditProdDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>

                    {/* DYNAMIC CUSTOM SIZES MANAGER */}
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold text-stone-800">
                            🏷️ إدارة مقاسات المنتج المتاحة:
                          </label>
                          <p className="text-[11px] text-stone-500">
                            أضيفي أي مقاسات حرة أو اختاري من المقاسات الجاهزة بالأسفل
                          </p>
                        </div>
                        {editProdSizes.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditProdSizes([])}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            مسح جميع المقاسات
                          </button>
                        )}
                      </div>

                      {/* Selected Size Badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-pink-100">
                        {editProdSizes.length === 0 ? (
                          <span className="text-stone-400 text-[11px]">لم يتم تحديد مقاسات بعد (يمكنك إضافة مقاس الآن)</span>
                        ) : (
                          editProdSizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs animate-fadeIn"
                            >
                              <span>{size}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(size, true)}
                                className="text-pink-200 hover:text-white transition"
                                title="إزالة المقاس"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Custom Size Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="اكتبي أي مقاس مخصص (مثال: يلبس من 60 ل 85 ك / أوفر سايز / 44 / مقاس 1 / 12 سنة)..."
                          value={editProdCustomSizeInput}
                          onChange={(e) => setEditProdCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSize(editProdCustomSizeInput, true);
                            }
                          }}
                          className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSize(editProdCustomSizeInput, true)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="space-y-1.5 pt-2 border-t border-pink-100">
                        <span className="text-[11px] font-bold text-stone-600 block">اختيار سريع:</span>
                        
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-stone-500 font-bold ml-1">العادية:</span>
                          {standardSizes.map((size) => {
                            const isSel = editProdSizes.includes(size);
                            return (
                              <button
                                type="button"
                                key={size}
                                onClick={() => handleTogglePresetSize(size, true)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                                  isSel
                                    ? 'bg-rose-500 text-white border-rose-500'
                                    : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                                }`}
                              >
                                {size} {isSel && '✓'}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-stone-500 font-bold ml-1">الخاصة والفري:</span>
                          {plusAndSpecialSizes.map((size) => {
                            const isSel = editProdSizes.includes(size);
                            return (
                              <button
                                type="button"
                                key={size}
                                onClick={() => handleTogglePresetSize(size, true)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                                  isSel
                                    ? 'bg-rose-500 text-white border-rose-500'
                                    : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                                }`}
                              >
                                {size} {isSel && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stock & New Arrival Checkboxes */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                        <input
                          type="checkbox"
                          checked={editProdInStock}
                          onChange={(e) => setEditProdInStock(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-500"
                        />
                        <span>متوفر في المخزون (In Stock)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600">
                        <input
                          type="checkbox"
                          checked={editProdIsNewArrival}
                          onChange={(e) => setEditProdIsNewArrival(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-500"
                        />
                        <span>عرض في صفحة وصل حديثاً 🎀</span>
                      </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={savingProduct}
                        className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                      >
                        {savingProduct ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري حفظ التعديلات...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>حفظ التعديلات الآن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CATEGORIES & NAVBAR CONTROL */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-stone-900">إدارة الأقسام والقوائم المنسدلة بالناف بار</h2>
              <p className="text-xs text-stone-500">
                الأقسام هنا تظهر تلقائياً بصورها في القائمة المنسدلة الفاخرة بالناف بار، يمكنكِ إخفاء أو إظهار أي قسم بنقرة واحدة.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add or Edit Category Form (Left / Col 1) */}
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 h-fit">
                {editingCategory ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                      <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-rose-500" />
                        <span>تعديل قسم: {editingCategory.name}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                        title="إلغاء التعديل"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">اسم القسم الجديد *</label>
                        <input
                          type="text"
                          required
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          placeholder="اسم القسم..."
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-pink-50/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">صورة القسم الغلاف (تظهر بالناف بار)</label>
                        {editCatImage ? (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-pink-200 mb-2">
                            <Image src={editCatImage} alt="Category preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditCatImage('')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-28 rounded-xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/40 flex flex-col items-center justify-center cursor-pointer transition">
                            <Upload className="w-5 h-5 text-rose-500 mb-1" />
                            <span className="text-xs font-bold text-rose-600">
                              {uploadingEditCatImage ? 'جاري الرفع لـ Cloudinary...' : 'رفع صورة جديدة للقسم'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditCategoryImageUpload}
                              disabled={uploadingEditCatImage}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                        <input
                          type="checkbox"
                          id="editCatShowInNavbar"
                          checked={editCatShowInNavbar}
                          onChange={(e) => setEditCatShowInNavbar(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                        />
                        <label htmlFor="editCatShowInNavbar" className="text-xs font-bold text-stone-700 cursor-pointer">
                          إظهار في القائمة المنسدلة بالناف بار
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading || uploadingEditCatImage}
                          className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>حفظ التعديلات</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-rose-500" />
                      <span>إضافة قسم جديد بصورته</span>
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
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">صورة القسم الغلاف (تظهر بالناف بار) *</label>
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
                          إظهار في القائمة المنسدلة بالناف بار
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
                  </>
                )}
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
                          <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-pink-50 border border-pink-100 flex-shrink-0">
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
                          {/* Edit Category Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(cat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-pink-50/70 text-rose-700 border-pink-200 hover:bg-rose-100"
                            title="تعديل اسم أو صورة القسم"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>تعديل</span>
                          </button>

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
                <h2 className="text-lg font-bold text-stone-900">إدارة الطلبات وبوليصات الشحن والتتبع</h2>
                <p className="text-xs text-stone-500">
                  تغيير حالة الطلب وإصدار أرقام بوليصات الشحن ومراسلة العملاء عبر واتساب مباشرة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualOrderModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل أوردر يدوي بكود الموديل ➕</span>
                </button>
              </div>
            </div>

            {/* Status Filters & Stats Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
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

            {/* Manual Order Modal */}
            {showManualOrderModal && (
              <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-pink-200 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                        🛍️
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">تسجيل أوردر يدوي بكود الموديل</h3>
                        <p className="text-xs text-stone-500">إدخال طلب عميلة مباشرة وتحديد كود المنتج والمقاس والسعر</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowManualOrderModal(false)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateManualOrder} className="space-y-4">
                    {/* Quick Select from existing products */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        اختر منتج من المتجر لتعبئة الكود والاسم تلقائياً (اختياري):
                      </label>
                      <select
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          if (prod) {
                            setManualProductName(prod.name);
                            setManualProductCode(prod.code || '');
                            setManualProductPrice(prod.price.toString());
                          }
                        }}
                        defaultValue=""
                        className="w-full text-xs p-2.5 rounded-xl border border-pink-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        <option value="">-- أو يمكنك كتابة بيانات الموديل يدوياً بالأسفل --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code ? `[كود: ${p.code}] ` : ''}{p.name} - {p.price} ج.م
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          كود الموديل (Product Code) ⭐
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: 3606 أو 5314 أو FZ-101"
                          value={manualProductCode}
                          onChange={(e) => setManualProductCode(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono font-bold text-rose-600 bg-pink-50/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          اسم المنتج / الموديل *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: سويت شيرت ميلتون تقيل"
                          value={manualProductName}
                          onChange={(e) => setManualProductName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">السعر (ج.م) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="450"
                          value={manualProductPrice}
                          onChange={(e) => setManualProductPrice(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">المقاس</label>
                        <input
                          type="text"
                          placeholder="M, L, XL, أو فري سايز"
                          value={manualProductSize}
                          onChange={(e) => setManualProductSize(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">اللون</label>
                        <input
                          type="text"
                          placeholder="أسود، كشمير، زيتي..."
                          value={manualProductColor}
                          onChange={(e) => setManualProductColor(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    <div className="border-t border-pink-100 pt-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">اسم العميلة *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: مدام مروة"
                            value={manualCustomerName}
                            onChange={(e) => setManualCustomerName(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">رقم الهاتف / واتساب</label>
                          <input
                            type="text"
                            placeholder="010XXXXXXXX"
                            value={manualCustomerPhone}
                            onChange={(e) => setManualCustomerPhone(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">العنوان بالتفصيل</label>
                        <input
                          type="text"
                          placeholder="المحافظة - المدينة - الشارع"
                          value={manualCustomerAddress}
                          onChange={(e) => setManualCustomerAddress(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظات إضافية</label>
                        <textarea
                          rows={2}
                          placeholder="أي ملاحظات خاصة بالتوصيل أو الاتصال..."
                          value={manualNotes}
                          onChange={(e) => setManualNotes(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowManualOrderModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={creatingOrder}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                      >
                        {creatingOrder ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري تسجيل الأوردر...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تأكيد وتسجيل الأوردر الآن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                            {order.couponCode && (
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                تم تطبيق كود: {order.couponCode}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditOrder(order)}
                              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-2 rounded-xl transition text-xs border border-pink-200"
                              title="تعديل بيانات الطلب والقطع والمقاسات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>تعديل الأوردر</span>
                            </button>

                            <button
                              onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                              className="inline-flex items-center gap-1 text-stone-400 hover:text-red-600 bg-stone-50 hover:bg-red-50 p-2 rounded-xl transition text-xs font-bold border border-stone-200"
                              title="حذف هذا الطلب نهائياً"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span className="hidden sm:inline">حذف</span>
                            </button>

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
                                {item.code && (
                                  <span className="bg-pink-100 text-rose-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border border-pink-200">
                                    كود: {item.code}
                                  </span>
                                )}
                                <span className="font-bold text-stone-800">{item.name}</span>
                                {item.size && <span className="text-stone-500">({item.size})</span>}
                                {item.color && <span className="text-stone-500">({item.color})</span>}
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

            {/* ==================================================== */}
            {/* EDIT ORDER MODAL */}
            {/* ==================================================== */}
            {editingOrder && (
              <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-pink-100 my-8 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-pink-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">
                          تعديل الأوردر رقم: <span className="font-mono text-rose-600">#{editingOrder.orderNumber}</span> ✏️
                        </h3>
                        <p className="text-[11px] text-stone-500">
                          تعديل بيانات العميلة، حالة الطلب، المقاسات، الألوان، الأسعار، وإضافة أو حذف منتجات
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
                    {/* Customer Info */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                      <h4 className="font-bold text-stone-800 text-xs">بيانات العميلة والشحن:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">اسم العميلة *</label>
                          <input
                            type="text"
                            required
                            value={editOrderCustomerName}
                            onChange={(e) => setEditOrderCustomerName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">رقم الهاتف / الواتساب *</label>
                          <input
                            type="text"
                            required
                            value={editOrderCustomerPhone}
                            onChange={(e) => setEditOrderCustomerPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-700 font-bold mb-1">العنوان بالتفصيل *</label>
                        <input
                          type="text"
                          required
                          value={editOrderCustomerAddress}
                          onChange={(e) => setEditOrderCustomerAddress(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">حالة الطلب:</label>
                          <select
                            value={editOrderStatus}
                            onChange={(e) => setEditOrderStatus(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          >
                            <option value="PENDING">⏳ قيد المراجعة والتأكيد</option>
                            <option value="PREPARING">🎀 جاري التجهيز والتغليف</option>
                            <option value="SHIPPED">🚚 تم التسليم لمندوب الشحن</option>
                            <option value="DELIVERED">🎉 تم التوصيل بنجاح</option>
                            <option value="CANCELLED">✕ تم الإلغاء</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-stone-700 font-bold mb-1">رقم بوليصة الشحن (تتبع):</label>
                          <input
                            type="text"
                            placeholder="مثال: ARAMEX-98421"
                            value={editOrderTrackingNumber}
                            onChange={(e) => setEditOrderTrackingNumber(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-stone-900 text-xs">
                            القطع المطلوبة في هذا الطلب ({editOrderItems.length}):
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            يمكنك تعديل كود الموديل، المقاس، اللون، السعر، والكمية بحرية كاملة
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAddNewItemToOrder}
                            className="bg-pink-100 hover:bg-pink-200 text-rose-700 text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة قطعة للأوردر</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRecalculateOrderTotal}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                            title="حساب المجموع بناءً على أسعار القطع وكمياتها"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>إعادة حساب الإجمالي</span>
                          </button>
                        </div>
                      </div>

                      {editOrderItems.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-pink-200 rounded-2xl text-stone-400">
                          لا توجد قطع في هذا الطلب. اضغطي على &quot;إضافة قطعة للأوردر&quot; لإضافة قطع.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {editOrderItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-2 text-xs"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                {/* Item Name */}
                                <div className="sm:col-span-4">
                                  <label className="text-[10px] text-stone-500 font-bold block mb-0.5">اسم القطعة</label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateOrderItem(idx, 'name', e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-pink-200 bg-white"
                                  />
                                </div>

                                {/* Code */}
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] text-stone-500 font-bold block mb-0.5">كود الموديل</label>
                                  <input
                                    type="text"
                                    placeholder="كود"
                                    value={item.code || ''}
                                    onChange={(e) => handleUpdateOrderItem(idx, 'code', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-pink-200 bg-white font-mono"
                                  />
                                </div>

                                {/* Size */}
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] text-stone-500 font-bold block mb-0.5">المقاس</label>
                                  <input
                                    type="text"
                                    placeholder="المقاس"
                                    value={item.size || ''}
                                    onChange={(e) => handleUpdateOrderItem(idx, 'size', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-pink-200 bg-white font-bold"
                                  />
                                </div>

                                {/* Color */}
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] text-stone-500 font-bold block mb-0.5">اللون</label>
                                  <input
                                    type="text"
                                    placeholder="اللون"
                                    value={item.color || ''}
                                    onChange={(e) => handleUpdateOrderItem(idx, 'color', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-pink-200 bg-white"
                                  />
                                </div>

                                {/* Actions */}
                                <div className="sm:col-span-2 flex items-center justify-end pt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOrderItem(idx)}
                                    className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white"
                                    title="حذف هذه القطعة"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Price, Quantity, Subtotal, and Quick Size chips */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-pink-100/60">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-stone-500">السعر:</span>
                                    <input
                                      type="number"
                                      step="any"
                                      value={item.price}
                                      onChange={(e) => handleUpdateOrderItem(idx, 'price', e.target.value)}
                                      className="w-20 px-2 py-1 rounded-lg border border-pink-200 bg-white font-bold"
                                    />
                                    <span className="text-[10px] text-stone-500">ج.م</span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-stone-500">الكمية:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.quantity || 1}
                                      onChange={(e) => handleUpdateOrderItem(idx, 'quantity', e.target.value)}
                                      className="w-14 px-2 py-1 rounded-lg border border-pink-200 bg-white text-center font-bold"
                                    />
                                  </div>

                                  <div className="text-[11px] text-stone-600 font-bold">
                                    = {(parseFloat(String(item.price)) || 0) * (parseInt(String(item.quantity)) || 1)} ج.م
                                  </div>
                                </div>

                                {/* Quick size presets for fast editing */}
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-stone-400">مقاس سريع:</span>
                                  {['S', 'M', 'L', 'XL', '2XL', 'فري سايز', 'أوفر سايز'].map((sz) => (
                                    <button
                                      type="button"
                                      key={sz}
                                      onClick={() => handleUpdateOrderItem(idx, 'size', sz)}
                                      className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                                        item.size === sz
                                          ? 'bg-rose-500 text-white border-rose-500'
                                          : 'bg-white text-stone-600 border-pink-200 hover:border-rose-400'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total Amount & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-100">
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">
                          إجمالي قيمة الأوردر المطلوبة من العميلة (ج.م) *
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            required
                            value={editOrderTotal}
                            onChange={(e) => setEditOrderTotal(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-pink-300 bg-white font-black text-rose-600 text-base focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                          <button
                            type="button"
                            onClick={handleRecalculateOrderTotal}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-pink-200 font-bold text-xs px-3 py-2.5 rounded-xl whitespace-nowrap transition"
                          >
                            حساب تلقائي 🔄
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-700 font-bold mb-1">ملاحظات على الأوردر (اختياري)</label>
                        <input
                          type="text"
                          placeholder="ملاحظات التسليم أو التغليف أو شركة الشحن..."
                          value={editOrderNotes}
                          onChange={(e) => setEditOrderNotes(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
                      <button
                        type="button"
                        onClick={() => setEditingOrder(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={savingOrder}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                      >
                        {savingOrder ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري حفظ تعديلات الأوردر...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تأكيد وحفظ تعديلات الأوردر</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: DISCOUNT COUPONS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900">إدارة أكواد الخصم والكوبونات 🎟️</h2>
                <p className="text-xs text-stone-500">
                  إنشاء أكواد خصم بنسب مئوية أو مبالغ ثابتة تمنح لعميلاتك عند إتمام الطلب بالسلة
                </p>
              </div>
              <button
                onClick={() => setShowAddCouponModal(!showAddCouponModal)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddCouponModal ? 'إلغاء' : 'إضافة كود خصم جديد'}</span>
              </button>
            </div>

            {/* Add Coupon Modal */}
            {showAddCouponModal && (
              <div className="bg-white rounded-3xl p-6 border border-pink-200 shadow-md animate-scaleUp">
                <h3 className="text-sm font-bold text-stone-900 mb-4 pb-2 border-b border-pink-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-500" />
                  <span>بيانات كود الخصم الجديد</span>
                </h3>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">كود الخصم (بالإنجليزي) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: SUMMER25 أو QUEEN"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 uppercase font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">نوع الخصم *</label>
                      <select
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white"
                      >
                        <option value="PERCENTAGE">نسبة مئوية (%)</option>
                        <option value="FIXED">مبلغ ثابت بالجنيه (EGP)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        قيمة الخصم {couponType === 'PERCENTAGE' ? '(مثال: 15 يعني 15%)' : '(مثال: 50 جنيه)'} *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="10"
                        value={couponVal}
                        onChange={(e) => setCouponVal(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">الحد الأدنى لقيمة الطلب (جنيه)</label>
                      <input
                        type="number"
                        placeholder="200"
                        value={couponMinOrder}
                        onChange={(e) => setCouponMinOrder(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">وصف الكود أو المناسبة</label>
                    <input
                      type="text"
                      placeholder="مثال: خصم 10% لكل الطلبات بمناسبة عيد الفطر"
                      value={couponDesc}
                      onChange={(e) => setCouponDesc(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCouponModal(false)}
                      className="px-4 py-2 text-xs font-bold text-stone-600"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-2 rounded-xl transition"
                    >
                      حفظ وتفعيل الكود
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Coupons List Table */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-pink-100 text-stone-400">
                      <th className="pb-3 font-semibold">الكود</th>
                      <th className="pb-3 font-semibold">الوصف</th>
                      <th className="pb-3 font-semibold">قيمة الخصم</th>
                      <th className="pb-3 font-semibold">الحد الأدنى</th>
                      <th className="pb-3 font-semibold">مرات الاستخدام</th>
                      <th className="pb-3 font-semibold">الحالة</th>
                      <th className="pb-3 font-semibold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-pink-50/20 transition">
                        <td className="py-3 font-mono font-black text-rose-600 text-sm">{coupon.code}</td>
                        <td className="py-3 text-stone-700">{coupon.description || 'بدون وصف'}</td>
                        <td className="py-3 font-bold text-stone-900">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : `${coupon.discountValue} ج.م`}
                        </td>
                        <td className="py-3 text-stone-500">{coupon.minOrderAmount} ج.م</td>
                        <td className="py-3 font-bold text-stone-700">{coupon.usedCount} مرة</td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleCoupon(coupon)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                              coupon.isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {coupon.isActive ? 'مفعل ✓' : 'معطل ✕'}
                          </button>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف الكوبون"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        {/* TAB 6: ADS & SETTINGS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'ads_settings' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div>
              <h2 className="text-lg font-bold text-stone-900">نظام الإعلانات الترويجية وإعدادات المتجر 📢</h2>
              <p className="text-xs text-stone-500">
                التحكم في شريط الإعلانات، النافذة الإعلانية المنبثقة، بنرات الواجهة، ورقم الواتساب والسوشيال ميديا
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-8">
              
              {/* Section 1: Hero Header Banner Section (الصورة والكوبون والهيدر) */}
              <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-pink-50/70 via-rose-50/40 to-pink-50/70 border border-pink-200">
                <div className="flex items-center justify-between pb-3 border-b border-pink-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        👑 تخصيص صورة وكوبون بنر الهيدر الرئيسي (Hero Section)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        التحكم المباشر في صورة الموديل بالهيدر، البادجات العائمة، كود الخصم، والعناوين
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-white px-3 py-1 rounded-full border border-pink-200 shadow-xs">
                    مباشر في الواجهة ✨
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left: Image Uploader & Live Preview */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-stone-700">
                      صورة الموديل / المنتج الرئيسية بالهيدر:
                    </label>

                    {settings.heroImage ? (
                      <div className="relative aspect-[4/5] max-w-xs mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                        <Image src={settings.heroImage} alt="Hero banner" fill className="object-cover object-top" />
                        
                        {/* Live Floating Badge 1 preview */}
                        <div className="absolute top-3 right-3 bg-white/95 py-1.5 px-3 rounded-xl shadow-xs border border-pink-100 text-[10px]">
                          <span className="font-bold text-stone-800 block">{settings.heroBadgeText || 'أعلى تقييم ⭐ 4.9'}</span>
                          <span className="text-stone-400 block">{settings.heroBadgeSubtext || 'أزياء صيف 2026'}</span>
                        </div>

                        {/* Live Floating Badge 2 preview */}
                        <div className="absolute bottom-3 left-3 bg-white/95 py-1.5 px-3 rounded-xl shadow-xs border border-pink-100 text-[10px]">
                          <span className="text-stone-700 block font-medium">{settings.heroCouponTitle || 'كود الخصم الفوري'}</span>
                          <span className="font-black text-rose-600 block">{settings.heroCouponCode || 'GIRL10'} {settings.heroCouponDiscount ? `(${settings.heroCouponDiscount})` : ''}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, heroImage: '' })}
                          className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow transition"
                          title="إزالة الصورة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-[4/5] max-w-xs mx-auto rounded-3xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-white flex flex-col items-center justify-center cursor-pointer transition p-4 text-center">
                        <Upload className="w-8 h-8 text-rose-500 mb-2" />
                        <span className="text-xs font-bold text-rose-600">
                          {uploadingHeroImage ? 'جاري رفع الصورة لـ Cloudinary...' : 'رفع صورة الموديل / المنتج'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1">
                          يدعم JPG, PNG, WebP (يُفضل صورة عمودية 4:5 عالية الجودة)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          disabled={uploadingHeroImage}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* Quick presets / Direct URL */}
                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1">
                        أو ضعي رابط الصورة المباشر:
                      </label>
                      <input
                        type="url"
                        value={settings.heroImage || ''}
                        onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Right: Badges, Texts & Coupon settings */}
                  <div className="space-y-4">
                    {/* Badge 1 (Rating / Tag) */}
                    <div className="p-3.5 bg-white rounded-2xl border border-pink-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                        <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>البادج العائم العلوي (التقييم / التريند):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">النص الرئيسي</label>
                          <input
                            type="text"
                            value={settings.heroBadgeText || ''}
                            onChange={(e) => setSettings({ ...settings, heroBadgeText: e.target.value })}
                            placeholder="أعلى تقييم ⭐ 4.9"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">النص الفرعي</label>
                          <input
                            type="text"
                            value={settings.heroBadgeSubtext || ''}
                            onChange={(e) => setSettings({ ...settings, heroBadgeSubtext: e.target.value })}
                            placeholder="أزياء صيف 2026"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Badge 2 (Coupon Badge) */}
                    <div className="p-3.5 bg-white rounded-2xl border border-pink-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                        <Tag className="w-3.5 h-3.5 text-rose-500" />
                        <span>البادج العائم السفلي (كود الخصم الفوري):</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">عنوان البادج</label>
                          <input
                            type="text"
                            value={settings.heroCouponTitle || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponTitle: e.target.value })}
                            placeholder="كود الخصم الفوري"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">كود الخصم</label>
                          <input
                            type="text"
                            value={settings.heroCouponCode || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponCode: e.target.value.toUpperCase() })}
                            placeholder="GIRL10"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200 font-mono uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">قيمة الخصم</label>
                          <input
                            type="text"
                            value={settings.heroCouponDiscount || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponDiscount: e.target.value })}
                            placeholder="خصم 10%"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200 font-bold text-rose-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Main Title & Subtitle */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          عنوان الهيدر الرئيسي (Title)
                        </label>
                        <input
                          type="text"
                          value={settings.heroTitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                          placeholder="كوني الأجمل في كل إطلالة مع Fashion Zone"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          النص الترحيبي الفرعي (Subtitle)
                        </label>
                        <textarea
                          rows={2}
                          value={settings.heroSubtitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                          placeholder="اكتشفي تشكيلة راقية ومختارة بعناية..."
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">نص زر الشراء</label>
                        <input
                          type="text"
                          value={settings.heroCtaText || ''}
                          onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })}
                          placeholder="تسوقي الآن / Shop Now"
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">رابط الزر</label>
                        <input
                          type="text"
                          value={settings.heroCtaLink || ''}
                          onChange={(e) => setSettings({ ...settings, heroCtaLink: e.target.value })}
                          placeholder="#catalog"
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200 font-mono"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Section 2: Special Offer Mid-Page Banner (بنر العروض والخصومات بالصفحة الرئيسية - المعروض بالصورة) */}
              <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-rose-50/60 border border-pink-200">
                <div className="flex items-center justify-between pb-3 border-b border-pink-200">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        🎯 بنر العروض والتخفيضات المميزة بالصفحة الرئيسية (Special Offer Banner)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        البنر الإعلاني العريض في منتصف الصفحة (خصم الـ 35%، نص العرض، زر تصفحي العروض الآن، وصورة العرض)
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-pink-200 shadow-xs">
                    <input
                      type="checkbox"
                      checked={settings.heroBannerEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, heroBannerEnabled: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                    />
                    <span className="text-xs font-bold text-stone-700">تفعيل إظهار البنر</span>
                  </label>
                </div>

                {/* Live Banner Preview (كما يظهر للعميلة بالظبط كما في سكرين شوت المستخدم) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">معاينة حية لشكل البنر في المتجر:</label>
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white p-6 shadow-md">
                    <div className="relative z-10 space-y-2.5 max-w-lg">
                      <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {settings.heroBannerBadge || 'عرض محدود لفترة وجيزة'}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black leading-snug font-serif">
                        {settings.heroBannerTitle || 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!'}
                      </h4>
                      <p className="text-pink-100 text-xs leading-relaxed line-clamp-2">
                        {settings.heroBannerSubtitle || 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.'}
                      </p>
                      <div className="pt-1">
                        <span className="inline-block px-5 py-2 bg-white text-rose-600 font-black rounded-full text-xs shadow">
                          {settings.heroBannerCtaText || 'تصفحي العروض الآن'}
                        </span>
                      </div>
                    </div>
                    {settings.heroBannerImage && (
                      <div className="absolute top-4 left-4 bottom-4 w-1/3 rounded-xl overflow-hidden border border-white/20 hidden sm:block">
                        <Image src={settings.heroBannerImage} alt="" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      بادج العرض العلوي (Badge)
                    </label>
                    <input
                      type="text"
                      value={settings.heroBannerBadge || ''}
                      onChange={(e) => setSettings({ ...settings, heroBannerBadge: e.target.value })}
                      placeholder="عرض محدود لفترة وجيزة"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      عنوان العرض الرئيسي (Title) *
                    </label>
                    <input
                      type="text"
                      value={settings.heroBannerTitle || ''}
                      onChange={(e) => setSettings({ ...settings, heroBannerTitle: e.target.value })}
                      placeholder="خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    نص وتفاصيل العرض (Subtitle)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.heroBannerSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroBannerSubtitle: e.target.value })}
                    placeholder="اكتبي تفاصيل العرض والخصومات والخامات والشحن..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      نص الزر التفاعلي (Button Text)
                    </label>
                    <input
                      type="text"
                      value={settings.heroBannerCtaText || ''}
                      onChange={(e) => setSettings({ ...settings, heroBannerCtaText: e.target.value })}
                      placeholder="تصفحي العروض الآن"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      رابط التوجيه عند النقر (Button Link)
                    </label>
                    <input
                      type="text"
                      value={settings.heroBannerCtaLink || ''}
                      onChange={(e) => setSettings({ ...settings, heroBannerCtaLink: e.target.value })}
                      placeholder="#catalog أو /category/dresses"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono"
                    />
                  </div>
                </div>

                {/* Optional Banner Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    صورة مرافقة للبنر (اختياري - ترفع لـ Cloudinary)
                  </label>
                  {settings.heroBannerImage ? (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-pink-200 mb-2">
                      <Image src={settings.heroBannerImage} alt="Banner image" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, heroBannerImage: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow"
                        title="إزالة الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-20 rounded-2xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-white flex flex-col items-center justify-center cursor-pointer transition">
                      <Upload className="w-5 h-5 text-rose-500 mb-0.5" />
                      <span className="text-xs font-bold text-rose-600">
                        {uploadingMidBannerImage ? 'جاري رفع صورة البنر...' : 'رفع صورة إضافية للبنر (اختياري)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMidBannerImageUpload}
                        disabled={uploadingMidBannerImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Section 3: Promo Popup Modal Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        النافذة الإعلانية الترويجية المنبثقة (Promo Popup Modal)
                      </h3>
                      <p className="text-[11px] text-stone-400">تظهر للزائرات عند الدخول بالمتجر لجذبهن بكود خصم أو صورة عرض</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-pink-50/80 px-3 py-1.5 rounded-xl border border-pink-200">
                    <input
                      type="checkbox"
                      checked={settings.promoPopupEnabled}
                      onChange={(e) => setSettings({ ...settings, promoPopupEnabled: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                    />
                    <span className="text-xs font-bold text-stone-700">تفعيل النافذة المنبثقة</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">عنوان الإعلان *</label>
                    <input
                      type="text"
                      value={settings.promoPopupTitle || ''}
                      onChange={(e) => setSettings({ ...settings, promoPopupTitle: e.target.value })}
                      placeholder="مثال: عرض خاص وحصري لكِ يا جميلة ✨"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">كود الخصم المرتبط بالإعلان</label>
                    <input
                      type="text"
                      value={settings.promoCouponCode || ''}
                      onChange={(e) => setSettings({ ...settings, promoCouponCode: e.target.value.toUpperCase() })}
                      placeholder="GIRL10"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 uppercase font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">نص تفاصيل العرض الترويجي</label>
                  <textarea
                    rows={2}
                    value={settings.promoPopupText || ''}
                    onChange={(e) => setSettings({ ...settings, promoPopupText: e.target.value })}
                    placeholder="اكتبي تفاصيل الخصم أو الشحن المجاني للعميلة..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                  ></textarea>
                </div>

                {/* Promo Image Upload (Cloudinary) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    صورة الإعلان المنبثق (اختياري - ترفع لـ Cloudinary)
                  </label>
                  {settings.promoPopupImage ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-pink-200 mb-2">
                      <Image src={settings.promoPopupImage} alt="Ad image" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, promoPopupImage: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-24 rounded-2xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/30 flex flex-col items-center justify-center cursor-pointer transition">
                      <Upload className="w-5 h-5 text-rose-500 mb-1" />
                      <span className="text-xs font-bold text-rose-600">
                        {uploadingAdImage ? 'جاري رفع صورة الإعلان...' : 'رفع صورة بانر الإعلان'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdImageUpload}
                        disabled={uploadingAdImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Section 2: Announcement Bar */}
              <div className="space-y-4 pt-6 border-t border-pink-100">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">شريط الإعلانات العلوي (Announcement Bar)</h3>
                      <p className="text-[11px] text-stone-400">يظهر أعلى الهيدر في كل صفحات الموقع</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-pink-50/80 px-3 py-1.5 rounded-xl border border-pink-200">
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">نص الإعلان العلوي</label>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200"
                  />
                </div>
              </div>

              {/* Section 3: WhatsApp & Social Media Links */}
              <div className="space-y-4 pt-6 border-t border-pink-100">
                <div className="flex items-center gap-2 pb-2">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">رقم الواتساب وروابط التواصل الاجتماعي</h3>
                    <p className="text-[11px] text-stone-400">يتم التحديث فوراً في كامل أزرار المتجر والفوتر</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    رقم الواتساب الرئيسي لاستقبال الطلبات والاستفسارات *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">رابط الفيسبوك</label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">رابط الإنستغرام</label>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">رابط التيك توك</label>
                    <input
                      type="url"
                      value={settings.tiktokUrl}
                      onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Save */}
              <div className="pt-4 border-t border-pink-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-8 py-3.5 rounded-2xl shadow-md transition flex items-center gap-2"
                >
                  {savingSettings ? (
                    <span>جاري حفظ كافة الإعدادات...</span>
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
