import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bell,
  Search,
  Settings,
  Sun,
  Moon,
  User,
  Clock,
  Calendar,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';

export const HeaderBar: React.FC = () => {
  const {
    settings,
    currentUser,
    logout,
    alerts,
    setActiveTab,
    activeTab,
    updateSettings,
    products,
    customers,
  } = useApp();

  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString('ar-DZ', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' });
  };

  const filteredSearchProducts = globalQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
          p.barcode.includes(globalQuery) ||
          p.category.includes(globalQuery)
      )
    : [];

  const filteredSearchCustomers = globalQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
          c.phone.includes(globalQuery)
      )
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 shadow-sm flex items-center justify-center p-0.5 group-hover:scale-105 transition-all shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {settings.libraryName || 'مكتبة عائشة'}
              </h1>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wide">
                Aïcha POS Pro v1.0 • Sleek
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Date */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100/80 dark:bg-slate-800/80 px-4 py-1.5 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl text-xs transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-xs"
            title="بحث فوري في كل النظام"
          >
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline font-medium">بحث فوري...</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-xs"
            title={settings.themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
          >
            {settings.themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-xs"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {alerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                {/* Backdrop overlay to close dropdown on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />

                <div className="fixed top-16 left-3 right-3 sm:absolute sm:top-full sm:left-0 sm:right-auto sm:w-80 sm:max-w-xs mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-right">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      التنبيهات الذكية ({alerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('alerts');
                        setShowNotifications(false);
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      عرض الكل
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-4">
                        لا يوجد تنبيهات حالياً 👍
                      </p>
                    ) : (
                      alerts.slice(0, 5).map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => {
                            if (alt.tabKey) setActiveTab(alt.tabKey as NavigationTab);
                            setShowNotifications(false);
                          }}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl cursor-pointer transition-colors border-r-3 border-amber-500"
                        >
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {alt.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {alt.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Settings Shortcut */}
          <button
            onClick={() => {
              setActiveTab('settings');
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className={`p-2.5 rounded-xl transition-all border shadow-xs ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/25'
                : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Info & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-all text-right shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/20">
                {currentUser?.name.charAt(0) || 'م'}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                  {currentUser?.role === 'manager'
                    ? 'مدير'
                    : currentUser?.role === 'cashier'
                    ? 'بائع'
                    : 'محاسب'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop overlay to close dropdown on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                <div className="fixed top-16 left-3 right-3 sm:absolute sm:top-full sm:left-0 sm:right-auto sm:w-52 sm:max-w-xs mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-right">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {currentUser?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{currentUser?.phone || 'مستخدم نشط'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 mt-1 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>الصلاحيات والحساب</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 mt-1 font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                البحث السريع في المكتبة
              </span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق ✕
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="ابحث بالاسم، الباركود، الصنف، أو رقم الهاتف..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white mb-4"
            />

            <div className="max-h-80 overflow-y-auto space-y-4">
              {filteredSearchProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    المنتجات ({filteredSearchProducts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredSearchProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab('products');
                          setShowSearchModal(false);
                        }}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {p.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            باركود: {p.barcode} | مخزون: {p.stock}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          {p.salePrice} {settings.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredSearchCustomers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                    العملاء ({filteredSearchCustomers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredSearchCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveTab('customers');
                          setShowSearchModal(false);
                        }}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {c.name}
                          </p>
                          <span className="text-[10px] text-slate-400">هاتف: {c.phone}</span>
                        </div>
                        <span className="text-xs font-bold text-rose-500">
                          دين: {c.debt} {settings.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {globalQuery.trim() &&
                filteredSearchProducts.length === 0 &&
                filteredSearchCustomers.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    لم يتم العثور على أي نتائج مطابقة لـ "{globalQuery}"
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
