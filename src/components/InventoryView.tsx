import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InventoryView: React.FC = () => {
  const { products, adjustStock, settings } = useApp();
  const [actualQtyMap, setActualQtyMap] = useState<{ [productId: string]: number }>(() => {
    const map: { [key: string]: number } = {};
    products.forEach((p) => {
      map[p.id] = p.stock;
    });
    return map;
  });

  const handleApplyAdjustment = () => {
    const adjustments = products.map((p) => {
      const actual = actualQtyMap[p.id] ?? p.stock;
      return {
        productId: p.id,
        actualQty: actual,
        reason: 'تعديل الكميات بموجب جرد المخزون الدوري',
      };
    });

    adjustStock(adjustments);
    alert('تم مطابقة المخزون وتعديل جميع الكميات بالسستم بنجاح!');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-teal-500" />
            <span>نظام الجرد الدوري ومطابقة المستودع</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            مقارنة الكميات المسجلة بالسستم مع الكميات الفعلية وتصحيح الفوارق
          </p>
        </div>

        <button
          onClick={handleApplyAdjustment}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>اعتماد الجرد وتحديث المخزون</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">اسم المنتج</th>
                <th className="p-3.5">الباركود</th>
                <th className="p-3.5">كمية النظام الحالية</th>
                <th className="p-3.5">الكمية الفعلية بالمحل</th>
                <th className="p-3.5">الفارق (عجز / زيادة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => {
                const actual = actualQtyMap[p.id] ?? p.stock;
                const diff = actual - p.stock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{p.name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{p.barcode}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{p.stock} قطعة</td>
                    <td className="p-3.5">
                      <input
                        type="number"
                        min="0"
                        value={actual}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setActualQtyMap((prev) => ({ ...prev, [p.id]: val }));
                        }}
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-xs"
                      />
                    </td>
                    <td className="p-3.5">
                      {diff === 0 ? (
                        <span className="text-emerald-600 font-bold">مطابق (0)</span>
                      ) : diff > 0 ? (
                        <span className="text-blue-600 font-bold">زائد (+{diff})</span>
                      ) : (
                        <span className="text-rose-600 font-extrabold">عجز ({diff})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
