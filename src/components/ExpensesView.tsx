import React, { useState } from 'react';
import { Receipt, Plus, Zap, Droplet, Truck, UserCheck, MoreHorizontal, Calendar, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, settings } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'كهرباء' | 'ماء' | 'نقل' | 'أجور' | 'متفرقات'>('كهرباء');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    addExpense({ title, category, amount, notes });
    setShowModal(false);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'كهرباء':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'ماء':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'نقل':
        return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'أجور':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-500" />
            <span>تسجيل وتتبع المصاريف التشغيلية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إجمالي المصاريف المسجلة:{' '}
            <span className="font-black text-rose-600">
              {totalExpenses.toLocaleString()} {settings.currency}
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مصروف جديد</span>
        </button>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">البيان / عنوان المصروف</th>
                <th className="p-3.5">الصنف</th>
                <th className="p-3.5">المبلغ</th>
                <th className="p-3.5">التاريخ والوقت</th>
                <th className="p-3.5">المسجل</th>
                <th className="p-3.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{exp.title}</td>
                  <td className="p-3.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(exp.category)}
                      <span>{exp.category}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-rose-600 dark:text-rose-400">
                    {exp.amount.toLocaleString()} {settings.currency}
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">
                    {new Date(exp.date).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="p-3.5 text-slate-500">{exp.addedBy}</td>
                  <td className="p-3.5 text-slate-400 text-[11px]">{exp.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
              تسجيل مصروف جديد من الخزنة
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المصروف *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فاتورة الكهرباء والغاز"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع المصروف
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                >
                  <option value="كهرباء">⚡ كهرباء وغاز</option>
                  <option value="ماء">💧 ماء ونظافة</option>
                  <option value="نقل">🚚 نقل وتوصيل بضاعة</option>
                  <option value="أجور">👷 أجور ومكافآت العمال</option>
                  <option value="متفرقات">📦 متفرقات وتشغيل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ ({settings.currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-black dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات تفصيلية..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-md"
                >
                  خصم واعتماد المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
