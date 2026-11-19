'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PieChart,
  Receipt,
  Calendar,
  Download,
  Printer,
  Plus,
  Trash2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Layers,
  Search,
  RefreshCw,
  FileText,
  Store,
  LogOut,
  ShoppingBag,
  Tag,
  ArrowRight,
  X,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any;
  total: number;
  discountAmount?: number;
  couponCode?: string | null;
  status: string; // PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  category: 'MARKETING' | 'SHIPPING' | 'PACKAGING' | 'SALARIES' | 'INVENTORY' | 'OTHER' | string;
  amount: number;
  notes?: string | null;
  date: string;
  createdAt: string;
}

interface ProductItem {
  id: string;
  code?: string;
  name: string;
  price: number;
  costPrice?: number;
}

const EXPENSE_CATEGORIES: { [key: string]: { label: string; color: string; bg: string; icon: string } } = {
  MARKETING: { label: 'إعلانات وتسويق ممول', color: 'text-purple-600', bg: 'bg-purple-50', icon: '📣' },
  SHIPPING: { label: 'شحن وتوصيل ومناديب', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🚚' },
  PACKAGING: { label: 'أكياس وتغليف وبوليصات', color: 'text-amber-600', bg: 'bg-amber-50', icon: '📦' },
  INVENTORY: { label: 'شراء بضاعة ورأس مال', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🧵' },
  SALARIES: { label: 'مرتبات وعمولات فريق العمل', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '👥' },
  OTHER: { label: 'مصاريف عامة ونثريات وبوفيه', color: 'text-stone-600', bg: 'bg-stone-100', icon: '☕' },
};

export default function AccountingPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Data states
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  // New Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('MARKETING');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpenseNotes, setNewExpenseNotes] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Success / alert feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Check auth
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fz_admin_token') : null;
    fetch('/api/admin/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setCurrentAdmin(data.user);
          setAuthLoading(false);
          fetchData();
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, expensesRes, prodsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/expenses'),
        fetch('/api/products'),
      ]);
      const ordersData = await ordersRes.json();
      const expensesData = await expensesRes.json();
      const prodsData = await prodsRes.json();

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (expensesData.success) setExpenses(expensesData.expenses || []);
      if (prodsData.success) setProducts(prodsData.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper date filter
  const isDateInSelectedPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();

    if (periodFilter === 'today') {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
    if (periodFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo && date <= now;
    }
    if (periodFilter === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'custom') {
      if (startDate && new Date(startDate) > date) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true; // 'all'
  };

  // Filtered orders & expenses
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => isDateInSelectedPeriod(o.createdAt));
  }, [orders, periodFilter, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesDate = isDateInSelectedPeriod(e.date || e.createdAt);
      const matchesCat = expenseCategoryFilter === 'ALL' || e.category === expenseCategoryFilter;
      const matchesSearch =
        !expenseSearch ||
        e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(expenseSearch.toLowerCase()));
      return matchesDate && matchesCat && matchesSearch;
    });
  }, [expenses, periodFilter, startDate, endDate, expenseCategoryFilter, expenseSearch]);

  // Financial KPIs Calculations
  const metrics = useMemo(() => {
    // Orders by status
    const deliveredOrders = filteredOrders.filter((o) => o.status === 'DELIVERED');
    const inTransitOrders = filteredOrders.filter(
      (o) => o.status === 'SHIPPED' || o.status === 'PREPARING'
    );
    const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
    const cancelledOrders = filteredOrders.filter((o) => o.status === 'CANCELLED');

    // Revenue totals
    const grossRevenue = filteredOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const collectedCash = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const inTransitCash = inTransitOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCash = pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cancelledLoss = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Expenses total
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Estimated COGS (Cost of goods sold)
    // If product costPrice is set, use it; otherwise estimate wholesale cost as 55% of price
    let estimatedCOGS = 0;
    deliveredOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const qty = item.quantity || 1;
          const prod = products.find((p) => p.name === item.name || (p.code && p.code === item.code));
          if (prod && prod.costPrice) {
            estimatedCOGS += prod.costPrice * qty;
          } else {
            estimatedCOGS += (item.price || 0) * 0.55 * qty;
          }
        });
      }
    });

    // Real Net Profit
    const netProfit = collectedCash - estimatedCOGS - totalExpenses;
    const profitMargin = collectedCash > 0 ? (netProfit / collectedCash) * 100 : 0;
    const cancellationRate =
      filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0;

    // Expenses breakdown by category
    const expensesByCategory: { [key: string]: number } = {};
    Object.keys(EXPENSE_CATEGORIES).forEach((k) => (expensesByCategory[k] = 0));
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'OTHER';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
    });

    return {
      totalOrdersCount: filteredOrders.length,
      deliveredOrdersCount: deliveredOrders.length,
      inTransitOrdersCount: inTransitOrders.length,
      pendingOrdersCount: pendingOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      grossRevenue,
      collectedCash,
      inTransitCash,
      pendingCash,
      cancelledLoss,
      totalExpenses,
      estimatedCOGS,
      netProfit,
      profitMargin,
      cancellationRate,
      expensesByCategory,
    };
  }, [filteredOrders, filteredExpenses, products]);

  // Product profitability breakdown
  const productProfitability = useMemo(() => {
    const map: {
      [key: string]: {
        code: string;
        name: string;
        quantitySold: number;
        totalRevenue: number;
        totalCost: number;
        netProfit: number;
      };
    } = {};

    filteredOrders
      .filter((o) => o.status === 'DELIVERED')
      .forEach((o) => {
        if (Array.isArray(o.items)) {
          o.items.forEach((item: any) => {
            const key = item.code || item.name;
            const qty = item.quantity || 1;
            const itemPrice = item.price || 0;
            const prod = products.find(
              (p) => p.name === item.name || (p.code && p.code === item.code)
            );
            const cost = prod?.costPrice ? prod.costPrice * qty : itemPrice * 0.55 * qty;
            const rev = itemPrice * qty;

            if (!map[key]) {
              map[key] = {
                code: item.code || 'بدون كود',
                name: item.name,
                quantitySold: 0,
                totalRevenue: 0,
                totalCost: 0,
                netProfit: 0,
              };
            }
            map[key].quantitySold += qty;
            map[key].totalRevenue += rev;
            map[key].totalCost += cost;
            map[key].netProfit += rev - cost;
          });
        }
      });

    return Object.values(map).sort((a, b) => b.netProfit - a.netProfit);
  }, [filteredOrders, products]);

  // Handle Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) {
      alert('يرجى كتابة بند المصروف وقيمته!');
      return;
    }

    setSubmittingExpense(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newExpenseTitle.trim(),
          category: newExpenseCategory,
          amount: parseFloat(newExpenseAmount),
          date: newExpenseDate,
          notes: newExpenseNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 60 });
        setExpenses((prev) => [data.expense, ...prev]);
        setShowAddExpenseModal(false);
        setNewExpenseTitle('');
        setNewExpenseAmount('');
        setNewExpenseNotes('');
        setSuccessMessage('تم تسجيل المصروف بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('حدث خطأ: ' + data.error);
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف مصروف "${title}"؟`)) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        setSuccessMessage('تم حذف المصروف بنجاح.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('تعذر الحذف: ' + data.error);
      }
    } catch (e: any) {
      alert('خطأ: ' + e.message);
    }
  };

  // Export to Excel CSV
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Arabic support
    csvContent += 'تقرير الحسابات والمركز المالي - متجر Fashion Zone\n';
    csvContent += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}\n\n`;

    csvContent += '=== ملخص المؤشرات المالية ===\n';
    csvContent += `إجمالي المبيعات,${metrics.grossRevenue} ج.م\n`;
    csvContent += `المبيعات المحصلة نقدياً (المستلمة),${metrics.collectedCash} ج.م\n`;
    csvContent += `أموال معلقة في الشحن,${metrics.inTransitCash} ج.م\n`;
    csvContent += `تكلفة البضاعة المباعة (رأس المال),${metrics.estimatedCOGS} ج.م\n`;
    csvContent += `إجمالي المصروفات التشغيلية,${metrics.totalExpenses} ج.م\n`;
    csvContent += `صافي الربح الفعلي,${metrics.netProfit} ج.م\n`;
    csvContent += `هامش الربح الصافي,${metrics.profitMargin.toFixed(1)}%\n\n`;

    csvContent += '=== سجل المصروفات ===\n';
    csvContent += 'التاريخ,البند,التصنيف,المبلغ,ملاحظات\n';
    filteredExpenses.forEach((exp) => {
      const catLabel = EXPENSE_CATEGORIES[exp.category]?.label || exp.category;
      const d = new Date(exp.date).toLocaleDateString('ar-EG');
      csvContent += `"${d}","${exp.title.replace(/"/g, '""')}","${catLabel}","${exp.amount}","${(exp.notes || '').replace(/"/g, '""')}"\n`;
    });

    csvContent += '\n=== أرباح الموديلات المباعة ===\n';
    csvContent += 'كود الموديل,اسم المنتج,الكمية المباعة,إجمالي الإيراد,التكلفة,صافي الربح\n';
    productProfitability.forEach((p) => {
      csvContent += `"${p.code}","${p.name.replace(/"/g, '""')}","${p.quantitySold}","${p.totalRevenue}","${p.totalCost}","${p.netProfit}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `FashionZone_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-xs font-bold text-stone-600">جاري التحقق والدخول للمركز المالي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-16 print:bg-white print:p-0">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-pink-50 text-rose-600 hover:bg-pink-100 transition flex items-center gap-1.5 text-xs font-bold"
              title="الرجوع للوحة التحكم الرئيسية"
            >
              <ArrowRight className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </Link>
            <div className="h-6 w-px bg-pink-100 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-sm shadow-pink-200">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  المركز المالي والحسابات والأرباح 📊
                </h1>
                <p className="text-[11px] text-stone-500">
                  Fashion Zone - تقارير التدفق النقدي، تكلفة البضاعة، والمصروفات
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-rose-500" />
              <span>طباعة كشف حساب</span>
            </button>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Printable Official Header (Visible ONLY on print) */}
        <div className="hidden print:block pb-4 mb-6 border-b-2 border-stone-800">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-stone-900">متجر Fashion Zone - كشف الحساب والتقرير المالي</h1>
              <p className="text-sm text-stone-600 mt-1">
                تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}
              </p>
            </div>
            <div className="text-left font-mono font-bold text-sm text-stone-700">
              تقرير رسمي معتمد
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-pink-100 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>الفترة المحاسبية:</span>
            </span>

            <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-2xl">
              {[
                { id: 'all', label: 'كل الفترات' },
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: 'آخر 7 أيام' },
                { id: 'month', label: 'هذا الشهر' },
                { id: 'custom', label: 'تاريخ مخصص' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodFilter(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    periodFilter === p.id
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {periodFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-stone-500 font-bold">من:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-pink-200 bg-white font-mono"
                />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-stone-500 font-bold">إلى:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-pink-200 bg-white font-mono"
                />
              </div>
            </div>
          )}

          <div className="text-xs text-stone-400 font-medium mr-auto">
            يتم احتساب الأرباح بناءً على الطلبات المسلمة والمسددة فعلياً
          </div>
        </div>

        {/* ==================================================== */}
        {/* EXECUTIVE FINANCIAL KPI CARDS */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Profit (صافي الربح الفعلي) */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-5 shadow-sm shadow-emerald-200/50 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold opacity-90">صافي الأرباح الحقيقية (Net Profit)</span>
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black font-sans tracking-tight">
                {metrics.netProfit.toLocaleString('ar-EG')} <span className="text-sm font-bold">ج.م</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-100">
                <span>هامش الربح: {metrics.profitMargin.toFixed(1)}%</span>
                <span>•</span>
                <span>{metrics.deliveredOrdersCount} طلب مسلم</span>
              </div>
            </div>
            <div className="text-[10px] opacity-80 mt-3 pt-2 border-t border-white/20">
              = المبيعات المحصلة - تكلفة البضاعة - المصروفات
            </div>
          </div>

          {/* Card 2: Collected Cash (المبيعات المحصلة نقدياً) */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-500">المبيعات المحصلة فعلياً (COD)</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-stone-900 font-sans">
                {metrics.collectedCash.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-500">ج.م</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم تحصيلها في يد المندوب أو الحساب</span>
              </div>
            </div>
            <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-100">
              إجمالي المبيعات الشاملة: {metrics.grossRevenue.toLocaleString('ar-EG')} ج.م
            </div>
          </div>

          {/* Card 3: Operating Expenses (إجمالي المصروفات التشغيلية) */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-500">إجمالي المصروفات التشغيلية</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600 font-sans">
                {metrics.totalExpenses.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-500">ج.م</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mt-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{filteredExpenses.length} بند مصروف مسجل</span>
              </div>
            </div>
            <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-100">
              إعلانات، شحن، تغليف، مرتبات ونثريات
            </div>
          </div>

          {/* Card 4: In-Transit / Pending Receivables (مستحقات معلقة بالشحن) */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-500">مستحقات معلقة (في الطريق)</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 font-sans">
                {metrics.inTransitCash.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-500">ج.م</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{metrics.inTransitOrdersCount} طلب جارٍ توصيله وتحصيله</span>
              </div>
            </div>
            <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-100">
              تكلفة البضاعة المقدرة (COGS): {metrics.estimatedCOGS.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* EXPENSES BREAKDOWN SECTION */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses Categories Visual Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-500" />
                <span>توزيع المصروفات حسب التصنيف</span>
              </h3>
              <span className="text-xs text-rose-600 font-bold font-sans">
                {metrics.totalExpenses} ج.م
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.keys(EXPENSE_CATEGORIES).map((key) => {
                const info = EXPENSE_CATEGORIES[key];
                const amt = metrics.expensesByCategory[key] || 0;
                const pct = metrics.totalExpenses > 0 ? (amt / metrics.totalExpenses) * 100 : 0;

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{info.icon}</span>
                        <span className="font-bold text-stone-700">{info.label}</span>
                      </div>
                      <div className="font-mono font-bold text-stone-800">
                        {amt.toLocaleString('ar-EG')} ج.م{' '}
                        <span className="text-stone-400 font-normal text-[10px]">({pct.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expenses Log Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-stone-900">سجل المصروفات والنثريات</h3>
                <span className="text-xs bg-pink-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                  {filteredExpenses.length} مصروف
                </span>
              </div>

              {/* Category Filter & Search */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-pink-200 bg-white outline-none"
                >
                  <option value="ALL">كل التصنيفات</option>
                  {Object.keys(EXPENSE_CATEGORIES).map((k) => (
                    <option key={k} value={k}>
                      {EXPENSE_CATEGORIES[k].label}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-44">
                  <input
                    type="text"
                    placeholder="بحث في المصروفات..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-pink-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-400">
                لا توجد مصروفات مسجلة في هذه الفترة.{' '}
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="text-rose-600 font-bold underline"
                >
                  تسجيل مصروف الآن
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                      <th className="pb-2.5">التاريخ</th>
                      <th className="pb-2.5">بند المصروف</th>
                      <th className="pb-2.5">التصنيف</th>
                      <th className="pb-2.5">المبلغ</th>
                      <th className="pb-2.5">ملاحظات</th>
                      <th className="pb-2.5 text-center print:hidden">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredExpenses.map((exp) => {
                      const cat = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.OTHER;
                      return (
                        <tr key={exp.id} className="hover:bg-pink-50/30 transition">
                          <td className="py-2.5 font-mono text-stone-500 whitespace-nowrap">
                            {new Date(exp.date).toLocaleDateString('ar-EG', { dateStyle: 'short' })}
                          </td>
                          <td className="py-2.5 font-bold text-stone-800">{exp.title}</td>
                          <td className="py-2.5 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${cat.bg} ${cat.color}`}
                            >
                              {cat.icon} {cat.label}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono font-black text-rose-600 whitespace-nowrap">
                            {exp.amount.toLocaleString('ar-EG')} ج.م
                          </td>
                          <td className="py-2.5 text-stone-500 text-[11px] max-w-xs truncate">
                            {exp.notes || '-'}
                          </td>
                          <td className="py-2.5 text-center whitespace-nowrap print:hidden">
                            <button
                              onClick={() => handleDeleteExpense(exp.id, exp.title)}
                              className="text-stone-300 hover:text-red-500 transition p-1"
                              title="حذف المصروف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* ==================================================== */}
        {/* PRODUCT PROFITABILITY TABLE */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-pink-50">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>تحليل أرباح الموديلات المباعة (Product Profitability)</span>
              </h3>
              <p className="text-xs text-stone-400">
                حساب الأرباح المحققة لكل كود موديل بناءً على الطلبات المسلمة فعلياً
              </p>
            </div>
          </div>

          {productProfitability.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400">
              لا توجد مبيعات مكتملة ومسلمة حتى الآن لاحتساب أرباح الموديلات.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                    <th className="pb-2.5">كود الموديل</th>
                    <th className="pb-2.5">اسم الموديل / المنتج</th>
                    <th className="pb-2.5 text-center">الكمية المباعة</th>
                    <th className="pb-2.5">إجمالي المبيعات</th>
                    <th className="pb-2.5">التكلفة الإجمالية</th>
                    <th className="pb-2.5">صافي الربح المحقق</th>
                    <th className="pb-2.5 text-center">نسبة الربحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {productProfitability.map((item, idx) => {
                    const margin =
                      item.totalRevenue > 0 ? (item.netProfit / item.totalRevenue) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-pink-50/20 transition">
                        <td className="py-2.5">
                          <span className="font-mono font-bold text-[11px] text-rose-700 bg-pink-100/80 px-2 py-0.5 rounded-lg border border-pink-200">
                            {item.code}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-stone-800">{item.name}</td>
                        <td className="py-2.5 text-center font-bold text-stone-700 font-mono">
                          {item.quantitySold} قطعة
                        </td>
                        <td className="py-2.5 font-bold font-mono text-stone-900">
                          {item.totalRevenue.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-2.5 font-mono text-stone-500">
                          {item.totalCost.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-2.5 font-mono font-black text-emerald-600">
                          +{item.netProfit.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-2.5 text-center font-bold text-emerald-700 font-mono">
                          {margin.toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Printable Footer (Visible ONLY on print) */}
        <div className="hidden print:block pt-12 text-xs text-stone-500 border-t border-stone-200 mt-12">
          <div className="flex justify-between items-center">
            <div>
              <p>تم إعداد هذا التقرير تلقائياً عبر نظام الحسابات لمتجر Fashion Zone.</p>
              <p>توقيع مسؤول الحسابات: ______________________</p>
            </div>
            <div className="text-left font-mono">
              ختم الإدارة المالية
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL: ADD EXPENSE */}
      {/* ==================================================== */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-pink-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  💰
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">تسجيل مصروف جديد</h3>
                  <p className="text-[11px] text-stone-500">إدخال تكاليف إعلانات، شحن، تغليف أو مرتبات</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  بند المصروف (الوصف) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تمويل إعلان فيسبوك / شحنات أرامكس / أكياس وبوليصات"
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    تصنيف المصروف *
                  </label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                  >
                    {Object.keys(EXPENSE_CATEGORIES).map((key) => (
                      <option key={key} value={key}>
                        {EXPENSE_CATEGORIES[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    المبلغ (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="مثال: 500"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold font-mono text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  تاريخ الصرف
                </label>
                <input
                  type="date"
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ملاحظات أو رقم الفاتورة (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل تخص المصروف أو طريقة السداد..."
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  {submittingExpense ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد وحفظ المصروف</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
