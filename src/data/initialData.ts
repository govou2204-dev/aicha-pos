import { Product, Customer, Supplier, SaleInvoice, PurchaseInvoice, TreasuryTransaction, Expense, AppSettings, AppUser } from '../types';

export const initialUsers: AppUser[] = [
  {
    id: 'usr_1',
    name: 'إلياس (المدير)',
    username: 'elyes',
    password: '123',
    role: 'manager',
    phone: '+216 55 123 456',
    active: true,
  },
];

export const initialSettings: AppSettings = {
  libraryName: 'مكتبة عائشة الرديف',
  ownerName: 'إلياس',
  phone: '+216 76 240 000',
  address: 'الرديف - ولاية قفصة، تونس',
  email: 'aicha.redeyef@gmail.com',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><path id="arc" d="M 30,170 A 120,120 0 1,1 270,170" fill="none"/><path d="M60 215 L240 215 L230 238 L50 238 Z" fill="%232563eb"/><rect x="60" y="200" width="180" height="16" rx="4" fill="%233b82f6"/><rect x="75" y="205" width="145" height="2" fill="%23bfdbfe"/><rect x="75" y="209" width="145" height="2" fill="%23bfdbfe"/><rect x="75" y="178" width="150" height="18" rx="4" fill="%23f43f5e"/><rect x="85" y="183" width="125" height="2" fill="%23fecdd3"/><rect x="70" y="156" width="155" height="18" rx="4" fill="%231e293b"/><rect x="80" y="161" width="130" height="2" fill="%2394a3b8"/><path d="M 90,150 Q 150,128 150,100 Q 150,128 210,150 Q 150,138 90,150 Z" fill="%2310b981"/><path d="M 95,146 Q 150,126 150,105 L 150,136 Q 150,132 95,146 Z" fill="%23f0fdf4"/><path d="M 205,146 Q 150,126 150,105 L 150,136 Q 150,132 205,146 Z" fill="%23dcfce7"/><text font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="%230f172a" letter-spacing="2"><textPath href="%23arc" startOffset="50%" text-anchor="middle">LIBRAIRIE AICHA REDEYEF</textPath></text></svg>',
  currency: 'د.ت',
  receiptHeader: 'أهلاً بكم في مكتبة عائشة الرديف - أدوات مدرسية ومكتبية وقرطاسية',
  receiptFooter: 'شكراً لزيارتكم مكتبة عائشة الرديف! مرحباً بكم دائماً 📚✨',
  taxRate: 0,
  thermalPrinterWidth: '80mm',
  autoBackupEnabled: true,
  themeMode: 'light',
  allowNegativeStock: false,
  developerName: 'Elyes',
  version: '1.0',
  releaseDate: '20 أوت 2026',
};

export const initialCategories = [
  { id: 'cat_1', name: 'كراريس ودفاتر', color: 'bg-emerald-500' },
  { id: 'cat_2', name: 'أقلام وأدوات كتابية', color: 'bg-blue-500' },
  { id: 'cat_3', name: 'أوراق ولوازم مكتبية', color: 'bg-indigo-500' },
  { id: 'cat_4', name: 'أدوات هندسية ورسم', color: 'bg-purple-500' },
  { id: 'cat_5', name: 'كتب وروايات', color: 'bg-amber-500' },
  { id: 'cat_6', name: 'محافظ وحقائب', color: 'bg-rose-500' },
  { id: 'cat_7', name: 'هدايا وأدوات مدرسية', color: 'bg-teal-500' },
];

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [];

export const initialSuppliers: Supplier[] = [];

export const initialSales: SaleInvoice[] = [];

export const initialPurchases: PurchaseInvoice[] = [];

export const initialExpenses: Expense[] = [];

export const initialTreasuryTransactions: TreasuryTransaction[] = [];
