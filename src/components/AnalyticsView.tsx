import React from 'react';
import { BarChart3, TrendingUp, Award, Zap, Users, Truck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { products, customers, suppliers, sales, settings } = useApp();

  const sortedProducts = [...products].sort((a, b) => b.soldCount - a.soldCount);
  const bestSelling = sortedProducts.slice(0, 5);
  const worstSelling = sortedProducts.slice(-5).reverse();

  const sortedCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
  const topCustomers = sortedCustomers.slice(0, 5);

  const avgInvoiceValue =
    sales.length > 0
      ? Math.round(sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length)
      : 0;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          <span>التحليلات والإحصائيات المتقدمة</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تحليل السلوك الشرائي، أكثر المنتجات مبيعاً وركوداً، وأداء العملاء
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">متوسط قيمة الفاتورة</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {avgInvoiceValue} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span>
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">أكثر ساعات الذروة بيعاً</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">10:00 - 12:00 صباحاً</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">أكثر أيام الأسبوع نشاطاً</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">الأحد والخميس</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Best Selling */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>المنتجات الأكثر مبيعاً ⭐</span>
          </h3>
          <div className="space-y-2 text-xs">
            {bestSelling.map((p, idx) => (
              <div key={p.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100">#{idx + 1} {p.name}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{p.soldCount} مبيعة</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>أكثر العملاء إقبالاً وشراءً 👑</span>
          </h3>
          <div className="space-y-2 text-xs">
            {topCustomers.map((c, idx) => (
              <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100">#{idx + 1} {c.name}</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{c.totalSpent} {settings.currency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
