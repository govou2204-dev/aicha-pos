import React from 'react';
import {
  Vault,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Truck,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';

export const DashboardView: React.FC = () => {
  const [salesChartPeriod, setSalesChartPeriod] = React.useState<'weekly' | 'monthly'>('weekly');

  const {
    settings,
    products,
    customers,
    suppliers,
    sales,
    purchases,
    expenses,
    treasuryTransactions,
    currentShift,
    alerts,
    smartTips,
    setActiveTab,
    exportBackup,
  } = useApp();

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySales = sales.filter((s) => s.date.startsWith(todayStr) && s.status === 'completed');
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const todayExpenses = expenses.filter((e) => e.date.startsWith(todayStr));
  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const todayPurchases = purchases.filter((p) => p.date.startsWith(todayStr));
  const todayPurchasesTotal = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Today Profit calculation
  const todayCost = todaySales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + item.purchasePrice * item.quantity, 0);
  }, 0);
  const todayProfit = todaySalesTotal - todayCost - todayExpensesTotal;

  const currentVaultBalance = treasuryTransactions.reduce((bal, tx) => {
    if (tx.type === 'deposit' || tx.type === 'sale') return bal + tx.amount;
    if (tx.type === 'withdrawal' || tx.type === 'purchase' || tx.type === 'expense') return bal - tx.amount;
    return bal;
  }, 0);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Real Weekly sales & profit calculation for current week (Sun to Sat)
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const now = new Date();
  const currentDayIdx = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - currentDayIdx);

  const weeklySalesData = daysOfWeek.map((dayName, idx) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + idx);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Filter completed sales for this specific day
    const daySales = sales.filter((s) => {
      if (s.status !== 'completed' || !s.date) return false;
      const sDate = new Date(s.date);
      if (isNaN(sDate.getTime())) return s.date.startsWith(dateStr);
      const sY = sDate.getFullYear();
      const sM = String(sDate.getMonth() + 1).padStart(2, '0');
      const sD = String(sDate.getDate()).padStart(2, '0');
      return `${sY}-${sM}-${sD}` === dateStr;
    });

    // Filter expenses for this specific day
    const dayExpenses = expenses.filter((e) => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      if (isNaN(eDate.getTime())) return e.date.startsWith(dateStr);
      const eY = eDate.getFullYear();
      const eM = String(eDate.getMonth() + 1).padStart(2, '0');
      const eD = String(eDate.getDate()).padStart(2, '0');
      return `${eY}-${eM}-${eD}` === dateStr;
    });

    const salesTotal = daySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const costTotal = daySales.reduce((sum, s) => {
      if (!s.items) return sum;
      return sum + s.items.reduce((iSum, item) => iSum + (item.purchasePrice || 0) * (item.quantity || 0), 0);
    }, 0);
    const expensesTotal = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const netProfit = salesTotal - costTotal - expensesTotal;

    return {
      name: dayName,
      day: dayName,
      month: '',
      مبيعات: salesTotal,
      أرباح: Math.max(0, netProfit),
      فواتير: daySales.length,
    };
  });

  const totalWeeklySales = weeklySalesData.reduce((acc, curr) => acc + curr.مبيعات, 0);
  const totalWeeklyProfit = weeklySalesData.reduce((acc, curr) => acc + curr.أرباح, 0);

  // Real Monthly sales & profit calculation for current year (12 months)
  const monthNames = [
    'جانفي', 'فيفري', 'مارس', 'أبريل', 'ماي', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentYear = now.getFullYear();

  const monthlySalesData = monthNames.map((monthName, mIdx) => {
    const monthNum = String(mIdx + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${monthNum}`;

    // Filter completed sales for this month
    const mSales = sales.filter((s) => {
      if (s.status !== 'completed' || !s.date) return false;
      const sDate = new Date(s.date);
      if (isNaN(sDate.getTime())) return s.date.startsWith(monthPrefix);
      const sY = sDate.getFullYear();
      const sM = String(sDate.getMonth() + 1).padStart(2, '0');
      return sY === currentYear && sM === monthNum;
    });

    // Filter expenses for this month
    const mExpenses = expenses.filter((e) => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      if (isNaN(eDate.getTime())) return e.date.startsWith(monthPrefix);
      const eY = eDate.getFullYear();
      const eM = String(eDate.getMonth() + 1).padStart(2, '0');
      return eY === currentYear && eM === monthNum;
    });

    const salesTotal = mSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const costTotal = mSales.reduce((sum, s) => {
      if (!s.items) return sum;
      return sum + s.items.reduce((iSum, item) => iSum + (item.purchasePrice || 0) * (item.quantity || 0), 0);
    }, 0);
    const expensesTotal = mExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const netProfit = salesTotal - costTotal - expensesTotal;

    return {
      name: monthName,
      day: '',
      month: monthName,
      مبيعات: salesTotal,
      أرباح: Math.max(0, netProfit),
      فواتير: mSales.length,
    };
  });

  const totalYearlySales = monthlySalesData.reduce((acc, curr) => acc + curr.مبيعات, 0);
  const totalYearlyProfit = monthlySalesData.reduce((acc, curr) => acc + curr.أرباح, 0);

  // Current Month Stats (e.g. August)
  const currentMonthIdx = now.getMonth();
  const currentMonthData = monthlySalesData[currentMonthIdx] || { مبيعات: 0, أرباح: 0, فواتير: 0 };
  const currentMonthName = monthNames[currentMonthIdx];

  // Category chart data
  const categoryCounts: { [cat: string]: number } = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + (p.soldCount || 0);
  });

  let categoryPieData = Object.keys(categoryCounts)
    .map((cat) => ({
      name: cat,
      value: categoryCounts[cat] || 0,
    }))
    .filter((c) => c.value > 0);

  if (categoryPieData.length === 0) {
    const catProdCounts: { [cat: string]: number } = {};
    products.forEach((p) => {
      catProdCounts[p.category] = (catProdCounts[p.category] || 0) + 1;
    });
    categoryPieData = Object.keys(catProdCounts).map((cat) => ({
      name: cat,
      value: catProdCounts[cat],
    }));
  }

  const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6'];

  // Top 5 selling products
  const topProducts = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Smart AI Assistant Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-indigo-300">
                  المساعد الذكي لمكتبة عائشة 🤖
                </h3>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-400/30">
                  تحليل تلقائي
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {smartTips[0] || 'أهلاً بك! النظام يعمل بكفاءة كاملة وسجل المبيعات محدث.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('pos')}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>فاتورة بيع جديدة</span>
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>فاتورة شراء</span>
            </button>
            <button
              onClick={exportBackup}
              title="تصدير وحفظ نسخة احتياطية فورية على جهازك (.json)"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all border border-emerald-500/30 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span>تصدير نسخة احتياطية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {[
          { key: 'pos', label: 'بيع', icon: <ShoppingCart className="w-5 h-5" />, color: 'bg-indigo-600' },
          { key: 'purchases', label: 'شراء', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-violet-600' },
          { key: 'products', label: 'منتج', icon: <Package className="w-5 h-5" />, color: 'bg-blue-600' },
          { key: 'customers', label: 'عميل', icon: <Users className="w-5 h-5" />, color: 'bg-amber-600' },
          { key: 'suppliers', label: 'مورد', icon: <Truck className="w-5 h-5" />, color: 'bg-rose-600' },
          { key: 'inventory', label: 'جرد', icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-emerald-600' },
          { key: 'reports', label: 'تقرير', icon: <FileText className="w-5 h-5" />, color: 'bg-indigo-500' },
          { key: 'backup', label: 'نسخة', icon: <Vault className="w-5 h-5" />, color: 'bg-slate-700' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key as NavigationTab)}
            className="p-3 bg-white/90 dark:bg-slate-900/90 hover:scale-[1.03] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 group"
          >
            <div className={`w-9 h-9 rounded-xl ${item.color} text-white flex items-center justify-center mb-1.5 shadow-md shadow-indigo-500/10`}>
              {item.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* 10 Stat Cards Grid */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <span>مؤشرات وإحصائيات اليوم</span>
          <span className="text-xs font-normal text-slate-400">(محدثة لحظياً)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. رصيد الخزنة */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">💰 رصيد الخزنة</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Vault className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {currentVaultBalance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> اليومية مفتوحة
            </span>
          </div>

          {/* 2. أرباح اليوم */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">📈 أرباح اليوم</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {todayProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
            </p>
            <span className="text-[10px] text-teal-600 font-semibold mt-1 block">
              صافي الربح بعد المصاريف
            </span>
          </div>

          {/* 3. خسائر/مصاريف اليوم */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">📉 مصاريف اليوم</span>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
              {todayExpensesTotal.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
            </p>
            <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
              {todayExpenses.length} عمليات مصروف
            </span>
          </div>

          {/* 4. مبيعات اليوم */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">🛒 مبيعات اليوم</span>
              <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {todaySalesTotal.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
            </p>
            <span className="text-[10px] text-indigo-500 font-semibold mt-1 block">
              {todaySales.length} فواتير مسددة
            </span>
          </div>

          {/* 5. مشتريات اليوم */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">📥 مشتريات اليوم</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {todayPurchasesTotal.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {todayPurchases.length} فواتير توريد
            </span>
          </div>

          {/* 6. عدد المنتجات */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">📦 عدد المنتجات</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {products.length} <span className="text-xs text-slate-400 font-normal">صنف بالمكتبة</span>
            </p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
              إجمالي القطع: {products.reduce((s, p) => s + p.stock, 0)}
            </span>
          </div>

          {/* 7. العملاء */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">👥 العملاء</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {customers.length} <span className="text-xs text-slate-400 font-normal">عميل مسجل</span>
            </p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              الديون: {customers.reduce((s, c) => s + c.debt, 0)} {settings.currency}
            </span>
          </div>

          {/* 8. الموردون */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">🚚 الموردون</span>
              <div className="p-2 bg-sky-50 dark:bg-sky-950/40 text-sky-600 rounded-xl">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {suppliers.length} <span className="text-xs text-slate-400 font-normal">مورد تعامل</span>
            </p>
            <span className="text-[10px] text-sky-600 font-semibold mt-1 block">
              المستحقات: {suppliers.reduce((s, sup) => s + sup.debtToPay, 0)} {settings.currency}
            </span>
          </div>

          {/* 9. عدد الفواتير */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">🧾 إجمالي الفواتير</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {sales.length} <span className="text-xs text-slate-400 font-normal">فاتورة مسجلة</span>
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
              تراكمي المبيعات
            </span>
          </div>

          {/* 10. المنتجات الناقصة */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">⚠ المنتجات الناقصة</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
              {lowStockProducts.length + outOfStockProducts.length} <span className="text-xs text-slate-400 font-normal">منتجات</span>
            </p>
            <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
              {outOfStockProducts.length} نفد، {lowStockProducts.length} منخفض
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Analytical Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales & Profits Bar Chart with Weekly / Monthly Toggle */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  {salesChartPeriod === 'weekly' ? 'حركة المبيعات والأرباح الأسبوعية' : 'حركة المبيعات والأرباح الشهرية (سنة ' + currentYear + ')'}
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                  حقيقي {sales.length > 0 ? `(${sales.length} فواتير)` : '(0 عمليات)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {salesChartPeriod === 'weekly' ? (
                  <>
                    مبيعات الأسبوع: <span className="font-black text-emerald-600 dark:text-emerald-400">{totalWeeklySales.toLocaleString()} {settings.currency}</span> | صافي الأرباح: <span className="font-black text-blue-600 dark:text-blue-400">{totalWeeklyProfit.toLocaleString()} {settings.currency}</span>
                  </>
                ) : (
                  <>
                    مبيعات السنة التراكمية: <span className="font-black text-emerald-600 dark:text-emerald-400">{totalYearlySales.toLocaleString()} {settings.currency}</span> | أرباح السنة: <span className="font-black text-blue-600 dark:text-blue-400">{totalYearlyProfit.toLocaleString()} {settings.currency}</span>
                  </>
                )}
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSalesChartPeriod('weekly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  salesChartPeriod === 'weekly'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📅 حركة أسبوعية
              </button>
              <button
                type="button"
                onClick={() => setSalesChartPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  salesChartPeriod === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🗓️ حركة شهرية
              </button>
            </div>
          </div>

          {/* Quick Monthly Summary Banner if Monthly view is active */}
          {salesChartPeriod === 'monthly' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">مبيعات شهر {currentMonthName}</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {currentMonthData.مبيعات.toLocaleString()} {settings.currency}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">أرباح شهر {currentMonthName}</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                  {currentMonthData.أرباح.toLocaleString()} {settings.currency}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">فواتير شهر {currentMonthName}</span>
                <span className="font-black text-purple-600 dark:text-purple-400 text-sm">
                  {currentMonthData.فواتير} فاتورة
                </span>
              </div>
            </div>
          )}

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartPeriod === 'weekly' ? weeklySalesData : monthlySalesData}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ${settings.currency}`, '']}
                />
                <Bar dataKey="مبيعات" fill="#10b981" radius={[6, 6, 0, 0]} name="المبيعات" />
                <Bar dataKey="أرباح" fill="#3b82f6" radius={[6, 6, 0, 0]} name="الأرباح" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              المبيعات حسب الأصناف
            </h3>
            <p className="text-xs text-slate-400 mb-4">توزيع الكميات المباعة في المكتبة</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
            {categoryPieData.slice(0, 4).map((c, idx) => (
              <div key={c.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Watch & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product Stock Watch */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>حالة المخزون والتنبيهات</span>
            </h3>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              إدارة المخزون ←
            </button>
          </div>

          <div className="space-y-2.5">
            {outOfStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">{p.name}</h4>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400">
                    الباركود: {p.barcode} | نفد بالكامل!
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-xl">
                  الكمية: 0
                </span>
              </div>
            ))}

            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">{p.name}</h4>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
                    حد التنبيه: {p.minStockAlert} قطعة
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold rounded-xl">
                  متبقي {p.stock}
                </span>
              </div>
            ))}

            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                جميع المنتجات بمستوى مخزون ممتازة وبحالة سليمة!
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Selling Products */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>الأكثر مبيعاً بالمكتبة</span>
            </h3>
            <span className="text-xs text-slate-400">سجل تراكمي</span>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{p.name}</h4>
                    <span className="text-[10px] text-slate-400">{p.category}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {p.soldCount} مبيعة
                  </p>
                  <span className="text-[10px] text-slate-400">{p.salePrice} {settings.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
