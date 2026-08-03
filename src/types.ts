export type UserRole = 'manager' | 'cashier' | 'accountant';

export interface AppUser {
  id: string;
  name: string;
  fullName?: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  active: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  barcode: string;
  qrCode?: string;
  name: string;
  category: string;
  brand: string;
  supplierId?: string;
  supplierName?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStockAlert: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  soldCount: number;
  status?: 'good' | 'low' | 'out' | 'stagnant' | 'new';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  debt: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  debtToPay: number;
  lastOrderDate?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  barcode: string;
  name: string;
  purchasePrice: number;
  unitPrice: number;
  quantity: number;
  discount: number; // percentage or fixed
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'debt';

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'held' | 'returned';
  cashierName: string;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  cashierName: string;
  notes?: string;
}

export type TreasuryTxType = 'deposit' | 'withdrawal' | 'sale' | 'purchase' | 'expense' | 'transfer';

export interface TreasuryTransaction {
  id: string;
  date: string;
  type: TreasuryTxType;
  amount: number;
  description: string;
  category: string;
  user: string;
  referenceId?: string;
}

export interface DailyShift {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  startingBalance: number;
  endingBalance?: number;
  totalSales: number;
  totalExpenses: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netCash: number;
  status: 'open' | 'closed';
  cashier: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'كهرباء' | 'ماء' | 'نقل' | 'أجور' | 'متفرقات';
  amount: number;
  date: string;
  notes?: string;
  addedBy: string;
}

export interface InventoryAuditItem {
  productId: string;
  productName: string;
  barcode: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  unitCost: number;
  totalValueDiff: number;
  reason?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  user: string;
  role: UserRole;
  action: 'تسجيل الدخول' | 'تسجيل الخروج' | 'بيع' | 'شراء' | 'تعديل' | 'حذف' | 'نسخة احتياطية' | 'استرجاع' | 'تغيير الإعدادات' | 'جرد' | 'إضافة مصاريف';
  details: string;
}

export interface AppSettings {
  libraryName: string;
  ownerName: string;
  phone: string;
  address: string;
  email?: string;
  logoUrl?: string;
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  taxRate: number;
  thermalPrinterWidth: '80mm' | '58mm' | 'A4';
  autoBackupEnabled: boolean;
  themeMode: 'light' | 'dark';
  allowNegativeStock: boolean;
  developerName: string;
  version: string;
  releaseDate: string;
}

export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
  tabKey?: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'customers'
  | 'suppliers'
  | 'purchases'
  | 'treasury'
  | 'expenses'
  | 'reports'
  | 'analytics'
  | 'inventory'
  | 'alerts'
  | 'backup'
  | 'settings'
  | 'audit'
  | 'about';
