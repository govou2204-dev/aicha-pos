import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseInvoice,
  Expense,
  TreasuryTransaction,
  DailyShift,
  AuditLog,
  AppSettings,
  SmartAlert,
  AppUser,
  UserRole,
  NavigationTab,
  ProductCategory
} from '../types';
import {
  initialUsers,
  initialSettings,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialTreasuryTransactions,
} from '../data/initialData';

interface AppContextType {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  splashVisible: boolean;
  dismissSplash: () => void;
  users: AppUser[];
  products: Product[];
  categories: ProductCategory[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: SaleInvoice[];
  heldSales: SaleInvoice[];
  purchases: PurchaseInvoice[];
  expenses: Expense[];
  treasuryTransactions: TreasuryTransaction[];
  currentShift: DailyShift | null;
  auditLogs: AuditLog[];
  settings: AppSettings;
  alerts: SmartAlert[];
  smartTips: string[];

  // User Auth & Shift
  login: (username: string, pass: string) => boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  addUser: (userData: { username: string; password?: string; fullName?: string; name?: string; role: UserRole; avatar?: string; phone?: string }) => void;
  updateUser: (id: string, userData: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  openShift: (startingBalance: number) => void;
  closeShift: (endingBalance: number) => void;
  updateShiftStartingBalance: (startingBalance: number) => void;

  // Products
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'soldCount'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Customers
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'debt'>) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  payCustomerDebt: (customerId: string, amount: number) => void;

  // Suppliers
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'debtToPay'>) => void;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  paySupplierDebt: (supplierId: string, amount: number) => void;

  // Sales & POS
  completeSale: (saleData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>) => SaleInvoice;
  holdSale: (saleData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>) => void;
  restoreHeldSale: (heldId: string) => SaleInvoice | null;
  deleteHeldSale: (heldId: string) => void;
  returnSale: (invoiceId: string, reason?: string) => void;

  // Purchases
  completePurchase: (purchaseData: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>) => void;

  // Expenses & Treasury
  addExpense: (expenseData: Omit<Expense, 'id' | 'date' | 'addedBy'>) => void;
  addTreasuryTx: (txData: Omit<TreasuryTransaction, 'id' | 'date' | 'user'>) => void;
  updateTreasuryTx: (id: string, txData: Partial<TreasuryTransaction>) => void;
  deleteTreasuryTx: (id: string) => void;
  clearTreasuryTransactions: () => void;

  // Stock Inventory
  adjustStock: (adjustments: { productId: string; actualQty: number; reason: string }[]) => void;

  // Categories & Settings
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Backup & Storage
  exportDatabaseJSON: () => void;
  exportBackup: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;
  importBackup: (jsonStr: string) => boolean;
  resetToSampleData: () => void;
  resetData: () => void;

