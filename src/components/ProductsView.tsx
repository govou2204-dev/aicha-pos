import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Barcode,
  QrCode,
  AlertTriangle,
  History,
  Tag,
  Tags,
  Truck,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    suppliers,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    sales,
    purchases,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('الكل');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyProd, setHistoryProd] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | string>(0);
  const [salePrice, setSalePrice] = useState<number | string>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat === 'الكل' || p.category === selectedCat;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low'
        ? p.stock > 0 && p.stock <= p.minStockAlert
        : p.stock === 0;
    return matchCat && matchSearch && matchStock;
  });

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setBarcode(Math.floor(6130000000 + Math.random() * 999999).toString());
    setCategory(categories[0]?.name || 'كراريس ودفاتر');
    setBrand('');
    setSupplierId(suppliers[0]?.id || '');
    setPurchasePrice(0);
    setSalePrice(0);
    setStock(50);
    setMinStockAlert(10);
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setBarcode(p.barcode);
    setCategory(p.category);
    setBrand(p.brand);
    setSupplierId(p.supplierId || '');
    setPurchasePrice(p.purchasePrice);
    setSalePrice(p.salePrice);
    setStock(p.stock);
    setMinStockAlert(p.minStockAlert);
    setImageUrl(p.image || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sup = suppliers.find((s) => s.id === supplierId);
    const parsedPurchasePrice = typeof purchasePrice === 'number' ? purchasePrice : parseFloat(purchasePrice) || 0;
    const parsedSalePrice = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice) || 0;

    if (editingId) {
      updateProduct(editingId, {
        name,
        barcode,
        category,
        brand,
        supplierId,
        supplierName: sup?.name,
        purchasePrice: parsedPurchasePrice,
        salePrice: parsedSalePrice,
        stock,
        minStockAlert,
        image: imageUrl,
      });
    } else {
      addProduct({
        name,
        barcode,
        category,
        brand,
        supplierId,
        supplierName: sup?.name,
        purchasePrice: parsedPurchasePrice,
        salePrice: parsedSalePrice,
        stock,
        minStockAlert,
        image: imageUrl,
      });
    }

    setShowModal(false);
  };

  // Profit Margin calculation %
  const calcProfitMargin = () => {
    const pPrice = typeof purchasePrice === 'number' ? purchasePrice : parseFloat(purchasePrice) || 0;
    const sPrice = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice) || 0;
    if (pPrice <= 0 || sPrice <= 0) return 0;
    return Math.round(((sPrice - pPrice) / pPrice) * 100);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            <span>إدارة منتجات المكتبة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إجمالي المنتجات: {products.length} صنف | المخزون الكلي:{' '}
            {products.reduce((s, p) => s + p.stock, 0)} قطعة
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Tags className="w-4 h-4 text-indigo-500" />
            <span>إدارة الأصناف</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-indigo-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الباركود، الصنف، الماركة..."
              className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          {/* Stock state pills */}
          <div className="flex items-center gap-1.5 self-stretch shrink-0">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                stockFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              الكل ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                stockFilter === 'low'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
              }`}
            >
              منخفض ({products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                stockFilter === 'out'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
              }`}
            >
              نفد ({products.filter((p) => p.stock === 0).length})
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['الكل', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">اسم المنتج</th>
                <th className="p-3.5">الباركود</th>
                <th className="p-3.5">الصنف والماركة</th>
                <th className="p-3.5">سعر الشراء</th>
                <th className="p-3.5">سعر البيع</th>
                <th className="p-3.5">هامش الربح</th>
                <th className="p-3.5">المخزون الحالي</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const margin = Math.round(
                  ((p.salePrice - p.purchasePrice) / (p.purchasePrice || 1)) * 100
                );
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {p.barcode}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold block">{p.category}</span>
                      <span className="text-[10px] text-slate-400">{p.brand || 'غير محدد'}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {p.purchasePrice} {settings.currency}
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                      {p.salePrice} {settings.currency}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-md">
                        +{margin}%
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-slate-900 dark:text-white">
                      {p.stock} قطعة
                    </td>
                    <td className="p-3.5">
                      {p.stock === 0 ? (
                        <span className="px-2.5 py-1 bg-rose-500 text-white font-extrabold rounded-xl text-[10px]">
                          نفد
                        </span>
                      ) : p.stock <= p.minStockAlert ? (
                        <span className="px-2.5 py-1 bg-amber-500 text-white font-extrabold rounded-xl text-[10px]">
                          منخفض
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white font-extrabold rounded-xl text-[10px]">
                          ممتاز
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setHistoryProd(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="سجل الحركة"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-2 sm:p-6 flex items-start sm:items-center justify-center overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-right my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                {editingId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمكتبة'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl transition-colors"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: كراس 96 صفحة خط عريض"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الباركود (Barcode) *
                  </label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="مثال: 6131001001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tracking-wider font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الصنف
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الماركة / الشركة المصنعة
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="مثال: Pilot, Maped, BIC"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    المورد الرئيسي
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">بدون مورد محدد</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    سعر الشراء ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={purchasePrice === '' ? '' : purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    سعر البيع ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={salePrice === '' ? '' : salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الكمية المتاحة في المخزون
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock || ''}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    حد تنبيه نقص المخزون
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStockAlert || ''}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 10)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Profit calculation badge */}
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20 rounded-2xl flex items-center justify-between mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  هامش الربح المتوقع للقطعة الواحدة:
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {((typeof salePrice === 'number' ? salePrice : parseFloat(salePrice) || 0) - (typeof purchasePrice === 'number' ? purchasePrice : parseFloat(purchasePrice) || 0)).toFixed(2)} {settings.currency} (+{calcProfitMargin()}%)
                </span>
              </div>
            </form>

            {/* Footer */}
            <div className="flex-none p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/60 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = (e.currentTarget.closest('.relative')?.querySelector('form'));
                  if (form) form.requestSubmit();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-500/25 transition-all transform active:scale-[0.98]"
              >
                حفظ البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Movement Audit Modal */}
      {historyProd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                سجل حركة المنتج: {historyProd.name}
              </h3>
              <button
                onClick={() => setHistoryProd(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                <p className="font-bold text-indigo-700 dark:text-indigo-400">
                  إجمالي المبيعات التراكمية: {historyProd.soldCount} قطعة
                </p>
                <p className="text-[10px] text-slate-500">المخزون الحالي المتوفر: {historyProd.stock} قطعة</p>
              </div>
              <p className="text-[11px] text-slate-400 py-2">
                يتم تسجيل جميع حركات البيع والشراء أوتوماتيكياً وتحديث المستودع عند كل فاتورة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Custom Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white">تأكيد حذف المنتج</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">عملية الحذف نهائية ولا يمكن التراجع عنها</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{productToDelete.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <span>الباركود: <strong className="font-mono text-slate-700 dark:text-slate-300">{productToDelete.barcode}</strong></span>
                <span>•</span>
                <span>المخزون: <strong>{productToDelete.stock} قطعة</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/30 transition-all transform active:scale-[0.98]"
              >
                حذف المنتج نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
