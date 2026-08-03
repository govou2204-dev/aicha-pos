import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle, Truck, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem } from '../types';

export const PurchasesView: React.FC = () => {
  const { suppliers, products, completePurchase, purchases, settings } = useApp();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [buyPrice, setBuyPrice] = useState<number | string>(0);
  const [sellPrice, setSellPrice] = useState<number | string>(0);
  const [qty, setQty] = useState<number>(10);
  const [paidInput, setPaidInput] = useState<string>('');

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;
    const existing = items.find((i) => i.productId === prod.id);
    if (existing) {
      alert('تم إضافة هذا المنتج بالفعل في القائمة.');
      return;
    }
    const bPrice = buyPrice !== '' ? (typeof buyPrice === 'number' ? buyPrice : parseFloat(buyPrice) || 0) : prod.purchasePrice;
    const sPrice = sellPrice !== '' ? (typeof sellPrice === 'number' ? sellPrice : parseFloat(sellPrice) || 0) : prod.salePrice;
    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        name: prod.name,
        purchasePrice: bPrice,
        salePrice: sPrice,
        quantity: qty,
        total: bPrice * qty,
      },
    ]);
    setSelectedProdId('');
  };

  const removeItem = (prodId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== prodId));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);
  const paidAmount = paidInput ? parseFloat(paidInput) : totalAmount;
  const debtAmount = Math.max(0, totalAmount - paidAmount);

  const handleCheckoutPurchase = () => {
    if (items.length === 0) return;
    const sup = suppliers.find((s) => s.id === supplierId);
    completePurchase({
      supplierId,
      supplierName: sup ? sup.name : 'مورد غير محدد',
      items,
      totalAmount,
      paidAmount,
      debtAmount,
    });

    alert('تم تسجيل فاتورة الشراء وتحديث المخزون بنجاح!');
    setItems([]);
    setPaidInput('');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            <span>تسجيل فاتورة شراء بضاعة وتوريد</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            يتم رفع الكميات وتعديل أسعار الشراء في المستودع فور الاعتماد
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Purchase Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            بيانات الفاتورة والتوريد
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اختر المورد *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.company})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">إضافة بند شراء:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="sm:col-span-2">
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      setBuyPrice(prod.purchasePrice);
                      setSellPrice(prod.salePrice);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                >
                  <option value="">اختر المنتج لشراؤه...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (مخزون حالي: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">سعر الشراء الجديد:</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={buyPrice === '' ? '' : buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">الكمية المشترات:</label>
                <input
                  type="number"
                  min="1"
                  value={qty || ''}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              disabled={!selectedProdId}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة البند الفاتورة</span>
            </button>
          </div>
        </div>

        {/* Purchase Items & Confirmation */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>بنود الفاتورة ({items.length})</span>
              <span className="text-xs font-black text-emerald-600">
                {totalAmount.toLocaleString()} {settings.currency}
              </span>
            </h3>

            <div className="mt-3 max-h-56 overflow-y-auto space-y-2 text-xs">
              {items.length === 0 ? (
                <p className="text-center text-slate-400 py-10">لم تقم بإضافة بنود الفاتورة بعد</p>
              ) : (
                items.map((i) => (
                  <div
                    key={i.productId}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100">{i.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        الكمية: {i.quantity} × {i.purchasePrice} {settings.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {i.total} {settings.currency}
                      </span>
                      <button
                        onClick={() => removeItem(i.productId)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                المبلغ المدفوع للمورد نقداً الآن:
              </label>
              <input
                type="number"
                min="0"
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value)}
                placeholder={`الكامل: ${totalAmount}`}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-xs"
              />
            </div>

            <button
              onClick={handleCheckoutPurchase}
              disabled={items.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>اعتماد الفاتورة وتوريد المخزون</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