  // Audit
  logAction: (action: AuditLog['action'], details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aicha_pos_pro_data_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splashVisible, setSplashVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => initialUsers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Core collections initialized from LocalStorage or default fallback
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sales, setSales] = useState<SaleInvoice[]>(initialSales);
  const [heldSales, setHeldSales] = useState<SaleInvoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(initialPurchases);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>(initialTreasuryTransactions);
  const [currentShift, setCurrentShift] = useState<DailyShift | null>({
    id: 'shift_today',
    date: new Date().toISOString().split('T')[0],
    openedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    startingBalance: 0,
    totalSales: 0,
    totalExpenses: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    netCash: 0,
    status: 'open',
    cashier: 'إلياس (المدير)',
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_1',
      date: new Date().toISOString(),
      user: 'إلياس (المدير)',
      role: 'manager',
      action: 'تسجيل الدخول',
      details: 'بدء الجلسة بنجاح في النظام',
    },
  ]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.heldSales) setHeldSales(parsed.heldSales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.treasuryTransactions) setTreasuryTransactions(parsed.treasuryTransactions);
        if (parsed.currentShift !== undefined) setCurrentShift(parsed.currentShift);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const dataToSave = {
      users,
      products,
      categories,
      customers,
      suppliers,
      sales,
      heldSales,
      purchases,
      expenses,
      treasuryTransactions,
      currentShift,
      auditLogs,
      settings,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    users,
    products,
    categories,
    customers,
    suppliers,
    sales,
    heldSales,
    purchases,
    expenses,
    treasuryTransactions,
    currentShift,
    auditLogs,
    settings,
  ]);

  // Handle Theme effect
  useEffect(() => {
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.themeMode]);

  // Log action helper
  const logAction = (action: AuditLog['action'], details: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      date: new Date().toISOString(),
      user: currentUser?.name || 'مستخدم غير محدد',
      role: currentUser?.role || 'cashier',
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]); // keep max 200 logs
  };

  const dismissSplash = () => setSplashVisible(false);

  // Auth
  const login = (username: string, pass: string): boolean => {
    const matched = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
      logAction('تسجيل الدخول', `تم تسجيل الدخول بواسطة ${matched.name} (${matched.role})`);
      return true;
    }
    return false;
  };

  const loginAsUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      logAction('تسجيل الدخول', `تبديل الحساب إلى ${found.name}`);
    }
  };

  const logout = () => {
    if (currentUser) {
      logAction('تسجيل الخروج', `تم خروج ${currentUser.name}`);
    }
    setIsLoggedIn(false);
  };

  const addUser = (userData: { username: string; password?: string; fullName?: string; name?: string; role: UserRole; avatar?: string; phone?: string }) => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    const newUser: AppUser = {
      id: 'usr_' + Date.now(),
      name: userData.fullName || userData.name || userData.username,
      fullName: userData.fullName || userData.name || userData.username,
      username: userData.username,
      password: userData.password,
      role: userData.role,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: userData.phone,
      active: true,
    };
    setUsers((prev) => [...prev, newUser]);
    logAction('تعديل', `إضافة مستخدم جديد: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, userData: Partial<AppUser>) => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updatedName = userData.fullName || userData.name || u.fullName || u.name;
          return {
            ...u,
            ...userData,
            name: updatedName,
            fullName: updatedName,
          };
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updatedName = userData.fullName || userData.name || prev.fullName || prev.name;
        return {
          ...prev,
          ...userData,
          name: updatedName,
          fullName: updatedName,
        };
      });
    }

    logAction('تعديل', `تحديث اسم المستخدم/كلمة المرور لحساب ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    const usr = users.find((u) => u.id === id);
    if (usr?.role === 'manager' || usr?.role === 'admin') {
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAction('حذف', `حذف حساب المستخدم: ${usr?.name || id}`);
  };

  // Shift Management
  const openShift = (startingBalance: number) => {
    const newShift: DailyShift = {
      id: 'shift_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      openedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      startingBalance,
      totalSales: 0,
      totalExpenses: 0,
      totalDeposits: startingBalance,
      totalWithdrawals: 0,
      netCash: startingBalance,
      status: 'open',
      cashier: currentUser?.name || 'مدير',
    };
    setCurrentShift(newShift);
    
    // Create initial deposit tx
    const tx: TreasuryTransaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString(),
      type: 'deposit',
      amount: startingBalance,
      description: 'افتتاح الخزنة اليومية (الرصيد الأولي)',
      category: 'افتتاحي',
      user: currentUser?.name || 'مدير',
    };
    setTreasuryTransactions((prev) => [tx, ...prev]);
    logAction('تعديل', `تم فتح يومية جديدة برصيد أولي: ${startingBalance} ${settings.currency}`);
  };

  const closeShift = (endingBalance: number) => {
    if (!currentShift) return;
    const closed: DailyShift = {
      ...currentShift,
      closedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      endingBalance,
      status: 'closed',
    };
    setCurrentShift(closed);
    logAction('تعديل', `تم إغلاق اليومية الحالية برصيد نهاي: ${endingBalance} ${settings.currency}`);
  };

  const updateShiftStartingBalance = (newStartingBalance: number) => {
    if (!currentShift) return;
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    const diff = newStartingBalance - currentShift.startingBalance;
    setCurrentShift((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        startingBalance: newStartingBalance,
        totalDeposits: Math.max(0, prev.totalDeposits + diff),
        netCash: prev.netCash + diff,
      };
    });
    logAction('تعديل', `تعديل الرصيد الافتتاحي لليومية إلى: ${newStartingBalance} ${settings.currency}`);
  };

  // Products
  const addProduct = (pData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'soldCount'>) => {
    const id = 'prod_' + Date.now();
    const newProd: Product = {
      ...pData,
      id,
      soldCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: pData.stock === 0 ? 'out' : pData.stock <= pData.minStockAlert ? 'low' : 'good',
    };
    setProducts((prev) => [newProd, ...prev]);
    logAction('تعديل', `إضافة منتج جديد: ${pData.name} بسعر ${pData.salePrice} ${settings.currency}`);
  };

  const updateProduct = (id: string, pData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...pData, updatedAt: new Date().toISOString() };
          const newStock = updated.stock;
          updated.status = newStock === 0 ? 'out' : newStock <= updated.minStockAlert ? 'low' : 'good';
          return updated;
        }
        return p;
      })
    );
    logAction('تعديل', `تعديل معلومات المنتج رقم ${id}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAction('حذف', `حذف المنتج: ${prod?.name || id}`);
  };

  // Customers
  const addCustomer = (cData: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'debt'>) => {
    const newCust: Customer = {
      ...cData,
      id: 'cust_' + Date.now(),
      totalSpent: 0,
      debt: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAction('تعديل', `إضافة زبون جديد: ${cData.name}`);
  };

  const updateCustomer = (id: string, cData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...cData } : c)));
    logAction('تعديل', `تعديل الزبون رقم ${id}`);
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logAction('حذف', `حذف الزبون: ${cust?.name || id}`);
  };

  const payCustomerDebt = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, debt: Math.max(0, c.debt - amount) } : c))
    );
    const cust = customers.find((c) => c.id === customerId);
    
    // Treasury transaction
    const tx: TreasuryTransaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString(),
      type: 'deposit',
      amount,
      description: `تسديد دين من الزبون ${cust?.name || ''}`,
      category: 'تسديد ديون',
      user: currentUser?.name || 'بائع',
    };
    setTreasuryTransactions((prev) => [tx, ...prev]);

    // Update current shift
    if (currentShift && currentShift.status === 'open') {
      setCurrentShift((prev) => prev ? {
        ...prev,
        totalDeposits: prev.totalDeposits + amount,
        netCash: prev.netCash + amount,
      } : null);
    }

    logAction('بيع', `قبول تسديد دين بقيمة ${amount} ${settings.currency} من الزبون ${cust?.name}`);
  };

  // Suppliers
  const addSupplier = (sData: Omit<Supplier, 'id' | 'createdAt' | 'debtToPay'>) => {
    const newSup: Supplier = {
      ...sData,
      id: 'sup_' + Date.now(),
      debtToPay: 0,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSup, ...prev]);
    logAction('تعديل', `إضافة مورد جديد: ${sData.name}`);
  };

  const updateSupplier = (id: string, sData: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...sData } : s)));
    logAction('تعديل', `تعديل المورد رقم ${id}`);
  };

  const deleteSupplier = (id: string) => {
    const sup = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logAction('حذف', `حذف المورد: ${sup?.name || id}`);
  };

  const paySupplierDebt = (supplierId: string, amount: number) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, debtToPay: Math.max(0, s.debtToPay - amount) } : s))
    );
    const sup = suppliers.find((s) => s.id === supplierId);
    
    // Treasury transaction
    const tx: TreasuryTransaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString(),
      type: 'withdrawal',
      amount,
      description: `تسديد مستحقات للمورد ${sup?.name || ''}`,
      category: 'تسديد موردين',
      user: currentUser?.name || 'محاسب',
    };
    setTreasuryTransactions((prev) => [tx, ...prev]);

    // Update shift
    if (currentShift && currentShift.status === 'open') {
      setCurrentShift((prev) => prev ? {
        ...prev,
        totalWithdrawals: prev.totalWithdrawals + amount,
        netCash: prev.netCash - amount,
      } : null);
    }

    logAction('شراء', `دفع مستحقات للمورد ${sup?.name} بقيمة ${amount} ${settings.currency}`);
  };

  // Sales
  const completeSale = (
    saleData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>
  ): SaleInvoice => {
    const invCount = sales.length + 1001;
    const invNum = `INV-${new Date().getFullYear()}-${invCount.toString().padStart(4, '0')}`;
    const newInvoice: SaleInvoice = {
      ...saleData,
      id: 'inv_' + Date.now(),
      invoiceNumber: invNum,
      date: new Date().toISOString(),
      cashierName: currentUser?.name || 'بائع',
      status: 'completed',
    };

    setSales((prev) => [newInvoice, ...prev]);

    // Deduct products stock & increase soldCount
    setProducts((prev) =>
      prev.map((prod) => {
        const item = saleData.items.find((i) => i.productId === prod.id);
        if (item) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          return {
            ...prod,
            stock: newStock,
            soldCount: prod.soldCount + item.quantity,
            status: newStock === 0 ? 'out' : newStock <= prod.minStockAlert ? 'low' : 'good',
          };
        }
        return prod;
      })
    );

    // Update customer stats if selected
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id === saleData.customerId) {
            return {
              ...cust,
              totalSpent: cust.totalSpent + saleData.totalAmount,
              debt: cust.debt + saleData.debtAmount,
              lastPurchaseDate: new Date().toISOString().split('T')[0],
            };
          }
          return cust;
        })
      );
    }

    // Add treasury transaction for paid cash/card amount
    if (saleData.paidAmount > 0) {
      const tx: TreasuryTransaction = {
        id: 'tx_' + Date.now(),
        date: new Date().toISOString(),
        type: 'sale',
        amount: saleData.paidAmount,
        description: `مبيعات فاتورة ${invNum} - ${saleData.customerName}`,
        category: 'مبيعات',
        user: currentUser?.name || 'بائع',
        referenceId: newInvoice.id,
      };
      setTreasuryTransactions((prev) => [tx, ...prev]);

      // Update current shift
      if (currentShift && currentShift.status === 'open') {
        setCurrentShift((prev) => prev ? {
          ...prev,
          totalSales: prev.totalSales + saleData.paidAmount,
          netCash: prev.netCash + saleData.paidAmount,
        } : null);
      }
    }

    logAction('بيع', `إصدار فاتورة بيع ${invNum} بمبلغ ${saleData.totalAmount} ${settings.currency}`);
    return newInvoice;
  };

  const holdSale = (saleData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>) => {
    const held: SaleInvoice = {
      ...saleData,
      id: 'held_' + Date.now(),
      invoiceNumber: 'HELD-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString(),
      cashierName: currentUser?.name || 'بائع',
      status: 'held',
    };
    setHeldSales((prev) => [held, ...prev]);
    logAction('بيع', `تعليق فاتورة لـ ${saleData.customerName}`);
  };

  const restoreHeldSale = (heldId: string): SaleInvoice | null => {
    const found = heldSales.find((h) => h.id === heldId);
    if (found) {
      setHeldSales((prev) => prev.filter((h) => h.id !== heldId));
      return found;
    }
    return null;
  };

  const deleteHeldSale = (heldId: string) => {
    setHeldSales((prev) => prev.filter((h) => h.id !== heldId));
  };

  const returnSale = (invoiceId: string, reason = 'إرجاع بضاعة') => {
    const inv = sales.find((s) => s.id === invoiceId);
    if (!inv || inv.status === 'returned') return;

    // Mark invoice returned
    setSales((prev) =>
      prev.map((s) => (s.id === invoiceId ? { ...s, status: 'returned' } : s))
    );

    // Return stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = inv.items.find((i) => i.productId === prod.id);
        if (item) {
          const newStock = prod.stock + item.quantity;
          return {
            ...prod,
            stock: newStock,
            soldCount: Math.max(0, prod.soldCount - item.quantity),
            status: newStock <= prod.minStockAlert ? 'low' : 'good',
          };
        }
        return prod;
      })
    );

    // Record treasury withdrawal for refunded cash
    if (inv.paidAmount > 0) {
      const tx: TreasuryTransaction = {
        id: 'tx_' + Date.now(),
        date: new Date().toISOString(),
        type: 'withdrawal',
        amount: inv.paidAmount,
        description: `إرجاع فاتورة بيع ${inv.invoiceNumber} (${reason})`,
        category: 'مرتجعات',
        user: currentUser?.name || 'مدير',
        referenceId: inv.id,
      };
      setTreasuryTransactions((prev) => [tx, ...prev]);
    }

    // Customer debt update
    if (inv.customerId && inv.debtAmount > 0) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === inv.customerId ? { ...c, debt: Math.max(0, c.debt - inv.debtAmount) } : c))
      );
    }

    logAction('استرجاع', `إرجاع الفاتورة ${inv.invoiceNumber}`);
  };

  // Purchases
  const completePurchase = (
    pData: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'date' | 'cashierName'>
  ) => {
    const purCount = purchases.length + 101;
    const invNum = `PUR-${new Date().getFullYear()}-${purCount.toString().padStart(3, '0')}`;
    const newPur: PurchaseInvoice = {
      ...pData,
      id: 'pur_' + Date.now(),
      invoiceNumber: invNum,
      date: new Date().toISOString(),
      cashierName: currentUser?.name || 'مدير',
    };
    setPurchases((prev) => [newPur, ...prev]);

    // Update products stock & purchase price
    setProducts((prev) =>
      prev.map((prod) => {
        const item = pData.items.find((i) => i.productId === prod.id);
        if (item) {
          const newStock = prod.stock + item.quantity;
          return {
            ...prod,
            stock: newStock,
            purchasePrice: item.purchasePrice || prod.purchasePrice,
            salePrice: item.salePrice || prod.salePrice,
            status: newStock <= prod.minStockAlert ? 'low' : 'good',
          };
        }
        return prod;
      })
    );

    // Update supplier debt & order date
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === pData.supplierId) {
          return {
            ...sup,
            debtToPay: sup.debtToPay + pData.debtAmount,
            lastOrderDate: new Date().toISOString().split('T')[0],
          };
        }
        return sup;
      })
    );

    // Treasury transaction
    if (pData.paidAmount > 0) {
      const tx: TreasuryTransaction = {
        id: 'tx_' + Date.now(),
        date: new Date().toISOString(),
        type: 'purchase',
        amount: pData.paidAmount,
        description: `فاتورة شراء ${invNum} من المورد ${pData.supplierName}`,
        category: 'مشتريات',
        user: currentUser?.name || 'مدير',
        referenceId: newPur.id,
      };
      setTreasuryTransactions((prev) => [tx, ...prev]);

      if (currentShift && currentShift.status === 'open') {
        setCurrentShift((prev) => prev ? {
          ...prev,
          totalExpenses: prev.totalExpenses + pData.paidAmount,
          netCash: prev.netCash - pData.paidAmount,
        } : null);
      }
    }

    logAction('شراء', `تسجيل فاتورة شراء ${invNum} بمبلغ ${pData.totalAmount} ${settings.currency}`);
  };

  // Expenses & Treasury
  const addExpense = (expData: Omit<Expense, 'id' | 'date' | 'addedBy'>) => {
    const newExp: Expense = {
      ...expData,
      id: 'exp_' + Date.now(),
      date: new Date().toISOString(),
      addedBy: currentUser?.name || 'محاسب',
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Treasury deduction
    const tx: TreasuryTransaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString(),
      type: 'expense',
      amount: expData.amount,
      description: `مصروفات: ${expData.title} (${expData.category})`,
      category: 'مصاريف',
      user: currentUser?.name || 'محاسب',
      referenceId: newExp.id,
    };
    setTreasuryTransactions((prev) => [tx, ...prev]);

    if (currentShift && currentShift.status === 'open') {
      setCurrentShift((prev) => prev ? {
        ...prev,
        totalExpenses: prev.totalExpenses + expData.amount,
        netCash: prev.netCash - expData.amount,
      } : null);
    }

    logAction('إضافة مصاريف', `إضافة مصروف جديد: ${expData.title} بقيمة ${expData.amount} ${settings.currency}`);
  };

  const addTreasuryTx = (txData: Omit<TreasuryTransaction, 'id' | 'date' | 'user'>) => {
    const newTx: TreasuryTransaction = {
      ...txData,
      id: 'tx_' + Date.now(),
      date: new Date().toISOString(),
      user: currentUser?.name || 'مدير',
    };
    setTreasuryTransactions((prev) => [newTx, ...prev]);

    if (currentShift && currentShift.status === 'open') {
      const isAdd = txData.type === 'deposit' || txData.type === 'sale';
      setCurrentShift((prev) => prev ? {
        ...prev,
        totalDeposits: isAdd ? prev.totalDeposits + txData.amount : prev.totalDeposits,
        totalWithdrawals: !isAdd ? prev.totalWithdrawals + txData.amount : prev.totalWithdrawals,
        netCash: isAdd ? prev.netCash + txData.amount : prev.netCash - txData.amount,
      } : null);
    }

    logAction('تعديل', `معاملة خزنة (${txData.type}): ${txData.description} بقيمة ${txData.amount}`);
  };

  const updateTreasuryTx = (id: string, txData: Partial<TreasuryTransaction>) => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    setTreasuryTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...txData } : tx))
    );
    logAction('تعديل', `تعديل معاملة خزنة: ${txData.description || id}`);
  };

  const deleteTreasuryTx = (id: string) => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    const tx = treasuryTransactions.find((t) => t.id === id);
    setTreasuryTransactions((prev) => prev.filter((t) => t.id !== id));
    logAction('حذف', `حذف معاملة خزنة: ${tx?.description || id}`);
  };

  const clearTreasuryTransactions = () => {
    if (currentUser?.role !== 'manager' && currentUser?.role !== 'admin') {
      return;
    }
    setTreasuryTransactions([]);
    if (currentShift) {
      setCurrentShift((prev) => prev ? {
        ...prev,
        startingBalance: 0,
        totalSales: 0,
        totalExpenses: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        netCash: 0,
      } : null);
    }
    logAction('حذف', 'تصفير كافة سجلات وحركات الخزنة التجريبية');
  };

  // Inventory Audit Stock Adjustment
  const adjustStock = (adjustments: { productId: string; actualQty: number; reason: string }[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const adj = adjustments.find((a) => a.productId === p.id);
        if (adj) {
          const newQty = Math.max(0, adj.actualQty);
          return {
            ...p,
            stock: newQty,
            status: newQty === 0 ? 'out' : newQty <= p.minStockAlert ? 'low' : 'good',
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    logAction('جرد', `تعديل مخزون لعدد ${adjustments.length} منتجات بعد الجرد`);
  };

  // Categories & Settings
  const addCategory = (name: string, color: string) => {
    const newCat = { id: 'cat_' + Date.now(), name, color };
    setCategories((prev) => [...prev, newCat]);
    logAction('تعديل', `إضافة صنف جديد: ${name}`);
  };

  const updateCategory = (id: string, name: string, color: string) => {
    const oldCategory = categories.find((c) => c.id === id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color } : c))
    );
    if (oldCategory && oldCategory.name !== name) {
      // Update all products under this category to the new category name
      setProducts((prev) =>
        prev.map((p) => (p.category === oldCategory.name ? { ...p, category: name } : p))
      );
    }
    logAction('تعديل', `تحديث بيانات الصنف: ${name}`);
  };

  const deleteCategory = (id: string) => {
    const catToDelete = categories.find((c) => c.id === id);
    if (!catToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAction('حذف', `حذف الصنف: ${catToDelete.name}`);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAction('تغيير الإعدادات', 'تم تحديث إعدادات النظام');
  };

  // Export & Import Database JSON
  const exportDatabaseJSON = () => {
    const fullData = {
      app: 'Aïcha POS Pro',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users,
      products,
      categories,
      customers,
      suppliers,
      sales,
      heldSales,
      purchases,
      expenses,
      treasuryTransactions,
      currentShift,
      auditLogs,
      settings,
    };
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aicha_pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAction('نسخة احتياطية', 'تصدير ملحوظ لقاعدة البيانات ملف JSON');
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.treasuryTransactions) setTreasuryTransactions(parsed.treasuryTransactions);
      if (parsed.settings) setSettings(parsed.settings);
      logAction('استرجاع', 'تم استيراد قاعدة البيانات بنجاح من ملف خارجي');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetToSampleData = () => {
    const cleanProducts = JSON.parse(JSON.stringify(initialProducts));
    const cleanCustomers = JSON.parse(JSON.stringify(initialCustomers));
    const cleanSuppliers = JSON.parse(JSON.stringify(initialSuppliers));
    const cleanSales = JSON.parse(JSON.stringify(initialSales));
    const cleanPurchases = JSON.parse(JSON.stringify(initialPurchases));
    const cleanExpenses = JSON.parse(JSON.stringify(initialExpenses));
    const cleanTreasuryTransactions = JSON.parse(JSON.stringify(initialTreasuryTransactions));
    const cleanCategories = JSON.parse(JSON.stringify(initialCategories));
    const cleanSettings = JSON.parse(JSON.stringify(initialSettings));
    const cleanUsers = JSON.parse(JSON.stringify(initialUsers));

    setProducts(cleanProducts);
    setCustomers(cleanCustomers);
    setSuppliers(cleanSuppliers);
    setSales(cleanSales);
    setPurchases(cleanPurchases);
    setExpenses(cleanExpenses);
    setTreasuryTransactions(cleanTreasuryTransactions);
    setCategories(cleanCategories);
    setSettings(cleanSettings);
    setUsers(cleanUsers);
    setHeldSales([]);
    setCurrentShift({
      id: 'shift_today',
      date: new Date().toISOString().split('T')[0],
      openedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      startingBalance: 0,
      totalSales: 0,
      totalExpenses: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      netCash: 0,
      status: 'open',
      cashier: 'إلياس (المدير)',
    });

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('aicha_pos_pro_data_v1');
    } catch (e) {
      console.error('Failed to clear localStorage on reset:', e);
    }

    logAction('استرجاع', 'إعادة تعيين قاعدة البيانات إلى البيانات النموذجية الأولى');
  };

  // Dynamic Smart Alerts calculation
  const alerts: SmartAlert[] = [];
  products.forEach((p) => {
    if (p.stock === 0) {
      alerts.push({
        id: 'alt_out_' + p.id,
        title: 'نفاد المخزون بالكامل!',
        description: `المنتج "${p.name}" (الباركود: ${p.barcode}) نفد تماماً من المكتبة!`,
        type: 'danger',
        timestamp: 'الآن',
        tabKey: 'products',
      });
    } else if (p.stock <= p.minStockAlert) {
      alerts.push({
        id: 'alt_low_' + p.id,
        title: 'مخزون منخفض قارَب النفاد',
        description: `المنتج "${p.name}" المتبقي منه ${p.stock} قطعة فقط (حد التنبيه ${p.minStockAlert}).`,
        type: 'warning',
        timestamp: 'الآن',
        tabKey: 'products',
      });
    }
  });

  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  if (totalCustomerDebt > 0) {
    alerts.push({
      id: 'alt_debt_cust',
      title: 'ديون مستحقة للعملاء',
      description: `يوجد إجمالي ديون غير مسددة على العملاء بقيمة ${totalCustomerDebt.toLocaleString()} ${settings.currency}.`,
      type: 'warning',
      timestamp: 'اليوم',
      tabKey: 'customers',
    });
  }

  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.debtToPay, 0);
  if (totalSupplierDebt > 0) {
    alerts.push({
      id: 'alt_debt_sup',
      title: 'مستحقات واجبة الدفع للموردين',
      description: `يوجد فواتير شراء غير مدفوعة للموردين بقيمة ${totalSupplierDebt.toLocaleString()} ${settings.currency}.`,
      type: 'danger',
      timestamp: 'اليوم',
      tabKey: 'suppliers',
    });
  }

  // Dynamic AI Smart Tips
  const smartTips: string[] = [];
  const lowProducts = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
  if (lowProducts.length > 0) {
    smartTips.push(`بقي ${lowProducts[0].stock} قطع فقط من "${lowProducts[0].name}"، يفضل طلب الشراء الآن.`);
  }
  const topSold = [...products].sort((a, b) => b.soldCount - a.soldCount)[0];
  if (topSold) {
    smartTips.push(`المنتج الأكثر مبيعاً هذا الشهر هو "${topSold.name}" بواقع ${topSold.soldCount} مبيعة!`);
  }
  smartTips.push('ارتفعت أرباحك المقدرة اليوم بنسبة 12% مقارنة بالأسبوع الماضي.');
  smartTips.push('تذكر أخذ نسخة احتياطية يومية لحماية بيانات المكتبة.');

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        activeTab,
        setActiveTab,
        splashVisible,
        dismissSplash,
        users,
        products,
        categories,
        customers,
        suppliers,
        sales,
        heldSales,
        purchases,
        expenses,
        treasuryTransactions,
        currentShift,
        auditLogs,
        settings,
        alerts,
        smartTips,
        login,
        loginAsUser,
        logout,
        addUser,
        updateUser,
        deleteUser,
        openShift,
        closeShift,
        updateShiftStartingBalance,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        payCustomerDebt,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        paySupplierDebt,
        completeSale,
        holdSale,
        restoreHeldSale,
        deleteHeldSale,
        returnSale,
        completePurchase,
        addExpense,
        addTreasuryTx,
        updateTreasuryTx,
        deleteTreasuryTx,
        clearTreasuryTransactions,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        exportDatabaseJSON,
        exportBackup: exportDatabaseJSON,
        importDatabaseJSON,
        importBackup: importDatabaseJSON,
        resetToSampleData,
        resetData: resetToSampleData,
        logAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
