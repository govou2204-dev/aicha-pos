import React, { useState } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Phone, Mail, Building, DollarSign, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, paySupplierDebt, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [payModalSupplier, setPayModalSupplier] = useState<Supplier | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  const openAdd = () => {
    setEditingSupplier(null);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setShowAddModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setCompany(s.company);
    setPhone(s.phone);
    setEmail(s.email || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, { name, company, phone, email });
    } else {
      addSupplier({ name, company, phone, email });
    }
    setShowAddModal(false);
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmountInput);
    if (payModalSupplier && amt > 0) {
      paySupplierDebt(payModalSupplier.id, amt);
      setPayModalSupplier(null);
      setPayAmountInput('');
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" />
            <span>إدارة الموردين ومستحقات الشراء</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إجمالي الفواتير واجبة الدفع للموردين:{' '}
            <span className="font-extrabold text-rose-600">
              {suppliers.reduce((sum, s) => sum + s.debtToPay, 0).toLocaleString()} {settings.currency}
            </span>
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المورد، الشركة، أو الهاتف..."
            className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Building className="w-3 h-3 text-sky-500" />
                    <span>{s.company}</span>
                  </div>
                </div>
                {s.debtToPay > 0 ? (
                  <span className="px-2.5 py-1 bg-rose-500 text-white font-extrabold rounded-xl text-[10px]">
                    مستحقات غير مدفوعة
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl text-[10px]">
                    خالي المستحقات
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{s.phone}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 block">المبلغ المستحق الدفع للمورد</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                  {s.debtToPay.toLocaleString()} {settings.currency}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {s.debtToPay > 0 && (
                <button
                  onClick={() => {
                    setPayModalSupplier(s);
                    setPayAmountInput(s.debtToPay.toString());
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>دفع مستحقات</span>
                </button>
              )}
              <div className="flex items-center gap-1 mr-auto">
                <button
                  onClick={() => openEdit(s)}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingSupplier(s)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المورد *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد للتوزيع والورق"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الشركة / المؤسسة *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="مؤسسة الجزائر للطباعة"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="021 44 55 66"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Debt Modal */}
      {payModalSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              دفع مستحقات للمورد: {payModalSupplier.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              إجمالي المستحقات الواجب دفعها: {payModalSupplier.debtToPay} {settings.currency}
            </p>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المسدد للمورد ({settings.currency}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={payModalSupplier.debtToPay}
                  required
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-sm text-sky-600 dark:text-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalSupplier(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white font-bold rounded-xl shadow-md"
                >
                  تأكيد خصم المبلغ والدفع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Supplier Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl text-right space-y-4">
            <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">
              تأكيد حذف المورد
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              هل أنت متأكد من حذف المورد <span className="font-extrabold text-slate-900 dark:text-white underline">{deletingSupplier.name}</span>؟
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSupplier(deletingSupplier.id);
                  setDeletingSupplier(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
