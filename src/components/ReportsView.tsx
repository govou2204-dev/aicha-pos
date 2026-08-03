import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, Calendar, TrendingUp, ShoppingCart, ShoppingBag, Receipt, Vault, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { sales, purchases, expenses, products, customers, suppliers, settings } = useApp();
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  // Filter sales and expenses based on range
  const filteredSales = sales.filter((s) => {
    if (s.status !== 'completed') return false;
    if (reportRange === 'all') return true;
    if (!s.date) return true;
    if (reportRange === 'daily') return s.date.startsWith(todayStr);
    if (reportRange === 'monthly') return s.date.startsWith(currentMonthStr);
    if (reportRange === 'yearly') return s.date.startsWith(currentYearStr);
    if (reportRange === 'weekly') {
      const sDate = new Date(s.date);
      const diffDays = (now.getTime() - sDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (reportRange === 'all') return true;
    if (!e.date) return true;
    if (reportRange === 'daily') return e.date.startsWith(todayStr);
    if (reportRange === 'monthly') return e.date.startsWith(currentMonthStr);
    if (reportRange === 'yearly') return e.date.startsWith(currentYearStr);
    if (reportRange === 'weekly') {
      const eDate = new Date(e.date);
      const diffDays = (now.getTime() - eDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  });

  const totalSalesVal = filteredSales.reduce((s, item) => s + (item.totalAmount || 0), 0);
  const totalCostVal = filteredSales.reduce((s, item) => {
    return s + (item.items || []).reduce((iSum, i) => iSum + (i.purchasePrice || 0) * (i.quantity || 0), 0);
  }, 0);
  const totalExpensesVal = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfitVal = totalSalesVal - totalCostVal - totalExpensesVal;

  // Export to Excel helper using `xlsx`
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sales sheet
    const salesData = sales.map((s) => ({
      'رقم الفاتورة': s.invoiceNumber,
      'التاريخ': new Date(s.date).toLocaleString('ar-DZ'),
      'الزبون': s.customerName,
      'الإجمالي': s.totalAmount,
      'المدفوع': s.paidAmount,
      'الدين': s.debtAmount,
      'البائع': s.cashierName,
      'الحالة': s.status,
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, 'المبيعات');

    // Inventory sheet
    const inventoryData = products.map((p) => ({
      'اسم المنتج': p.name,
      'الباركود': p.barcode,
      'الصنف': p.category,
      'سعر الشراء': p.purchasePrice,
      'سعر البيع': p.salePrice,
      'المخزون الحالي': p.stock,
      'المبيعات التراكمية': p.soldCount,
    }));
    const wsInv = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, wsInv, 'المخزون والجرد');

    XLSX.writeFile(wb, `aicha_pos_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <span>مركز التقارير الشاملة والأرباح</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ملخص القوائم المالية، المبيعات، المصاريف، والأرباح مع إمكانية التصدير Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Range Filter Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 whitespace-nowrap">
          نطاق التقرير والنتائج:
        </span>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'daily', label: 'اليوم' },
            { id: 'weekly', label: 'هذا الأسبوع' },
            { id: 'monthly', label: 'هذا الشهر (التقرير الشهري)' },
            { id: 'yearly', label: 'هذه السنة' },
            { id: 'all', label: 'الكلي التراكمي' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setReportRange(r.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                reportRange === r.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي مبيعات الفترة</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalSalesVal.toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">تكلفة البضاعة المباعة</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalCostVal.toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي المصاريف العامة</span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {totalExpensesVal.toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl shadow-lg">
          <span className="text-xs font-semibold opacity-90 block mb-1">صافي الأرباح الحقيقية</span>
          <p className="text-2xl font-black">
            {netProfitVal.toLocaleString()} <span className="text-sm font-normal">{settings.currency}</span>
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b">
          تفاصيل المبيعات المسجلة
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الزبون</th>
                <th className="p-3">الأصناف</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">طريقة الدفع</th>
                <th className="p-3">البائع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((s) => (
                <tr key={s.id}>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">{s.invoiceNumber}</td>
                  <td className="p-3 text-slate-500 font-mono">{new Date(s.date).toLocaleDateString('ar-DZ')}</td>
                  <td className="p-3 font-semibold">{s.customerName}</td>
                  <td className="p-3 text-slate-500">{s.items.length} بنود</td>
                  <td className="p-3 font-black text-emerald-600">{s.totalAmount} {settings.currency}</td>
                  <td className="p-3 text-slate-400">{s.paymentMethod === 'cash' ? 'نقداً' : s.paymentMethod === 'card' ? 'بطاقة' : 'دَين'}</td>
                  <td className="p-3 text-slate-400">{s.cashierName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
