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
  Palette,
  Image as ImageIcon,
  Printer,
  Menu,
  Bell,
  TrendingUp,
  ArrowUpRight,
  SlidersHorizontal,
  Video,
  Play,
  Volume2,
  VolumeX,
  Send,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { applyWatermarkToFile } from '@/lib/watermark';
import { registerPushSubscription } from '@/lib/pushHelper';

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
  heroCouponEnabled?: boolean;
  heroBadgeEnabled?: boolean;
  heroProductId?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  watermarkEnabled?: boolean;
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'center';
}

interface FashionReelItem {
  id: string;
  title: string;
  code?: string;
  views?: string;
  duration?: string;
  thumbnail: string;
  videoUrl: string;
  price?: number;
  slug?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
}

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'coupons' | 'reels' | 'ads_settings';

export default function AdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chartHoverDay, setChartHoverDay] = useState<number | null>(4); // Default hover on Tuesday
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');

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
    heroCouponTitle: '',
    heroCouponCode: '',
    heroCouponDiscount: '',
    heroCouponEnabled: true,
    heroBadgeEnabled: true,
    heroProductId: '',
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
  const [prodSlug, setProdSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [newProdImageUrlInput, setNewProdImageUrlInput] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#e11d48');
  const [autoWatermark, setAutoWatermark] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'center'>('bottom-right');
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

  // Products search, filter & quick link copy
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'NEW_ARRIVALS'>('ALL');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Printing thermal waybill modal state
  const [printingOrder, setPrintingOrder] = useState<OrderItem | null>(null);

  // Settings saving state
  const [savingSettings, setSavingSettings] = useState(false);

  // Custom Sizes states & Presets
  const [customSizeInput, setCustomSizeInput] = useState('');
  const standardSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const plusAndSpecialSizes = ['فري سايز', 'وان سايز', 'أوفر سايز', 'مقاس خاص', 'جامبو', '50', '52', '54', '56', '58'];
  const weightBasedSizes = ['يلبس 60-80 ك', 'يلبس 80-100 ك', 'يلبس 100-120 ك'];
  const kidsAndNumberSizes = ['مقاس 1', 'مقاس 2', 'مقاس 3', 'سنتين', '4 سنين', '6 سنين', '8 سنين', '10 سنين', '12 سنة', '14 سنة', '16 سنة'];

  // Fashion Boutique Colors Presets
  const PRESET_COLORS: { name: string; hex: string }[] = [
    { name: 'أسود', hex: '#18181b' },
    { name: 'أبيض', hex: '#ffffff' },
    { name: 'بيج', hex: '#f5f5dc' },
    { name: 'أوف وايت', hex: '#fcfbf7' },
    { name: 'كحلي', hex: '#1e3a8a' },
    { name: 'رمادي', hex: '#71717a' },
    { name: 'كشمير', hex: '#e0a899' },
    { name: 'وردي', hex: '#f472b6' },
    { name: 'روز', hex: '#fb7185' },
    { name: 'نبيتي', hex: '#881337' },
    { name: 'أحمر', hex: '#e11d48' },
    { name: 'زيتي', hex: '#3f6212' },
    { name: 'أخضر', hex: '#15803d' },
    { name: 'موف', hex: '#9333ea' },
    { name: 'لافندر', hex: '#c084fc' },
    { name: 'سيمون', hex: '#fca5a5' },
    { name: 'جملي', hex: '#c19a6b' },
    { name: 'هافان', hex: '#964B00' },
    { name: 'بترولي', hex: '#0e7490' },
    { name: 'مستردة', hex: '#eab308' },
    { name: 'تايجر', hex: '#b45309' },
    { name: 'بني', hex: '#78350f' },
  ];

  // Product Edit states
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdNameEn, setEditProdNameEn] = useState('');
  const [editProdCode, setEditProdCode] = useState('');
  const [editProdSlug, setEditProdSlug] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('');
  const [editProdCategoryId, setEditProdCategoryId] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdSizes, setEditProdSizes] = useState<string[]>([]);
  const [editProdCustomSizeInput, setEditProdCustomSizeInput] = useState('');
  const [editProdColors, setEditProdColors] = useState<{ name: string; hex: string }[]>([]);
  const [editCustomColorName, setEditCustomColorName] = useState('');
  const [editCustomColorHex, setEditCustomColorHex] = useState('#e11d48');
  const [editProdImages, setEditProdImages] = useState<string[]>([]);
  const [editProdImageUrlInput, setEditProdImageUrlInput] = useState('');
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

  // Reels states (فيديوهات الموديلات على الطبيعة)
  const [reels, setReels] = useState<FashionReelItem[]>([]);
  const [showAddReelModal, setShowAddReelModal] = useState(false);
  const [editingReel, setEditingReel] = useState<FashionReelItem | null>(null);
  const [previewReel, setPreviewReel] = useState<FashionReelItem | null>(null);
  const [reelTitle, setReelTitle] = useState('');
  const [reelCode, setReelCode] = useState('');
  const [reelViews, setReelViews] = useState('14.2K');
  const [reelDuration, setReelDuration] = useState('0:28');
  const [reelThumbnail, setReelThumbnail] = useState('');
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelPrice, setReelPrice] = useState('');
  const [reelSlug, setReelSlug] = useState('');
  const [savingReel, setSavingReel] = useState(false);
  const [uploadingReelThumb, setUploadingReelThumb] = useState(false);

  // Audio Alerts & Real-time Live Order states
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<OrderItem | null>(null);
  const [adminPushSubscribed, setAdminPushSubscribed] = useState(false);

  // Push Broadcast Notification Modal states
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('/');
  const [broadcastTarget, setBroadcastTarget] = useState<'CUSTOMER' | 'ALL'>('CUSTOMER');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Web Audio API Crystal Bell Chime
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.55);

      // Note 2: C#6 (1108.73Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1108.73, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);

      // Note 3: E6 (1318.51Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.51, now + 0.3);
      gain3.gain.setValueAtTime(0.25, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 1.15);
    } catch (err) {
      console.warn('Audio chime warning:', err);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [catsRes, prodsRes, ordersRes, settingsRes, couponsRes, reelsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/settings'),
        fetch('/api/coupons'),
        fetch('/api/reels?all=true'),
      ]);

      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();
      const ordersData = await ordersRes.json();
      const settingsData = await settingsRes.json();
      const couponsData = await couponsRes.json();
      const reelsData = await reelsRes.json();

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
      if (reelsData.success && Array.isArray(reelsData.reels)) {
        setReels(reelsData.reels);
      }
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
        if (settingsData.settings.watermarkEnabled !== undefined) {
          setAutoWatermark(Boolean(settingsData.settings.watermarkEnabled));
        }
        if (settingsData.settings.watermarkPosition) {
          setWatermarkPosition(settingsData.settings.watermarkPosition);
        }
      }
      if (couponsData.success && couponsData.coupons) {
        setCoupons(couponsData.coupons);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  // Instant sync for Watermark settings to backend
  const handleUpdateWatermarkSettings = async (enabled: boolean, pos: 'bottom-right' | 'bottom-left' | 'center') => {
    setAutoWatermark(enabled);
    setWatermarkPosition(pos);
    setSettings((prev) => ({ ...prev, watermarkEnabled: enabled, watermarkPosition: pos }));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watermarkEnabled: enabled, watermarkPosition: pos }),
      });
      setSuccessMessage('تم حفظ وتطبيق موضع لوجو المتجر على جميع صفحات المنتجات بنجاح! ✨');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save watermark settings', err);
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

  // Real-time live polling for incoming orders (every 12 seconds)
  useEffect(() => {
    if (authLoading) return;

    const pollInterval = setInterval(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
        const res = await fetch('/api/orders', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders((prevOrders) => {
            if (prevOrders.length > 0 && data.orders.length > prevOrders.length) {
              const latestOrder = data.orders[0];
              const alreadyKnown = prevOrders.some((o) => o.id === latestOrder.id);
              if (!alreadyKnown) {
                if (audioAlertsEnabled) {
                  playOrderChime();
                }
                setNewOrderAlert(latestOrder);
                confetti({ particleCount: 70, spread: 60 });
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                  new Notification('🔔 طلب شراء جديد في Fashion Zone!', {
                    body: `وصل طلب جديد برقم ${latestOrder.orderNumber} بقيمة ${latestOrder.total} ج.م من ${latestOrder.customerName}`,
                    icon: '/icon-192.png',
                  });
                }
              }
            }
            return data.orders;
          });
        }
      } catch (err) {
        // Background poll silent catch
      }
    }, 12000);

    return () => clearInterval(pollInterval);
  }, [authLoading, audioAlertsEnabled]);

  // Enable Admin Web Push
  const handleEnableAdminPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('المتصفح الحالي لا يدعم إشعارات الويب.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      const success = await registerPushSubscription('ADMIN');
      if (success) {
        setAdminPushSubscribed(true);
        confetti({ particleCount: 60, spread: 60 });
        setSuccessMessage('تم تفعيل إشعارات الهاتف بنجاح! ستصلك تنبيهات فورية عند أي طلب جديد حتى لو كان المتصفح مغلقاً ✨');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('تم إعطاء الإذن ولكن تعذر حفظ الاشتراك في الخادم.');
      }
    } else {
      alert('يرجى السماح بالإشعارات من إعدادات المتصفح.');
    }
  };

  // Broadcast Web Push to customers
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      alert('يرجى كتابة عنوان الإشعار ومحتواه.');
      return;
    }
    setSendingBroadcast(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          url: broadcastUrl || '/',
          role: broadcastTarget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70 });
        setSuccessMessage(`تم إرسال الإشعار بنجاح إلى ${data.sentCount || 0} هاتف وجهاز مشترك! 🚀`);
        setShowBroadcastModal(false);
        setBroadcastTitle('');
        setBroadcastBody('');
        setBroadcastUrl('/');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert(data.error || 'تعذر إرسال الإشعار.');
      }
    } catch (err: any) {
      alert('خطأ أثناء إرسال الإشعار: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Reels CRUD Handlers
  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelTitle.trim() || !reelVideoUrl.trim() || !reelThumbnail.trim()) {
      alert('يرجى إدخال عنوان الموديل، ورابط الفيديو، وصورة الغلاف.');
      return;
    }
    setSavingReel(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: reelTitle.trim(),
          code: reelCode.trim() || null,
          views: reelViews.trim() || '14.2K',
          duration: reelDuration.trim() || '0:28',
          thumbnail: reelThumbnail.trim(),
          videoUrl: reelVideoUrl.trim(),
          price: reelPrice ? parseFloat(reelPrice) : null,
          slug: reelSlug.trim() || null,
          orderIndex: reels.length,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.reel) {
        setReels((prev) => [data.reel, ...prev]);
        setShowAddReelModal(false);
        setReelTitle('');
        setReelCode('');
        setReelPrice('');
        setReelSlug('');
        setReelThumbnail('');
        setReelVideoUrl('');
        confetti({ particleCount: 60, spread: 60 });
        setSuccessMessage('تمت إضافة فيديو الموديل ونشره في قسم «شاهدي الموديلات على الطبيعة» بنجاح! 🎥✨');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert(data.error || 'تعذر حفظ الفيديو.');
      }
    } catch (err: any) {
      alert('خطأ أثناء إضافة الفيديو: ' + err.message);
    } finally {
      setSavingReel(false);
    }
  };

  const handleUpdateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;
    setSavingReel(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
      const res = await fetch('/api/reels', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: editingReel.id,
          title: reelTitle.trim(),
          code: reelCode.trim() || null,
          views: reelViews.trim(),
          duration: reelDuration.trim(),
          thumbnail: reelThumbnail.trim(),
          videoUrl: reelVideoUrl.trim(),
          price: reelPrice ? parseFloat(reelPrice) : null,
          slug: reelSlug.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.reel) {
        setReels((prev) => prev.map((r) => (r.id === data.reel.id ? data.reel : r)));
        setEditingReel(null);
        setSuccessMessage('تم تحديث بيانات فيديو الموديل بنجاح! ✨');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.error || 'تعذر تعديل الفيديو.');
      }
    } catch (err: any) {
      alert('خطأ أثناء تعديل الفيديو: ' + err.message);
    } finally {
      setSavingReel(false);
    }
  };

  const handleToggleReelActive = async (reel: FashionReelItem) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
      const nextState = !reel.isActive;
      const res = await fetch('/api/reels', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: reel.id,
          isActive: nextState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, isActive: nextState } : r)));
        setSuccessMessage(nextState ? 'تم تفعيل ظهور الفيديو في المتجر ✓' : 'تم إخفاء الفيديو من المتجر ✕');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle reel', err);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا الفيديو من قسم الموديلات على الطبيعة؟')) {
      return;
    }
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
      const res = await fetch(`/api/reels?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setReels((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage('تم حذف الفيديو بنجاح.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete reel', err);
    }
  };

  const handleReelThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReelThumb(true);
    try {
      let finalFile = file;
      if (autoWatermark) {
        try {
          finalFile = await applyWatermarkToFile(file, { position: watermarkPosition });
        } catch (wmErr) {
          console.warn('Watermark warning:', wmErr);
        }
      }
      const formData = new FormData();
      formData.append('file', finalFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setReelThumbnail(data.url);
      } else {
        alert('فشل رفع صورة الغلاف.');
      }
    } catch (err) {
      console.error('Error uploading reel thumbnail', err);
    } finally {
      setUploadingReelThumb(false);
    }
  };

  // Upload Product Image to Cloudinary (with optional auto-watermark)
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (autoWatermark) {
          try {
            file = await applyWatermarkToFile(file, { position: watermarkPosition });
          } catch (wErr) {
            console.error('Watermark error:', wErr);
          }
        }

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

  // Add Image by URL in New Product Form
  const handleAddNewProductImageUrl = () => {
    if (!newProdImageUrlInput.trim()) return;
    setUploadedImages((prev) => [...prev, newProdImageUrlInput.trim()]);
    setNewProdImageUrlInput('');
  };

  // Set Main Image in New Product Form
  const handleSetMainNewProductImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      const others = prev.filter((_, idx) => idx !== index);
      return [target, ...others];
    });
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

  // Professional Hero Product Selector
  const handleSelectHeroProduct = (productId: string) => {
    if (!productId) {
      setSettings((prev) => ({
        ...prev,
        heroProductId: '',
      }));
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const mainImg = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : '';
    const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
    const discountPercent = hasDiscount
      ? Math.round((1 - prod.price / prod.originalPrice!) * 100)
      : 0;

    setSettings((prev) => ({
      ...prev,
      heroProductId: prod.id,
      heroImage: mainImg || prev.heroImage,
      heroCtaLink: `/product/${prod.slug}`,
      heroCtaText: `تسوقي هذا الموديل الآن (${prod.price} ج.م)`,
      heroBadgeText: prod.code ? `كود: #${prod.code}` : 'الأكثر طلباً 🔥',
      heroBadgeSubtext: prod.name,
      heroBadgeEnabled: true,
      heroCouponEnabled: Boolean(hasDiscount),
      heroCouponDiscount: hasDiscount ? `خصم ${discountPercent}%` : '',
      heroCouponCode: hasDiscount && prod.code ? `OFF-${prod.code}` : '',
      heroCouponTitle: hasDiscount ? 'عرض خاص على الموديل' : '',
    }));

    setSuccessMessage(`تم ربط الموديل "${prod.name}" بالهيدر بنجاح! تم تحديث الصورة والرابط والخصم تلقائياً. ✨`);
    setTimeout(() => setSuccessMessage(''), 5000);
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
      'هافان': '#964B00',
      'جملي': '#c19a6b',
      'بني': '#78350f',
      'أوف وايت': '#fcfbf7',
      'مستردة': '#eab308',
      'بترولي': '#0e7490',
    };
    const detectedColors: { name: string; hex: string }[] = [];
    Object.keys(colorDictionary).forEach((col) => {
      if (col === 'بيج') {
        const hasColorWord = /(?:لون|اللون|ألوان|باللون|الوان)\s*[:=]?\s*بيج/i.test(text);
        const textWithoutPyjamas = text.replace(/بيجام[ةهات]/gi, '');
        const isStandalone = /(?:^|[^\w\u0600-\u06FF])بيج(?=[^\w\u0600-\u06FF]|$)/i.test(textWithoutPyjamas);
        if (hasColorWord || isStandalone) {
          if (!detectedColors.some((c) => c.name === col)) {
            detectedColors.push({ name: col, hex: colorDictionary[col] });
          }
        }
        return;
      }

      const colRegex = new RegExp(`(?:^|[^\\w\\u0600-\\u06FF])${col}(?=[^\\w\\u0600-\\u06FF]|$)`, 'i');
      if (colRegex.test(text)) {
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
          slug: prodSlug.trim() || undefined,
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
        setProdSlug('');
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

  // Color Handlers (Supports custom colors, hex picker, and presets)
  const handleToggleColor = (col: { name: string; hex: string }, isEdit = false) => {
    if (isEdit) {
      setEditProdColors((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
        return exists ? prev.filter((c) => c.name.toLowerCase() !== col.name.toLowerCase()) : [...prev, col];
      });
    } else {
      setSelectedColors((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
        return exists ? prev.filter((c) => c.name.toLowerCase() !== col.name.toLowerCase()) : [...prev, col];
      });
    }
  };

  const handleRemoveColor = (colorName: string, isEdit = false) => {
    if (isEdit) {
      setEditProdColors((prev) => prev.filter((c) => c.name.toLowerCase() !== colorName.toLowerCase()));
    } else {
      setSelectedColors((prev) => prev.filter((c) => c.name.toLowerCase() !== colorName.toLowerCase()));
    }
  };

  const handleClearColors = (isEdit = false) => {
    if (isEdit) {
      setEditProdColors([]);
    } else {
      setSelectedColors([]);
    }
  };

  const handleAddCustomColor = (isEdit = false) => {
    const nameToAdd = isEdit ? editCustomColorName.trim() : customColorName.trim();
    const hexToAdd = isEdit ? editCustomColorHex : customColorHex;
    if (!nameToAdd) return;

    const newColorObj = { name: nameToAdd, hex: hexToAdd || '#e11d48' };

    if (isEdit) {
      setEditProdColors((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === nameToAdd.toLowerCase())) return prev;
        return [...prev, newColorObj];
      });
      setEditCustomColorName('');
    } else {
      setSelectedColors((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === nameToAdd.toLowerCase())) return prev;
        return [...prev, newColorObj];
      });
      setCustomColorName('');
    }
  };

  // Apply watermark to an existing image on demand
  const handleApplyWatermarkToExistingImage = async (imgUrl: string, index: number, isEdit = false) => {
    try {
      setUploadingImage(true);
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], `watermarked-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      const watermarkedFile = await applyWatermarkToFile(file, { position: watermarkPosition });
      const formData = new FormData();
      formData.append('file', watermarkedFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await uploadRes.json();
      if (data.success && data.url) {
        if (isEdit) {
          setEditProdImages((prev) => {
            const next = [...prev];
            next[index] = data.url;
            return next;
          });
        } else {
          setUploadedImages((prev) => {
            const next = [...prev];
            next[index] = data.url;
            return next;
          });
        }
        setSuccessMessage('تم وضع لوجو Fashion Zone على الصورة بنجاح! ✨');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (e: any) {
      console.error('Error applying watermark to existing image:', e);
      alert('تعذر تطبيق اللوجو على هذه الصورة تلقائياً: ' + e.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Start Editing Product
  const handleStartEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdNameEn(prod.nameEn || '');
    setEditProdCode(prod.code || '');
    setEditProdSlug(prod.slug || '');
    setEditProdPrice(prod.price ? prod.price.toString() : '');
    setEditProdOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setEditProdCategoryId(prod.category?.id || (categories.length > 0 ? categories[0].id : ''));
    setEditProdDescription(prod.description || '');
    setEditProdSizes(Array.isArray(prod.sizes) ? [...prod.sizes] : []);
    setEditProdCustomSizeInput('');
    setEditProdColors(Array.isArray(prod.colors) ? [...(prod.colors as any)] : []);
    setEditCustomColorName('');
    setEditProdImages(Array.isArray(prod.images) ? [...prod.images] : []);
    setEditProdImageUrlInput('');
    setEditProdInStock(prod.inStock);
    setEditProdIsNewArrival(Boolean(prod.isNewArrival));
  };

  // Upload Images for Edit Product Modal (with optional auto-watermark)
  const handleEditProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (autoWatermark) {
          try {
            file = await applyWatermarkToFile(file, { position: watermarkPosition });
          } catch (wErr) {
            console.error('Watermark error:', wErr);
          }
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          setEditProdImages((prev) => [...prev, data.url]);
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

  // Add Image by URL in Edit Product Modal
  const handleAddEditProductImageUrl = () => {
    if (!editProdImageUrlInput.trim()) return;
    setEditProdImages((prev) => [...prev, editProdImageUrlInput.trim()]);
    setEditProdImageUrlInput('');
  };

  // Remove Image from Edit Product Modal
  const handleRemoveEditProductImage = (index: number) => {
    setEditProdImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Set Main Image (Move to index 0)
  const handleSetMainEditProductImage = (index: number) => {
    setEditProdImages((prev) => {
      const target = prev[index];
      const others = prev.filter((_, idx) => idx !== index);
      return [target, ...others];
    });
  };

  // Save Edited Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim() || !editProdPrice) {
      alert('يرجى كتابة اسم المنتج وسعره!');
      return;
    }
    if (editProdImages.length === 0) {
      alert('يرجى إضافة صورة واحدة على الأقل للمنتج!');
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
          slug: editProdSlug.trim() || undefined,
          price: parseFloat(editProdPrice),
          originalPrice: editProdOriginalPrice ? parseFloat(editProdOriginalPrice) : null,
          categoryId: editProdCategoryId || undefined,
          description: editProdDescription.trim(),
          sizes: editProdSizes,
          colors: editProdColors,
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

  // Copy product link to clipboard
  const handleCopyProductLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/product/${slug}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedProductId(id);
    setSuccessMessage(`تم نسخ رابط المنتج المباشر بنجاح! 📋`);
    setTimeout(() => {
      setCopiedProductId(null);
      setSuccessMessage('');
    }, 3000);
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const q = productSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q));

    const matchesCat =
      productCategoryFilter === 'ALL' ||
      p.category?.id === productCategoryFilter ||
      p.category?.name === productCategoryFilter;

    const matchesStock =
      productStockFilter === 'ALL'
        ? true
        : productStockFilter === 'IN_STOCK'
        ? p.inStock
        : productStockFilter === 'OUT_OF_STOCK'
        ? !p.inStock
        : p.isNewArrival;

    return matchesSearch && matchesCat && matchesStock;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pink-50/50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-rose-500 animate-spin mb-3"></div>
        <p className="text-xs font-bold text-stone-600">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  const chartDays = [
    { day: 'السبت', sales: Math.round(totalRevenue * 0.12 || 14200), conversion: '3.6%', orders: 4, x: 50, ySales: 155 },
    { day: 'الأحد', sales: Math.round(totalRevenue * 0.18 || 22500), conversion: '4.1%', orders: 7, x: 140, ySales: 115 },
    { day: 'الإثنين', sales: Math.round(totalRevenue * 0.22 || 31800), conversion: '4.5%', orders: 11, x: 230, ySales: 90 },
    { day: 'الثلاثاء', sales: Math.round(totalRevenue * 0.28 || 48250), conversion: '4.8%', orders: 14, x: 320, ySales: 60 },
    { day: 'الأربعاء', sales: Math.round(totalRevenue * 0.25 || 38900), conversion: '4.4%', orders: 12, x: 410, ySales: 75 },
    { day: 'الخميس', sales: Math.round(totalRevenue * 0.32 || 54100), conversion: '5.2%', orders: 16, x: 500, ySales: 45 },
    { day: 'الجمعة', sales: Math.round(totalRevenue * 0.38 || 62400), conversion: '5.6%', orders: 19, x: 590, ySales: 30 },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex overflow-x-hidden" dir="rtl">
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ======================================================== */}
      {/* LUXURY BOUTIQUE RIGHT SIDEBAR */}
      {/* ======================================================== */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-[#0e131f] text-stone-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-wide font-serif">
                  Fashion Zone
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300/80 block">
                  BOUTIQUE & BEAUTY ✨
                </span>
              </div>
            </div>
            {/* Close on Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              title="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            لوحة الإدارة
          </div>

          {/* 1. Overview */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-rose-400'}`} />
              <span>نظرة عامة وإحصائيات</span>
            </div>
          </button>

          {/* 2. Products */}
          <button
            onClick={() => {
              setActiveTab('products');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className={`w-4 h-4 ${activeTab === 'products' ? 'text-white' : 'text-rose-400'}`} />
              <span>المنتجات والمخزون</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* 3. Orders */}
          <button
            onClick={() => {
              setActiveTab('orders');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white' : 'text-rose-400'}`} />
              <span>الطلبات وبوالص الشحن</span>
            </div>
            {pendingOrdersCount > 0 ? (
              <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                {pendingOrdersCount} جديد
              </span>
            ) : (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {orders.length}
              </span>
            )}
          </button>

          {/* 4. Categories */}
          <button
            onClick={() => {
              setActiveTab('categories');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className={`w-4 h-4 ${activeTab === 'categories' ? 'text-white' : 'text-rose-400'}`} />
              <span>الأقسام والناف بار</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {categories.length}
            </span>
          </button>

          {/* 5. Coupons */}
          <button
            onClick={() => {
              setActiveTab('coupons');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'coupons'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Tag className={`w-4 h-4 ${activeTab === 'coupons' ? 'text-white' : 'text-rose-400'}`} />
              <span>أكواد الخصم والعروض</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'coupons' ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {coupons.length}
            </span>
          </button>

          {/* 6. Reels - Videos from Real Life */}
          <button
            onClick={() => {
              setActiveTab('reels');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'reels'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Video className={`w-4 h-4 ${activeTab === 'reels' ? 'text-white' : 'text-rose-400'}`} />
              <span>الموديلات على الطبيعة 🎥</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'reels' ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {reels.length}
            </span>
          </button>

          {/* 7. Accounting */}
          <Link
            href="/admin/accounting"
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-emerald-900/40"
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>الحسابات والمصروفات</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400/80" />
          </Link>

          {/* 7. Settings & Watermark */}
          <button
            onClick={() => {
              setActiveTab('ads_settings');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'ads_settings'
                ? 'bg-gradient-to-l from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className={`w-4 h-4 ${activeTab === 'ads_settings' ? 'text-white' : 'text-rose-400'}`} />
              <span>إعدادات المتجر واللوجو</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800/80 space-y-2.5 bg-stone-950/40">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/50 py-2 px-3 rounded-xl transition border border-rose-800/30"
            >
              <Store className="w-3.5 h-3.5" />
              <span>معاينة المتجر ↗</span>
            </Link>

            <Link
              href="/track"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 py-2 px-3 rounded-xl transition border border-stone-800"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>صفحة التتبع</span>
            </Link>
          </div>

          {/* Admin User Info & Logout */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                {(currentAdmin?.name || 'A')[0]}
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-white text-xs truncate max-w-[120px]">
                  {currentAdmin?.name || 'مديرة المتجر'}
                </span>
                <span className="block text-[10px] text-emerald-400">جلسة نشطة ✓</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="text-stone-400 hover:text-red-400 hover:bg-red-950/40 p-2 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Right: Hamburger on mobile + Live status + Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
              title="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 text-xs font-bold whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>المتجر مباشر أونلاين 🟢</span>
            </div>

            {/* Quick Live Search */}
            <div className="relative flex-1 hidden md:block">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  if (activeTab !== 'products' && e.target.value) {
                    setActiveTab('products');
                  }
                }}
                placeholder="بحث سريع عن منتج، كود أو عميلة..."
                className="w-full pr-9 pl-4 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition outline-hidden"
              />
            </div>
          </div>

          {/* Left: Audio Toggle + Broadcast + Quick Add Product + Notification Bell + Admin Avatar */}
          <div className="flex items-center gap-2">
            
            {/* Audio Alert Toggle & Test Chime */}
            <button
              onClick={() => {
                const nextState = !audioAlertsEnabled;
                setAudioAlertsEnabled(nextState);
                if (nextState) {
                  playOrderChime();
                }
              }}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                audioAlertsEnabled
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200'
              }`}
              title={
                audioAlertsEnabled
                  ? 'صوت تنبيه الطلبات الفوري مفعّل ✓ (اضغطي لتجربة الرنين أو كتمه)'
                  : 'صوت تنبيه الطلبات مكتوم (اضغطي للتفعيل)'
              }
            >
              {audioAlertsEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span className="hidden xl:inline">{audioAlertsEnabled ? 'رنين الطلبات مفعّل' : 'مكتوم'}</span>
            </button>

            {/* Broadcast Push to Customers Button */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              title="إرسال إشعار فوري لجميع هواتف العميلات المشتركات"
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">إشعار جماعي</span>
            </button>

            {/* Admin Mobile Push Subscription Button */}
            {!adminPushSubscribed && (
              <button
                onClick={handleEnableAdminPush}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl transition hidden sm:flex items-center gap-1.5 shadow-xs"
                title="تفعيل إشعارات الطلبات الفورية على هذا الهاتف/الجهاز حتى عند إغلاق المتصفح"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden xl:inline">إشعارات الهاتف</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('products');
                setShowAddProductModal(true);
              }}
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة منتج</span>
              <span className="sm:hidden">منتج</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
              title="الطلبات الجديدة"
            >
              <Bell className="w-4 h-4" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-stone-200">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                👩‍💼
              </div>
              <span className="text-xs font-bold text-stone-800">{currentAdmin?.name || 'مديرة المتجر'}</span>
            </div>
          </div>
        </header>

        {/* Live New Order Real-Time Alert Toast */}
        {newOrderAlert && (
          <div className="px-4 sm:px-6 lg:px-8 mt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-xl flex items-center justify-between animate-bounce border border-white/20">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl animate-pulse flex-shrink-0">
                  🔔
                </span>
                <div>
                  <h4 className="font-black text-xs sm:text-sm">طلب شراء جديد وصل الآن للمتجر! (#{newOrderAlert.orderNumber})</h4>
                  <p className="text-[11px] text-pink-100">
                    العميلة: <span className="font-bold underline text-white">{newOrderAlert.customerName}</span> | الإجمالي:{' '}
                    <span className="font-bold text-white font-sans">{newOrderAlert.total} ج.م</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setNewOrderAlert(null);
                  }}
                  className="bg-white text-rose-600 px-3.5 py-1.5 rounded-xl font-black text-xs hover:bg-pink-50 shadow-md transition whitespace-nowrap"
                >
                  معاينة الطلب 👁️
                </button>
                <button
                  onClick={() => setNewOrderAlert(null)}
                  className="text-white hover:text-white/70 p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="px-4 sm:px-6 lg:px-8 mt-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage('')} className="p-1 text-emerald-600 hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW & STATS */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Greeting Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif flex items-center gap-2">
                    <span>مرحباً، {currentAdmin?.name || 'مديرة المتجر'}</span>
                    <span className="text-amber-500 text-lg">✨</span>
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    مؤشرات أداء اليوم والطلبات الجديدة ومتابعة مبيعات البوتيك المباشرة
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 bg-white border border-stone-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                    📅 {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* 4 Luxury Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Revenue */}
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-md transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-500">إجمالي مبيعات اليوم</span>
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
                    {totalRevenue.toLocaleString()} <span className="text-sm font-bold text-stone-400">ج.م</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+18% ↗</span>
                    </span>
                    <span className="text-stone-400 font-medium">مبيعات نشطة</span>
                  </div>
                </div>

                {/* 2. Pending Orders */}
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-amber-100/80 shadow-xs hover:shadow-md transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-500">طلبات جديدة معلقة</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
                    {pendingOrdersCount} <span className="text-sm font-bold text-stone-400">طلب</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold">
                    {pendingOrdersCount > 0 ? (
                      <span className="bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 animate-pulse">
                        <span>بحاجة للتجهيز ⚡</span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        تم تأكيد كافة الطلبات ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Products */}
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-pink-100/80 shadow-xs hover:shadow-md transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-500">إجمالي المنتجات النشطة</span>
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
                    {products.length} <span className="text-sm font-bold text-stone-400">قطعة</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                    <span className="bg-pink-50 text-rose-700 px-2 py-0.5 rounded-md border border-pink-100">
                      {inStockCount} متوفرة بالمخزون
                    </span>
                  </div>
                </div>

                {/* 4. Estimated Profit */}
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-purple-100/80 shadow-xs hover:shadow-md transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-500">صافي الأرباح</span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                      <Calculator className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
                    {Math.round(totalRevenue * 0.42 || 22400).toLocaleString()}{' '}
                    <span className="text-sm font-bold text-stone-400">ج.م</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-purple-700">
                    <span className="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      هامش ربح تقديري 42%
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Sales & Conversion Chart (matching approved mockup) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      تحليلات المبيعات اليومية ومعدل التحويل
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      مقارنة بين إجمالي إيرادات المبيعات ونسبة تحويل الزوار إلى مشترين
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 text-xs font-medium pl-3 border-l border-stone-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span className="text-stone-600 text-[11px]">المبيعات اليومية (ج.م)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                        <span className="text-stone-600 text-[11px]">معدل التحويل (%)</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setChartPeriod('week')}
                        className={`px-3 py-1 rounded-lg transition ${
                          chartPeriod === 'week' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        أسبوعي
                      </button>
                      <button
                        onClick={() => setChartPeriod('month')}
                        className={`px-3 py-1 rounded-lg transition ${
                          chartPeriod === 'month' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        شهري
                      </button>
                    </div>
                  </div>
                </div>

                {/* SVG Chart Graphic */}
                <div className="relative w-full h-56 sm:h-64 pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 640 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="40" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="40" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="40" y1="165" x2="600" y2="165" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="40" y1="200" x2="600" y2="200" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Secondary Line (Conversion) Area & Line */}
                    <path
                      d="M 50 165 C 100 150, 180 135, 230 120 C 280 105, 360 110, 410 125 C 460 140, 540 90, 590 75 L 590 200 L 50 200 Z"
                      fill="url(#slateGradient)"
                    />
                    <path
                      d="M 50 165 C 100 150, 180 135, 230 120 C 280 105, 360 110, 410 125 C 460 140, 540 90, 590 75"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />

                    {/* Primary Line (Sales Revenue) Area & Line */}
                    <path
                      d="M 50 155 C 100 135, 180 115, 230 90 C 280 65, 360 70, 410 75 C 460 80, 540 45, 590 30 L 590 200 L 50 200 Z"
                      fill="url(#roseGradient)"
                    />
                    <path
                      d="M 50 155 C 100 135, 180 115, 230 90 C 280 65, 360 70, 410 75 C 460 80, 540 45, 590 30"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3"
                    />

                    {/* Interactive Points on Sales Line */}
                    {chartDays.map((item, idx) => (
                      <g key={item.day} className="cursor-pointer" onClick={() => setChartHoverDay(idx)}>
                        <circle
                          cx={item.x}
                          cy={item.ySales}
                          r={chartHoverDay === idx ? 6 : 4}
                          className={`transition-all ${
                            chartHoverDay === idx ? 'fill-rose-600 stroke-white stroke-2' : 'fill-rose-500 hover:fill-rose-700'
                          }`}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Active Point Tooltip Box (floating on selected day) */}
                  {chartHoverDay !== null && chartDays[chartHoverDay] && (
                    <div
                      className="absolute z-20 pointer-events-none transition-all duration-200 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-rose-200 shadow-xl text-right text-xs"
                      style={{
                        left: `${Math.max(8, Math.min(65, (chartDays[chartHoverDay].x / 640) * 100))}%`,
                        top: '15%',
                      }}
                    >
                      <div className="font-bold text-stone-900 border-b border-stone-100 pb-1 mb-1.5 flex items-center justify-between gap-3">
                        <span className="text-rose-600 font-black">إحصائيات {chartDays[chartHoverDay].day}</span>
                        <span className="text-[10px] text-stone-400">مباشر</span>
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="text-stone-700">
                          المبيعات اليومية:{' '}
                          <span className="font-black text-stone-900">{chartDays[chartHoverDay].sales.toLocaleString()} ج.م</span>
                        </div>
                        <div className="text-stone-700">
                          معدل التحويل: <span className="font-black text-emerald-600">{chartDays[chartHoverDay].conversion}</span>
                        </div>
                        <div className="text-stone-700">
                          الطلبات المستلمة:{' '}
                          <span className="font-black text-rose-600">{chartDays[chartHoverDay].orders} طلب</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* X-Axis Day Labels */}
                  <div className="flex items-center justify-between px-6 pt-2 text-[11px] font-bold text-stone-500">
                    {chartDays.map((item, idx) => (
                      <button
                        key={item.day}
                        onClick={() => setChartHoverDay(idx)}
                        className={`transition hover:text-rose-600 ${
                          chartHoverDay === idx ? 'text-rose-600 font-black' : ''
                        }`}
                      >
                        {item.day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Action Shortcuts Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setShowAddProductModal(true);
                  }}
                  className="bg-white hover:bg-pink-50/50 p-4 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition text-right group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-stone-900">إضافة منتج جديد</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">رفع صور وتحديد المقاسات</div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('coupons');
                    setShowAddCouponModal(true);
                  }}
                  className="bg-white hover:bg-pink-50/50 p-4 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition text-right group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-stone-900">إنشاء كود خصم</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">خصومات ونسب مئوية</div>
                </button>

                <button
                  onClick={() => setActiveTab('ads_settings')}
                  className="bg-white hover:bg-pink-50/50 p-4 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition text-right group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-stone-900">نظام الإعلانات واللوجو</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">بانرات وعلامة مائية</div>
                </button>

                <Link
                  href="/admin/accounting"
                  className="bg-white hover:bg-pink-50/50 p-4 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition text-right group block"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-stone-900">سجل المصروفات والأرباح</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">تقارير وأرباح المتجر 📊</div>
                </Link>
              </div>

              {/* Recent Orders Showcase Table */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-rose-500" />
                    <span>أحدث الطلبات</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    عرض كافة الطلبات ({orders.length}) ←
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="font-medium">لا توجد طلبات واردة حتى الآن.</p>
                    <button
                      onClick={() => setShowManualOrderModal(true)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      + تسجيل أول طلب يدوي
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-medium">
                          <th className="pb-3 pr-2">العميلة</th>
                          <th className="pb-3">المنتج</th>
                          <th className="pb-3">الإجمالي</th>
                          <th className="pb-3">الحالة</th>
                          <th className="pb-3 text-center">إجراءات سريعة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.slice(0, 6).map((order) => {
                          const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
                          return (
                            <tr key={order.id} className="hover:bg-rose-50/30 transition">
                              {/* Customer Avatar & Info */}
                              <td className="py-3.5 pr-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                                    {(order.customerName || 'ع')[0]}
                                  </div>
                                  <div>
                                    <div className="font-bold text-stone-900">{order.customerName}</div>
                                    <div className="text-[10px] text-stone-400 font-mono">{order.customerPhone}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Product Thumbnail & Name */}
                              <td className="py-3.5">
                                <div className="flex items-center gap-2">
                                  {firstItem?.image ? (
                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0">
                                      <Image
                                        src={firstItem.image}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">
                                      👗
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-stone-800 line-clamp-1">
                                      {firstItem?.name || `طلب #${order.orderNumber}`}
                                    </span>
                                    {firstItem?.size && (
                                      <span className="text-[10px] text-stone-400">
                                        مقاس: {firstItem.size}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Total */}
                              <td className="py-3.5 font-bold text-stone-900 whitespace-nowrap">
                                {order.total} ج.م
                              </td>

                              {/* Status Chip */}
                              <td className="py-3.5 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                    order.status === 'DELIVERED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : order.status === 'SHIPPED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'PREPARING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {order.status === 'PENDING'
                                    ? 'قيد التجهيز'
                                    : order.status === 'PREPARING'
                                    ? 'جاري التحضير'
                                    : order.status === 'SHIPPED'
                                    ? 'تم الشحن'
                                    : order.status === 'DELIVERED'
                                    ? 'تم التوصيل'
                                    : 'ملغي'}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Print Thermal Waybill A6 Button */}
                                  <button
                                    onClick={() => setPrintingOrder(order)}
                                    className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                    title="طباعة بوليصة شحن حرارية A6"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-stone-500" />
                                    <span className="hidden sm:inline">طباعة بوليصة A6</span>
                                  </button>

                                  {/* Direct WhatsApp Message Button */}
                                  <a
                                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                      `مرحباً بكِ أ/ ${order.customerName} من متجر Fashion Zone ✨ بخصوص طلبك رقم ${order.orderNumber}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                                    title="تواصل واتساب مباشر مع العميلة"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">تواصل واتساب</span>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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

            {/* Quick Watermark Protection Status Bar */}
            <div className="bg-gradient-to-r from-pink-50 via-rose-50/70 to-pink-50 border border-pink-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-xs text-base">
                  ✨
                </span>
                <div>
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <span>نظام العلامة المائية واللوجو التلقائي لصور المنتجات:</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${autoWatermark ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                      {autoWatermark ? 'مفعّل تلقائياً ✓' : 'معطّل'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    يضع لوجو المتجر الفاخر (Fashion Zone | BOUTIQUE ✨) تلقائياً عند رفع الصور لحمايتها من السرقة. يظهر في نافذتي <strong>«إضافة منتج جديد»</strong> و <strong>«تعديل المنتج»</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/80 p-1.5 px-3 rounded-xl border border-pink-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={autoWatermark}
                    onChange={(e) => handleUpdateWatermarkSettings(e.target.checked, watermarkPosition)}
                    className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-500 accent-rose-600"
                  />
                  <span>وضع اللوجو على الصور</span>
                </label>

                {autoWatermark && (
                  <div className="flex items-center gap-1.5 text-[11px] border-r border-pink-200 pr-3 mr-1">
                    <span className="text-stone-500 font-medium">الموضع:</span>
                    <select
                      value={watermarkPosition}
                      onChange={(e) => handleUpdateWatermarkSettings(autoWatermark, e.target.value as any)}
                      className="bg-pink-50/60 px-2 py-1 rounded-lg border border-pink-200 text-stone-800 font-bold focus:outline-none"
                    >
                      <option value="bottom-right">أسفل اليمين</option>
                      <option value="bottom-left">أسفل اليسار</option>
                      <option value="center">في المنتصف</option>
                    </select>
                  </div>
                )}
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

                  {/* SEO URL SLUG CONTROL */}
                  <div className="bg-gradient-to-r from-pink-50/50 via-white to-pink-50/50 p-3.5 rounded-2xl border border-pink-200 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-rose-500" />
                        <span>رابط المنتج المخصص للسيو وجوجل (SEO URL Slug):</span>
                      </label>
                      <span className="text-[10px] text-stone-400">يدعم الإنجليزية، العربية، الأرقام، والشرطات (-)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400 select-none bg-stone-100 px-2.5 py-2 rounded-xl border border-stone-200" dir="ltr">
                        fashionzone.eg/product/
                      </span>
                      <input
                        type="text"
                        placeholder="اتركيه فارغاً للتوليد التلقائي، أو اكتبي رابطاً مخصصاً (مثال: black-pyjama-3606)..."
                        value={prodSlug}
                        onChange={(e) => setProdSlug(e.target.value)}
                        className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-stone-800"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500">
                      💡 هذا الرابط سيظهر للعميلات على محركات البحث (SEO) والفيسبوك والواتساب لسهولة تذكره وأرشفته.
                    </p>
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

                  {/* Cloudinary Automated Image Upload & Management */}
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-rose-500" />
                          <span>صور المنتج (رفع تلقائي سحابي مجاني):</span>
                          <span className="text-rose-600 font-mono">({uploadedImages.length} صور)</span>
                        </label>
                        <p className="text-[11px] text-stone-500">
                          الصورة الأولى (المميزة بـ ⭐) هي صورة الغلاف الرئيسية في المتجر
                        </p>
                      </div>
                      {uploadedImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUploadedImages([])}
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          حذف كل الصور
                        </button>
                      )}
                    </div>

                    {/* Watermark & Brand Logo Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-pink-200 text-xs shadow-2xs">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={autoWatermark}
                          onChange={(e) => handleUpdateWatermarkSettings(e.target.checked, watermarkPosition)}
                          className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-500 accent-rose-600"
                        />
                        <span>✨ وضع لوجو وعلامة مائية Fashion Zone تلقائياً على الصور</span>
                      </label>
                      {autoWatermark && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-stone-500 font-medium">موضع اللوجو:</span>
                          <select
                            value={watermarkPosition}
                            onChange={(e) => handleUpdateWatermarkSettings(autoWatermark, e.target.value as any)}
                            className="bg-pink-50/50 px-2.5 py-1 rounded-lg border border-pink-200 text-stone-800 font-bold focus:outline-none"
                          >
                            <option value="bottom-right">أسفل اليمين</option>
                            <option value="bottom-left">أسفل اليسار</option>
                            <option value="center">في المنتصف</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center min-h-[110px] p-2.5 bg-white rounded-xl border border-pink-100">
                      {uploadedImages.map((imgUrl, i) => (
                        <div
                          key={i}
                          className={`w-24 h-28 relative rounded-xl overflow-hidden border-2 group transition ${
                            i === 0
                              ? 'border-rose-500 shadow-sm ring-2 ring-rose-200'
                              : 'border-stone-200 hover:border-pink-300'
                          }`}
                        >
                          <Image src={imgUrl} alt="Uploaded" fill className="object-cover" />

                          {/* Badge for main image */}
                          {i === 0 ? (
                            <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                              ⭐ الرئيسية
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainNewProductImage(i)}
                              className="absolute bottom-1 right-1 left-1 bg-stone-900/85 hover:bg-rose-600 text-white text-[9px] font-bold py-1 rounded opacity-0 group-hover:opacity-100 transition text-center shadow-xs"
                              title="تعيين كصورة رئيسية للمنتج"
                            >
                              جعلها رئيسية ⭐
                            </button>
                          )}

                          {/* Apply Watermark Button */}
                          <button
                            type="button"
                            onClick={() => handleApplyWatermarkToExistingImage(imgUrl, i, false)}
                            className="absolute bottom-1 left-1 bg-stone-900/85 hover:bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition z-10 shadow-xs"
                            title="تطبيق لوجو وعلامة Fashion Zone على هذه الصورة"
                          >
                            ✨ لوجو
                          </button>

                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((u) => u !== imgUrl))}
                            className="absolute top-1 left-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm transition"
                            title="حذف هذه الصورة"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <label className="w-24 h-28 rounded-xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/50 hover:bg-pink-100/70 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                        <Upload className="w-6 h-6 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-rose-600 leading-tight">
                          {uploadingImage ? 'جاري الرفع... ⏳' : '+ رفع صور'}
                        </span>
                        <span className="text-[9px] text-stone-400 mt-0.5">من جهازك</span>
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

                    {/* Direct URL input option */}
                    <div className="flex gap-2 pt-1 border-t border-pink-100">
                      <input
                        type="url"
                        placeholder="أو الصقي رابط صورة مباشرة من الإنترنت (https://...)"
                        value={newProdImageUrlInput}
                        onChange={(e) => setNewProdImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewProductImageUrl();
                          }
                        }}
                        className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-left font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewProductImageUrl}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition whitespace-nowrap"
                      >
                        + إضافة الرابط
                      </button>
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

                  {/* ========================================================
                      PRODUCT COLORS MANAGER (إدارة وتحديد ألوان الموديل)
                  ======================================================== */}
                  <div className="space-y-3 p-4 rounded-2xl bg-pink-50/40 border border-pink-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-rose-500" />
                        <span>🎨 ألوان الموديل المتاحة:</span>
                        <span className="text-rose-600 font-mono">
                          {selectedColors.length > 0 ? `(${selectedColors.length} لون)` : '(بدون خيارات ألوان / لون موحد)'}
                        </span>
                      </label>
                      {selectedColors.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearColors(false)}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          مسح جميع الألوان (جعله بدون ألوان)
                        </button>
                      )}
                    </div>

                    {/* Currently Selected Colors Tags with (x) delete */}
                    <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-white rounded-xl border border-pink-200">
                      {selectedColors.length === 0 ? (
                        <span className="text-xs text-stone-400 italic">
                          لم يتم تحديد أي لون (سيظهر المنتج بدون خيار ألوان للعميلة). يمكنك اختيار ألوان من الأسفل أو إضافة لون جديد.
                        </span>
                      ) : (
                        selectedColors.map((col) => (
                          <span
                            key={col.name}
                            className="bg-white text-stone-800 border border-pink-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(col.name, false)}
                              className="text-stone-400 hover:text-red-500 rounded-full"
                              title="حذف هذا اللون"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Custom Color Input & Color Picker */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl border border-pink-200">
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          title="اختيار درجة اللون"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="اكتبي اسم أي لون جديد (مثال: بترولي / تايجر / كافيه / أوف وايت)..."
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomColor(false);
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomColor(false)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة اللون</span>
                      </button>
                    </div>

                    {/* Quick Preset Colors Palette */}
                    <div className="space-y-1.5 pt-2 border-t border-pink-100/70">
                      <span className="text-[11px] font-bold text-stone-600 block">اختيار سريع من ألوان الموضة والأزياء:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {PRESET_COLORS.map((col) => {
                          const isSel = selectedColors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
                          return (
                            <button
                              type="button"
                              key={col.name}
                              onClick={() => handleToggleColor(col, false)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                isSel
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                                  : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-stone-300"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              {isSel && <span>✓</span>}
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

            {/* Products Search & Filters Toolbar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="ابحثي باسم المنتج، كود الموديل (#2061)، أو الرابط..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-pink-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  {productSearchQuery && (
                    <button
                      onClick={() => setProductSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Dropdown Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 whitespace-nowrap">القسم:</span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-pink-50/60 border border-pink-200 text-stone-800 text-xs font-bold px-3 py-2.5 rounded-2xl focus:outline-none focus:border-rose-400 cursor-pointer"
                  >
                    <option value="ALL">جميع الأقسام ({products.length})</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-pink-50 text-xs">
                <button
                  type="button"
                  onClick={() => setProductStockFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    productStockFilter === 'ALL'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-pink-50 hover:text-rose-600'
                  }`}
                >
                  الكل ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductStockFilter('IN_STOCK')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    productStockFilter === 'IN_STOCK'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  متوفر بالمخزون ({inStockCount}) ✓
                </button>
                <button
                  type="button"
                  onClick={() => setProductStockFilter('OUT_OF_STOCK')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    productStockFilter === 'OUT_OF_STOCK'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  نفدت الكمية ({products.length - inStockCount}) ✕
                </button>
                <button
                  type="button"
                  onClick={() => setProductStockFilter('NEW_ARRIVALS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    productStockFilter === 'NEW_ARRIVALS'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  }`}
                >
                  وصل حديثاً ({products.filter((p) => p.isNewArrival).length}) 🎀
                </button>

                {(productSearchQuery || productCategoryFilter !== 'ALL' || productStockFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearchQuery('');
                      setProductCategoryFilter('ALL');
                      setProductStockFilter('ALL');
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline mr-auto flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة ضبط الفلاتر</span>
                  </button>
                )}
              </div>
            </div>

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
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center">
                          <p className="text-stone-500 font-bold text-sm mb-1">لا توجد منتجات مطابقة لبحثكِ الحالي 🔍</p>
                          <p className="text-stone-400 text-xs mb-3">جرّبي كتابة اسم أو كود آخر أو إعادة ضبط الفلاتر.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setProductSearchQuery('');
                              setProductCategoryFilter('ALL');
                              setProductStockFilter('ALL');
                            }}
                            className="bg-pink-50 hover:bg-pink-100 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition"
                          >
                            عرض جميع المنتجات ({products.length})
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
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
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopyProductLink(product.slug, product.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  copiedProductId === product.id
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-stone-500 hover:text-rose-600 hover:bg-pink-50'
                                }`}
                                title="نسخ رابط الموديل المباشر للمشاركة على واتساب وفيسبوك"
                              >
                                {copiedProductId === product.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
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
                      ))
                    )}
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

                    {/* SEO URL SLUG CONTROL */}
                    <div className="bg-gradient-to-r from-pink-50/50 via-white to-pink-50/50 p-3 rounded-2xl border border-pink-200 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>رابط المنتج المخصص للسيو وجوجل (SEO URL Slug):</span>
                        </label>
                        {editingProduct && (
                          <Link
                            href={`/product/${editingProduct.slug}`}
                            target="_blank"
                            className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>معاينة الرابط في المتجر</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-stone-400 select-none bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200" dir="ltr">
                          fashionzone.eg/product/
                        </span>
                        <input
                          type="text"
                          placeholder="الرابط المخصص للسيو (Slug)..."
                          value={editProdSlug}
                          onChange={(e) => setEditProdSlug(e.target.value)}
                          className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-stone-800"
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

                    {/* EDIT PRODUCT IMAGES MANAGER */}
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-rose-500" />
                            <span>صور المنتج الحالية والجديدة:</span>
                            <span className="text-rose-600 font-mono">({editProdImages.length} صور)</span>
                          </label>
                          <p className="text-[11px] text-stone-500">
                            الصورة الأولى (المميزة بـ ⭐) هي صورة الغلاف الرئيسية في المتجر. يمكنكِ تعيين أي صورة كرئيسية أو حذفها أو إضافة صور جديدة.
                          </p>
                        </div>
                        {editProdImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditProdImages([])}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            حذف كل الصور
                          </button>
                        )}
                      </div>

                      {/* Watermark & Brand Logo Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-pink-200 text-xs shadow-2xs">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                          <input
                            type="checkbox"
                            checked={autoWatermark}
                            onChange={(e) => handleUpdateWatermarkSettings(e.target.checked, watermarkPosition)}
                            className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-500 accent-rose-600"
                          />
                          <span>✨ وضع لوجو وعلامة مائية Fashion Zone تلقائياً على الصور</span>
                        </label>
                        {autoWatermark && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-stone-500 font-medium">موضع اللوجو:</span>
                            <select
                              value={watermarkPosition}
                              onChange={(e) => handleUpdateWatermarkSettings(autoWatermark, e.target.value as any)}
                              className="bg-pink-50/50 px-2.5 py-1 rounded-lg border border-pink-200 text-stone-800 font-bold focus:outline-none"
                            >
                              <option value="bottom-right">أسفل اليمين</option>
                              <option value="bottom-left">أسفل اليسار</option>
                              <option value="center">في المنتصف</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Images Grid */}
                      <div className="flex flex-wrap gap-3 items-center min-h-[110px] p-2.5 bg-white rounded-xl border border-pink-100">
                        {editProdImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={`w-24 h-28 relative rounded-xl overflow-hidden border-2 group transition ${
                              idx === 0
                                ? 'border-rose-500 shadow-sm ring-2 ring-rose-200'
                                : 'border-stone-200 hover:border-pink-300'
                            }`}
                          >
                            <Image src={img} alt="" fill className="object-cover" />

                            {/* Badge for main image */}
                            {idx === 0 ? (
                              <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                ⭐ الرئيسية
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetMainEditProductImage(idx)}
                                className="absolute bottom-1 right-1 left-1 bg-stone-900/85 hover:bg-rose-600 text-white text-[9px] font-bold py-1 rounded opacity-0 group-hover:opacity-100 transition text-center shadow-xs"
                                title="تعيين كصورة رئيسية للمنتج"
                              >
                                جعلها رئيسية ⭐
                              </button>
                            )}

                            {/* Apply Watermark Button */}
                            <button
                              type="button"
                              onClick={() => handleApplyWatermarkToExistingImage(img, idx, true)}
                              className="absolute bottom-1 left-1 bg-stone-900/85 hover:bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition z-10 shadow-xs flex items-center gap-0.5"
                              title="تطبيق لوجو وعلامة Fashion Zone على هذه الصورة"
                            >
                              <span>✨ لوجو</span>
                            </button>

                            {/* Delete image button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditProductImage(idx)}
                              className="absolute top-1 left-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm transition"
                              title="حذف هذه الصورة"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Upload from Device Button */}
                        <label className="w-24 h-28 rounded-xl border-2 border-dashed border-pink-300 hover:border-rose-500 bg-pink-50/50 hover:bg-pink-100/70 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                          <Upload className="w-6 h-6 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-rose-600 leading-tight">
                            {uploadingImage ? 'جاري الرفع... ⏳' : '+ رفع صور جديدة'}
                          </span>
                          <span className="text-[9px] text-stone-400 mt-0.5">من جهازك</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleEditProductImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Direct URL input option */}
                      <div className="flex gap-2 pt-1 border-t border-pink-100">
                        <input
                          type="url"
                          placeholder="أو الصقي رابط صورة مباشرة من الإنترنت (https://...)"
                          value={editProdImageUrlInput}
                          onChange={(e) => setEditProdImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditProductImageUrl();
                            }
                          }}
                          className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-left font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddEditProductImageUrl}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition whitespace-nowrap"
                        >
                          + إضافة الرابط
                        </button>
                      </div>
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

                    {/* ========================================================
                        EDIT PRODUCT COLORS MANAGER (إدارة ألوان المنتج)
                    ======================================================== */}
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-rose-500" />
                            <span>🎨 ألوان المنتج المتاحة:</span>
                            <span className="text-rose-600 font-mono">
                              {editProdColors.length > 0 ? `(${editProdColors.length} لون)` : '(بدون خيارات ألوان / لون موحد)'}
                            </span>
                          </label>
                          <p className="text-[11px] text-stone-500">
                            أضيفي ألوان، أو اضغطي (X) لحذف أي لون، أو اضغطي مسح لإلغاء خيار الألوان تماماً
                          </p>
                        </div>
                        {editProdColors.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleClearColors(true)}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            مسح جميع الألوان (جعله بدون ألوان)
                          </button>
                        )}
                      </div>

                      {/* Selected Color Badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-pink-100">
                        {editProdColors.length === 0 ? (
                          <span className="text-stone-400 text-xs italic">
                            الموديل معروض بدون ألوان (لون موحد). يمكنك اختيار ألوان من الأسفل أو إضافة لون مخصص.
                          </span>
                        ) : (
                          editProdColors.map((col) => (
                            <span
                              key={col.name}
                              className="inline-flex items-center gap-2 bg-white text-stone-800 font-bold text-xs px-3 py-1 rounded-xl border border-pink-200 shadow-2xs animate-fadeIn"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(col.name, true)}
                                className="text-stone-400 hover:text-red-500 rounded-full"
                                title="إزالة هذا اللون"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl border border-pink-200">
                          <input
                            type="color"
                            value={editCustomColorHex}
                            onChange={(e) => setEditCustomColorHex(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            title="اختيار درجة اللون"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="اكتبي أي لون جديد (مثال: بترولي / كافيه / تايجر)..."
                          value={editCustomColorName}
                          onChange={(e) => setEditCustomColorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomColor(true);
                            }
                          }}
                          className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomColor(true)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="space-y-1.5 pt-2 border-t border-pink-100">
                        <span className="text-[11px] font-bold text-stone-600 block">اختيار سريع:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {PRESET_COLORS.map((col) => {
                            const isSel = editProdColors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
                            return (
                              <button
                                type="button"
                                key={col.name}
                                onClick={() => handleToggleColor(col, true)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                  isSel
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                                    : 'bg-white text-stone-700 border-pink-200 hover:border-rose-400'
                                }`}
                              >
                                <span
                                  className="w-3 h-3 rounded-full border border-stone-300"
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span>{col.name}</span>
                                {isSel && <span>✓</span>}
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
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                            {order.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const trackUrl = `${window.location.origin}/track?order=${order.orderNumber}`;
                              navigator.clipboard.writeText(trackUrl);
                              setSuccessMessage(`تم نسخ رابط تتبع الأوردر (${order.orderNumber}) بنجاح! 📋`);
                              setTimeout(() => setSuccessMessage(''), 4000);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-pink-50 transition"
                            title="نسخ رابط تتبع الأوردر للعميلة (Direct Link)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/track?order=${order.orderNumber}`}
                            target="_blank"
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-pink-50 transition"
                            title="معاينة صفحة تتبع الطلب"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
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
                              type="button"
                              onClick={() => setPrintingOrder(order)}
                              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-xl transition text-xs border border-blue-200 cursor-pointer"
                              title="طباعة بوليصة الشحن الحرارية للمندوب"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة البوليصة 🖨️</span>
                            </button>

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
                                `مرحباً يا فندم من متجر Fashion Zone بخصوص طلبكِ رقم ${order.orderNumber}.\nيمكنكِ متابعة وتتبع حالة طلبكِ مباشرة عبر الرابط:\n${typeof window !== 'undefined' ? window.location.origin : ''}/track?order=${order.orderNumber}`
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
            {/* Printable Thermal Waybill Modal */}
            {printingOrder && (
              <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-8 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Printer className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-base text-stone-900">معاينة وطباعة بوليصة الشحن للمندوب</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrintingOrder(null)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* The Waybill Paper (Styled for Thermal / A6 / A4 Label Printing) */}
                  <div id="printable-waybill" className="p-5 bg-white border-2 border-dashed border-stone-300 rounded-2xl text-stone-900 space-y-4 font-sans text-xs">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-stone-900">
                      <div>
                        <h2 className="text-lg font-black tracking-wider uppercase font-serif text-stone-900">
                          Fashion Zone | BOUTIQUE ✨
                        </h2>
                        <p className="text-[10px] text-stone-600 font-bold">متجر الأزياء النسائية والهوم وير الراقي</p>
                        <p className="text-[10px] font-mono text-stone-500">واتساب: +20 108 044 1559</p>
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] text-stone-500">رقم بوليصة الطلب:</span>
                        <span className="font-mono font-black text-base text-stone-900 block bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                          #{printingOrder.orderNumber}
                        </span>
                        <span className="text-[9px] text-stone-400 font-mono block mt-0.5">
                          {new Date(printingOrder.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    {/* Barcode Simulator */}
                    <div className="text-center py-1 bg-stone-50 rounded border border-stone-200">
                      <div className="font-mono tracking-[0.35em] text-lg font-black select-none text-stone-800">
                        ||| | |||| | ||||| ||| ||||
                      </div>
                      <span className="text-[9px] font-mono font-bold text-stone-500 block">
                        *FZ-{printingOrder.orderNumber}*
                      </span>
                    </div>

                    {/* Customer Info Box */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-500 text-[10px]">العميلة المستلمة:</span>
                        <span className="font-black text-stone-900 text-sm">{printingOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-500 text-[10px]">رقم هاتف العميلة:</span>
                        <span className="font-mono font-black text-stone-900 text-sm dir-ltr">{printingOrder.customerPhone}</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200">
                        <span className="text-stone-500 text-[10px] block mb-0.5">عنوان التوصيل:</span>
                        <p className="font-bold text-stone-900 leading-relaxed text-xs">{printingOrder.customerAddress}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 block mb-1">محتويات الطرد:</span>
                      <table className="w-full text-right text-[11px] border border-stone-200 rounded-lg overflow-hidden">
                        <thead className="bg-stone-100 text-stone-700 font-bold">
                          <tr>
                            <th className="py-1 px-2 border-b">الموديل</th>
                            <th className="py-1 px-2 border-b text-center">المقاس / اللون</th>
                            <th className="py-1 px-2 border-b text-center">الكمية</th>
                            <th className="py-1 px-2 border-b text-left">السعر</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {Array.isArray(printingOrder.items) && printingOrder.items.map((it: any, i: number) => (
                            <tr key={i}>
                              <td className="py-1.5 px-2 font-bold text-stone-800">
                                {it.name || it.productName}
                                {it.code && <span className="text-[9px] font-mono text-stone-500 mr-1">(#{it.code})</span>}
                              </td>
                              <td className="py-1.5 px-2 text-center text-stone-600 font-bold">
                                {it.size || '-'} {it.color ? `/ ${it.color}` : ''}
                              </td>
                              <td className="py-1.5 px-2 text-center font-mono font-bold">{it.quantity || 1}</td>
                              <td className="py-1.5 px-2 text-left font-mono font-bold">{(it.price || 0) * (it.quantity || 1)} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* COD Collection Box (Cash on Delivery) */}
                    <div className="p-3.5 rounded-xl bg-stone-900 text-white flex items-center justify-between border-2 border-black">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-300 block">
                          المبلغ المطلوب تحصيله بواسطة المندوب:
                        </span>
                        <span className="text-xl font-black font-sans text-emerald-400">
                          {printingOrder.total} جنيه مصري
                        </span>
                      </div>
                      <div className="text-left text-[10px] text-stone-300">
                        <span className="block font-bold">دفع كاش عند الاستلام</span>
                        <span>شامل مصاريف الشحن ✓</span>
                      </div>
                    </div>

                    {/* Courier Instructions */}
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] leading-relaxed">
                      ⚠️ <strong>تعليمات المندوب:</strong> يُسمح للعميلة بالمعاينة والتأكد من خامة ومقاس الموديل قبل الدفع. في حال الرغبة في الاستبدال يرجى التواصل مع إدارة المتجر فوراً.
                    </div>

                  </div>

                  {/* Print Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPrintingOrder(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                    >
                      إغلاق المعاينة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة البوليصة فوراً (Print) 🖨️</span>
                    </button>
                  </div>
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
        {/* TAB: REELS & LIVE MODEL VIDEOS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'reels' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-1">
                  <Video className="w-4 h-4" />
                  <span>فيديوهات من أرض الواقع للعميلات</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  قسم «شاهدي الموديلات على الطبيعة 🎥✨»
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  تحكمي بالكامل في فيديوهات وريلز الموديلات المعروضة في الصفحة الرئيسية، وعدلي الأسعار والأكواد واربطي كل فيديو بمنتج متجرك لتمكين العميلات من طلبه فوراً.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingReel(null);
                    setReelTitle('');
                    setReelCode('');
                    setReelPrice('');
                    setReelSlug('');
                    setReelThumbnail('');
                    setReelVideoUrl('');
                    setReelViews('15.4K');
                    setReelDuration('0:30');
                    setShowAddReelModal(true);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة فيديو موديل</span>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  className="p-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition flex items-center gap-1.5"
                  title="معاينة القسم في المتجر"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">معاينة بالمتجر</span>
                </Link>
              </div>
            </div>

            {/* Quick KPI stats for Reels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 block mb-1">إجمالي الفيديوهات</span>
                <span className="text-xl font-black text-stone-900 font-sans">{reels.length} فيديو</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 block mb-1">فيديوهات نشطة بالمتجر</span>
                <span className="text-xl font-black text-emerald-700 font-sans">
                  {reels.filter((r) => r.isActive).length} نشط
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
                <span className="text-[11px] font-bold text-rose-500 block mb-1">فيديوهات مربوطة بمنتجات</span>
                <span className="text-xl font-black text-rose-600 font-sans">
                  {reels.filter((r) => r.slug).length} مربوط
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 block mb-1">وضعية العرض بالصفحة</span>
                <span className="text-xs font-black text-stone-800">ريلز رأسية 9:16 بوب أب</span>
              </div>
            </div>

            {/* Reels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    reel.isActive ? 'border-pink-200' : 'border-stone-200 opacity-75'
                  }`}
                >
                  {/* Thumbnail & Video Preview Trigger */}
                  <div className="relative aspect-[9/16] bg-stone-900 overflow-hidden group">
                    <Image
                      src={reel.thumbnail}
                      alt={reel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setPreviewReel(reel)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      title="معاينة تشغيل الفيديو"
                    >
                      <span className="w-12 h-12 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </button>

                    {/* Badges on Thumbnail */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold">
                      {reel.views} مشاهدة
                    </div>

                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          reel.isActive ? 'bg-emerald-500 text-white' : 'bg-stone-700 text-stone-200'
                        }`}
                      >
                        {reel.isActive ? 'نشط بالمتجر ✓' : 'مخفي ✕'}
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-3 right-3 left-3 text-white space-y-1">
                      {reel.code && (
                        <span className="text-[10px] font-mono text-pink-300 font-bold block">{reel.code}</span>
                      )}
                      <h4 className="text-xs font-bold leading-tight line-clamp-2">{reel.title}</h4>
                      {reel.price && (
                        <span className="text-sm font-black text-pink-300 font-sans block">{reel.price} ج.م</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Product Link Bar */}
                  <div className="p-3.5 bg-stone-50/80 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>الرابط:</span>
                      {reel.slug ? (
                        <Link
                          href={`/product/${reel.slug}`}
                          target="_blank"
                          className="font-bold text-rose-600 hover:underline truncate max-w-[140px]"
                        >
                          /{reel.slug} ↗
                        </Link>
                      ) : (
                        <span className="text-stone-400">غير مربوط</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-200/60">
                      <button
                        onClick={() => {
                          setEditingReel(reel);
                          setReelTitle(reel.title);
                          setReelCode(reel.code || '');
                          setReelPrice(reel.price ? String(reel.price) : '');
                          setReelSlug(reel.slug || '');
                          setReelThumbnail(reel.thumbnail);
                          setReelVideoUrl(reel.videoUrl);
                          setReelViews(reel.views || '15.4K');
                          setReelDuration(reel.duration || '0:30');
                        }}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="تعديل الفيديو"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleToggleReelActive(reel)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          reel.isActive ? 'text-amber-700 hover:bg-amber-100' : 'text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={reel.isActive ? 'إخفاء من المتجر' : 'تفعيل بالمتجر'}
                      >
                        {reel.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{reel.isActive ? 'إخفاء' : 'إظهار'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReel(reel.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition"
                        title="حذف الفيديو"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

                {/* HERO PRODUCT SELECTOR */}
                <div className="p-4 bg-white/90 rounded-2xl border border-pink-200 shadow-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 text-rose-600 flex items-center justify-center font-bold">
                        ⭐
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          اختيار منتج من المتجر ليكون نجم الهيدر الرئيسي تلقائياً 🌟
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          بدلاً من رفع صورة وكتابة الروابط يدوياً، اختاري أي منتج ليتم وضع صورته ورابط طلبه والخصم تلقائياً وباحترافية!
                        </p>
                      </div>
                    </div>
                    {settings.heroProductId && (
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, heroProductId: '' })}
                        className="text-[10px] text-stone-500 hover:text-red-500 underline font-bold"
                      >
                        إلغاء ربط المنتج
                      </button>
                    )}
                  </div>

                  <select
                    value={settings.heroProductId || ''}
                    onChange={(e) => handleSelectHeroProduct(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="">-- اضغطي هنا لاختيار منتج من المتجر ({products.length} منتج متوفر) --</option>
                    {products.map((p) => {
                      const hasDiscount = p.originalPrice && p.originalPrice > p.price;
                      const discPercent = hasDiscount ? Math.round((1 - p.price / p.originalPrice!) * 100) : 0;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.code ? `[كود: ${p.code}] ` : ''}{p.name} — ({p.price} ج.م) {hasDiscount ? `[خصم ${discPercent}%]` : ''}
                        </option>
                      );
                    })}
                  </select>

                  {settings.heroProductId && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                      <span className="font-bold">
                        ✓ تم ربط الهيدر بالمنتج المختار! تم تحديث صورة الغلاف، رابط الزر، والخصم تلقائياً.
                      </span>
                      <a
                        href={settings.heroCtaLink || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>معاينة صفحة المنتج</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
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
                        {settings.heroBadgeEnabled !== false &&
                          Boolean(settings.heroBadgeText?.trim() || settings.heroBadgeSubtext?.trim()) && (
                          <div className="absolute top-3 right-3 bg-white/95 py-1.5 px-3 rounded-xl shadow-xs border border-pink-100 text-[10px] animate-fadeIn">
                            <span className="font-bold text-stone-800 block">{settings.heroBadgeText}</span>
                            {settings.heroBadgeSubtext && (
                              <span className="text-stone-400 block">{settings.heroBadgeSubtext}</span>
                            )}
                          </div>
                        )}

                        {/* Live Floating Badge 2 preview */}
                        {settings.heroCouponEnabled !== false &&
                          Boolean(
                            settings.heroCouponDiscount?.trim() ||
                            settings.heroCouponCode?.trim() ||
                            settings.heroCouponTitle?.trim()
                          ) && (
                          <div className="absolute bottom-3 left-3 bg-white/95 py-1.5 px-3 rounded-xl shadow-xs border border-pink-100 text-[10px] animate-fadeIn">
                            {settings.heroCouponTitle && (
                              <span className="text-stone-700 block font-medium">{settings.heroCouponTitle}</span>
                            )}
                            <span className="font-black text-rose-600 block">
                              {settings.heroCouponCode}{' '}
                              {settings.heroCouponDiscount ? `(${settings.heroCouponDiscount})` : ''}
                            </span>
                          </div>
                        )}

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
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                          <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>البادج العائم العلوي (التقييم / التريند):</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                          <input
                            type="checkbox"
                            checked={settings.heroBadgeEnabled !== false}
                            onChange={(e) => setSettings({ ...settings, heroBadgeEnabled: e.target.checked })}
                            className="w-3.5 h-3.5 text-rose-600 rounded accent-rose-500"
                          />
                          <span>{settings.heroBadgeEnabled !== false ? 'مفعل ✓' : 'معطل ومخفي ✕'}</span>
                        </label>
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
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                          <Tag className="w-3.5 h-3.5 text-rose-500" />
                          <span>البادج العائم السفلي (كود الخصم ونسبة التخفيض):</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSettings(prev => ({
                                ...prev,
                                heroCouponEnabled: false,
                                heroCouponDiscount: '',
                                heroCouponCode: '',
                                heroCouponTitle: '',
                              }));
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-pink-100/70 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition flex items-center gap-1 cursor-pointer"
                            title="مسح وإلغاء بادج الخصم نهائياً من صورة الهيدر"
                          >
                            <span>🗑️ مسح وإخفاء الخصم فوراً</span>
                          </button>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-rose-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                            <input
                              type="checkbox"
                              checked={settings.heroCouponEnabled !== false}
                              onChange={(e) => setSettings({ ...settings, heroCouponEnabled: e.target.checked })}
                              className="w-3.5 h-3.5 text-rose-600 rounded accent-rose-500"
                            />
                            <span>{settings.heroCouponEnabled !== false ? 'مفعل (يظهر على الصورة) ✓' : 'معطل ومخفي ✕'}</span>
                          </label>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        💡 لإلغاء وإخفاء الخصم تماماً من صورة الهيدر: يمكنكِ إما إلغاء تفعيل المربع أعلاه، أو مسح قيمة الخصم من الحقل أدناه.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">عنوان البادج (اختياري)</label>
                          <input
                            type="text"
                            value={settings.heroCouponTitle || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponTitle: e.target.value })}
                            placeholder="كود الخصم الفوري"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">كود الخصم (اختياري)</label>
                          <input
                            type="text"
                            value={settings.heroCouponCode || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponCode: e.target.value.toUpperCase() })}
                            placeholder="GIRL10"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-pink-200 font-mono uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-0.5">قيمة الخصم (امسحيها لإلغاء الخصم)</label>
                          <input
                            type="text"
                            value={settings.heroCouponDiscount || ''}
                            onChange={(e) => setSettings({ ...settings, heroCouponDiscount: e.target.value })}
                            placeholder="مثال: خصم 10% أو اتركيها فارغة"
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
                        <label className="block text-[10px] text-stone-500 mb-0.5">رابط الزر وصورة الهيدر (عند النقر على صورة الهيدر أو زر الشراء يتم التحويل إليه)</label>
                        <input
                          type="text"
                          value={settings.heroCtaLink || ''}
                          onChange={(e) => setSettings({ ...settings, heroCtaLink: e.target.value })}
                          placeholder="#catalog أو /product/your-slug"
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

        {/* ======================================================== */}
        {/* MODAL: ADD / EDIT FASHION REEL */}
        {/* ======================================================== */}
        {(showAddReelModal || editingReel) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-pink-200 shadow-2xl animate-scaleUp my-8 space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900">
                      {editingReel ? 'تعديل بيانات فيديو الموديل 🎥' : 'إضافة فيديو موديل جديد للقسم 🎥✨'}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      سيظهر في قسم «شاهدي الموديلات على الطبيعة» بالصفحة الرئيسية
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddReelModal(false);
                    setEditingReel(null);
                  }}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={editingReel ? handleUpdateReel : handleCreateReel} className="space-y-4">
                
                {/* 1. Quick Product Selector Helper */}
                {!editingReel && products.length > 0 && (
                  <div className="p-3 bg-pink-50/70 rounded-2xl border border-pink-200/80 space-y-1.5">
                    <label className="block text-[11px] font-black text-rose-800">
                      ✨ تعبئة سريعة عبر اختيار منتج من متجرك (اختياري):
                    </label>
                    <select
                      value={reelSlug}
                      onChange={(e) => {
                        const selSlug = e.target.value;
                        setReelSlug(selSlug);
                        const found = products.find((p) => p.slug === selSlug);
                        if (found) {
                          if (!reelTitle) setReelTitle(found.name);
                          if (!reelCode && found.code) setReelCode(`#${found.code}`);
                          if (!reelPrice) setReelPrice(String(found.price));
                          if (!reelThumbnail && found.images && found.images.length > 0) {
                            setReelThumbnail(String(found.images[0]));
                          }
                        }
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-pink-200 text-stone-800 font-bold outline-hidden focus:ring-2 focus:ring-rose-200"
                    >
                      <option value="">-- اختاري منتجاً لملء الاسم والسعر والصورة تلقائياً --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} {p.code ? `(#${p.code})` : ''} - {p.price} ج.م
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    عنوان أو وصف الموديل *
                  </label>
                  <input
                    type="text"
                    required
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                    placeholder="مثال: بيجامة هايدي زراير مطعمة فرو 😍"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                {/* 3. Code & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      كود الموديل
                    </label>
                    <input
                      type="text"
                      value={reelCode}
                      onChange={(e) => setReelCode(e.target.value)}
                      placeholder="#2061"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono outline-hidden focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      سعر الموديل (ج.م)
                    </label>
                    <input
                      type="number"
                      value={reelPrice}
                      onChange={(e) => setReelPrice(e.target.value)}
                      placeholder="650"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-sans outline-hidden focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* 4. Video URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    رابط ملف الفيديو (Direct MP4 URL) *
                  </label>
                  <input
                    type="url"
                    required
                    value={reelVideoUrl}
                    onChange={(e) => setReelVideoUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 font-mono outline-hidden focus:border-rose-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    يمكنك وضع أي رابط فيديو مباشر بصيغة mp4 من Cloudinary أو السيرفر أو استضافة الفيديوهات.
                  </span>
                </div>

                {/* 5. Thumbnail URL & Direct Upload */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    صورة غلاف الفيديو (Thumbnail) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={reelThumbnail}
                      onChange={(e) => setReelThumbnail(e.target.value)}
                      placeholder="https://images.unsplash.com/... أو رابط الصورة"
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden focus:border-rose-400 font-mono"
                    />
                    <label className="cursor-pointer bg-pink-50 hover:bg-pink-100 text-rose-700 border border-pink-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingReelThumb ? 'جاري الرفع...' : 'رفع غلاف'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleReelThumbUpload}
                        disabled={uploadingReelThumb}
                      />
                    </label>
                  </div>

                  {reelThumbnail && (
                    <div className="mt-2 relative w-16 h-28 rounded-xl overflow-hidden border border-pink-200 shadow-xs">
                      <Image src={reelThumbnail} alt="Thumbnail preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                {/* 6. Product Link Slug & Views & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رابط المنتج (Slug)
                    </label>
                    <input
                      type="text"
                      value={reelSlug}
                      onChange={(e) => setReelSlug(e.target.value)}
                      placeholder="6268 أو اسم السلاج"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden focus:border-rose-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      عدد المشاهدات الظاهري
                    </label>
                    <input
                      type="text"
                      value={reelViews}
                      onChange={(e) => setReelViews(e.target.value)}
                      placeholder="14.2K"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      مدة الفيديو
                    </label>
                    <input
                      type="text"
                      value={reelDuration}
                      onChange={(e) => setReelDuration(e.target.value)}
                      placeholder="0:28"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden focus:border-rose-400 font-mono"
                    />
                  </div>
                </div>

                {/* Submit & Cancel */}
                <div className="pt-4 border-t border-pink-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReelModal(false);
                      setEditingReel(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-stone-500 hover:bg-stone-100 text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={savingReel}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    {savingReel ? (
                      <span>جاري الحفظ...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingReel ? 'حفظ التعديلات' : 'نشر الفيديو بالمتجر ✨'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: LIVE REEL VIDEO PREVIEW */}
        {/* ======================================================== */}
        {previewReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-xs aspect-[9/16] max-h-[85vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
              
              {/* Top Controls */}
              <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-white">
                  <span className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-xs font-black font-serif">
                    FZ
                  </span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight truncate max-w-[170px]">{previewReel.title}</h4>
                    <span className="text-[10px] text-pink-300 font-mono">{previewReel.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewReel(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player */}
              <div className="absolute inset-0 w-full h-full">
                <video
                  src={previewReel.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom Footer Info */}
              <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-300 block">سعر الموديل:</span>
                  <span className="text-base font-black text-pink-300 font-sans">{previewReel.price || 0} ج.م</span>
                </div>
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2.5 py-1 rounded-xl">
                  {previewReel.views} مشاهدة
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: BROADCAST PUSH NOTIFICATION TO CUSTOMERS */}
        {/* ======================================================== */}
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-200 shadow-2xl animate-scaleUp space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900">
                      إرسال إشعار فوري لهواتف العميلات 📢✨
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      يصل مباشرة كإشعار في شريط هواتف العميلات المشتركات
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    عنوان الإشعار *
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="مثال: وصل كوليكشن شتاء 2026 الجديد! ❄️✨"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-200 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    نص الإشعار *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="مثال: بيجامات هايدي وترينجات قطيفة مستوردة بأقوى العروض وشحن مجاني! استخدمي كود GIRL10"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-200 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    الرابط الذي يُفتح عند الضغط على الإشعار
                  </label>
                  <input
                    type="text"
                    value={broadcastUrl}
                    onChange={(e) => setBroadcastUrl(e.target.value)}
                    placeholder="/"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-200 font-mono outline-hidden focus:border-amber-400"
                  />
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    اتركيه / لفتح الصفحة الرئيسية، أو اكتبي /catalog أو رابط منتج محدد.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    الفئة المستهدفة
                  </label>
                  <select
                    value={broadcastTarget}
                    onChange={(e: any) => setBroadcastTarget(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white font-bold text-stone-800"
                  >
                    <option value="CUSTOMER">جميع هواتف العميلات المشتركات (Customer Only)</option>
                    <option value="ALL">الجميع (عميلات + إدارة المتجر)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-amber-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2.5 rounded-xl text-stone-500 hover:bg-stone-100 text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    {sendingBroadcast ? (
                      <span>جاري إرسال الإشعار...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال الإشعار لجميع المشتركين الآن 🚀</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        </main>
      </div>
    </div>
  );
}
