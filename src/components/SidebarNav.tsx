import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Users,
  Truck,
  ShoppingBag,
  Vault,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  ClipboardCheck,
  Bell,
  Database,
  Settings,
  History,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';

interface NavItem {
  key: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  highlight?: boolean;
}

export const SidebarNav: React.FC = () => {
  const { activeTab, setActiveTab, alerts, heldSales, products } = useApp();

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'لوحة التحكم',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      key: 'pos',
      label: 'نقطة البيع (POS)',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: heldSales.length > 0 ? heldSales.length : undefined,
      highlight: true,
    },
    {
      key: 'products',
      label: 'المنتجات',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      key: 'categories',
      label: 'الأصناف (التصنيفات)',
      icon: <Tags className="w-4 h-4" />,
    },
    {
      key: 'customers',
      label: 'العملاء',
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: 'suppliers',
      label: 'الموردون',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      key: 'purchases',
      label: 'المشتريات',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      key: 'treasury',
      label: 'الخزنة',
      icon: <Vault className="w-4 h-4" />,
    },
    {
      key: 'expenses',
      label: 'المصاريف',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      key: 'reports',
      label: 'التقارير',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      key: 'analytics',
      label: 'الإحصائيات',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: 'inventory',
      label: 'الجرد',
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      key: 'alerts',
      label: 'التنبيهات',
      icon: <Bell className="w-4 h-4" />,
      badge: alerts.length > 0 ? alerts.length : undefined,
    },
    {
      key: 'backup',
      label: 'النسخ الاحتياطي',
      icon: <Database className="w-4 h-4" />,
    },
    {
      key: 'settings',
      label: 'الإعدادات',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: 'audit',
      label: 'سجل العمليات',
      icon: <History className="w-4 h-4" />,
    },
    {
      key: 'about',
      label: 'حول البرنامج (Acode)',
      icon: <Info className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800/80 shrink-0 select-none overflow-y-auto h-[calc(100vh-65px)] p-3.5 transition-colors">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 font-bold scale-[1.02]'
                    : item.highlight
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full transition-all ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : item.key === 'alerts'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pro Banner */}
        <div className="mt-auto pt-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white text-right relative overflow-hidden shadow-lg shadow-indigo-950/30">
            <Sparkles className="w-4 h-4 text-amber-400 mb-1 animate-pulse" />
            <p className="text-xs font-bold text-indigo-300">Aïcha POS Pro v1.0</p>
            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
              تصميم Sleek أنيق يعمل بدون إنترنت ويدعم التصدير إلى Acode للاندرويد
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Quick Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
        {[
          { key: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard className="w-5 h-5" /> },
          { key: 'pos', label: 'البيع', icon: <ShoppingCart className="w-5 h-5" /> },
          { key: 'products', label: 'المنتجات', icon: <Package className="w-5 h-5" /> },
          { key: 'treasury', label: 'الخزنة', icon: <Vault className="w-5 h-5" /> },
          { key: 'reports', label: 'التقارير', icon: <FileSpreadsheet className="w-5 h-5" /> },
          { key: 'about', label: 'حول', icon: <Info className="w-5 h-5" /> },
        ].map((m) => {
          const isActive = activeTab === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key as NavigationTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold scale-110'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {m.icon}
              <span className="mt-0.5">{m.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
