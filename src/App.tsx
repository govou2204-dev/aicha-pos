import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { LoginModal } from './components/LoginModal';
import { HeaderBar } from './components/HeaderBar';
import { SidebarNav } from './components/SidebarNav';

import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { ProductsView } from './components/ProductsView';
import { CategoriesView } from './components/CategoriesView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { PurchasesView } from './components/PurchasesView';
import { TreasuryView } from './components/TreasuryView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { AnalyticsView } from './components/AnalyticsView';
import { InventoryView } from './components/InventoryView';
import { AlertsView } from './components/AlertsView';
import { BackupView } from './components/BackupView';
import { SettingsView } from './components/SettingsView';
import { AuditView } from './components/AuditView';
import { AboutView } from './components/AboutView';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser, settings, splashVisible } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isDarkMode = settings.themeMode === 'dark';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <POSView />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'customers':
        return <CustomersView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'purchases':
        return <PurchasesView />;
      case 'treasury':
        return <TreasuryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'inventory':
        return <InventoryView />;
      case 'alerts':
        return <AlertsView />;
      case 'backup':
        return <BackupView />;
      case 'settings':
        return <SettingsView />;
      case 'audit':
        return <AuditView />;
      case 'about':
        return <AboutView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans dir-rtl transition-colors duration-200`}>
      {/* Animated Splash Screen Overlay */}
      <SplashScreen />

      {/* Global Top Header Bar */}
      <HeaderBar onOpenLoginModal={() => setShowLoginModal(true)} />

      {/* Body Content with Sidebar */}
      <div className="flex pt-16">
        <SidebarNav />

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full transition-all">
          {renderTabContent()}
        </main>
      </div>

      {/* User Login / Switch Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
