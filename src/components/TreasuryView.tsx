import React, { useState } from 'react';
import { Vault, Plus, Minus, Pencil, Trash2, X, Save, Lock, Unlock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TreasuryTransaction, TreasuryTxType } from '../types';

export const TreasuryView: React.FC = () => {
  const { treasuryTransactions, currentShift, openShift, closeShift, updateShiftStartingBalance, addTreasuryTx, updateTreasuryTx, deleteTreasuryTx, clearTreasuryTransactions, users, currentUser, settings } = useApp();
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const [openShiftAmount, setOpenShiftAmount] = useState<string>('0');
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  const [editShiftBalanceInput, setEditShiftBalanceInput] = useState<number>(0);

  // Close shift state
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [handoverCashInput, setHandoverCashInput] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Edit / Delete State (Manager / Admin Only)
  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const [editingTx, setEditingTx] = useState<TreasuryTransaction | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>('');
  const [editType, setEditType] = useState<TreasuryTxType>('deposit');
  const [editCategory, setEditCategory] = useState<string>('');

  const [deletingTx, setDeletingTx] = useState<TreasuryTransaction | null>(null);

  const currentBalance = treasuryTransactions.reduce((bal, tx) => {
    if (tx.type === 'deposit' || tx.type === 'sale') return bal + tx.amount;
    if (tx.type === 'withdrawal' || tx.type === 'purchase' || tx.type === 'expense') return bal - tx.amount;
    return bal;
  }, 0);

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;
    addTreasuryTx({
      type: txType,
      amount,
      description,
      category: category || (txType === 'deposit' ? 'إيداع إضافي' : 'سحب خارجي'),
    });
    setShowTxModal(false);
    setAmount(0);
    setDescription('');
  };

  const handleStartEditTx = (tx: TreasuryTransaction) => {
    if (!isAdmin) return;
    setEditingTx(tx);
    setEditAmount(tx.amount);
    setEditDescription(tx.description);
    setEditType(tx.type);
    setEditCategory(tx.category || '');
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || editAmount <= 0 || !editDescription.trim()) return;
    updateTreasuryTx(editingTx.id, {
      amount: editAmount,
      description: editDescription,
      type: editType,
      category: editCategory || (editType === 'deposit' ? 'إيداع إضافي' : 'سحب خارجي'),
    });
    setEditingTx(null);
  };

  const handleConfirmDeleteTx = () => {
    if (!deletingTx) return;
    deleteTreasuryTx(deletingTx.id);
    setDeletingTx(null);
  };

  return (
    <div className="space-y-6 pb-10 text-right">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Vault className="w-5 h-5 text-emerald-500" />
            <span>إدارة الخزنة والميزانية اليومية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            متابعة حركة النقود، الإيداع، السحب، اليومية، تعديل وحذف الحركات (صلاحية المدير)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTxType('deposit');
              setShowTxModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إيداع نقدي</span>
          </button>
          <button
            onClick={() => {
              setTxType('withdrawal');
              setShowTxModal(true);
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
          >
            <Minus className="w-4 h-4" />
            <span>سحب من الخزنة</span>
          </button>
        </div>
      </div>

      {/* Vault Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-lg">
          <span className="text-xs font-semibold opacity-90 block mb-1">الرصيد الكلي المتاح بالدرج الآن</span>
          <p className="text-2xl font-black">
            {currentBalance.toLocaleString()} <span className="text-sm font-normal">{settings.currency}</span>
          </p>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full inline-block mt-2">
            الافتتاحي + المقبوضات - المصاريف
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">دخل المبيعات اليوم</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {(currentShift?.totalSales || 0).toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">مداخيل الشيفت الحالي فقط</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">مصروفات وتكاليف اليوم</span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {(currentShift?.totalExpenses || 0).toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">المصاريف والمشتريات المسددة</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">صافي حركة مبيعات اليوم</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {((currentShift?.totalSales || 0) - (currentShift?.totalExpenses || 0)).toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">فارق مداخيل اليوم - المصاريف</span>
        </div>
      </div>

      {/* Shift Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {currentShift?.status === 'open' ? (
              <Unlock className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4 text-rose-500" />
            )}
            <span>حالة اليومية وتسليم الكاش</span>
          </h3>
          <span className={`px-2.5 py-1 text-xs font-extrabold rounded-xl ${currentShift?.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
            {currentShift?.status === 'open' ? 'مفتوحة (قيد العمل)' : 'مغلقة'}
          </span>
        </div>

        {currentShift?.status === 'open' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1.5">
              <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                <span>تاريخ الفتح: <strong className="font-mono text-slate-900 dark:text-white">{currentShift.date}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  <Clock className="w-3.5 h-3.5" />
                  وقت البدء التلقائي: {currentShift.openedAt}
                </span>
                <span className="text-slate-300">|</span>
                <span>بواسطة: <strong className="text-slate-900 dark:text-white font-extrabold">{currentShift.cashier}</strong></span>
              </p>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 flex-wrap">
                <span>الرصيد الافتتاحي المعتمد للشيفت: <strong className="text-slate-900 dark:text-white font-black">{currentShift.startingBalance.toLocaleString()} {settings.currency}</strong></span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditShiftBalanceInput(currentShift.startingBalance);
                      setShowEditShiftModal(true);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-bold flex items-center gap-1"
                    title="تعديل الرصيد الافتتاحي للمدير"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>تعديل الرصيد الافتتاحي</span>
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setHandoverCashInput(currentBalance);
                setShowCloseShiftModal(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>إغلاق اليومية وتسليم الكاش</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {currentShift?.closedAt && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-between text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    تم إغلاق الشيفت السابق اليوم الساعة <strong>{currentShift.closedAt}</strong> وتسليم مبلغ كاش قدره <strong>{(currentShift.endingBalance || 0).toLocaleString()} {settings.currency}</strong>.
                  </span>
                </div>
              </div>
            )}

            <p className="font-bold text-slate-700 dark:text-slate-300">
              تحديد الرصيد الافتتاحي لبدء شيفت يومي جديد (سيتحدد توقيت الفتح تلقائياً لحظة الضغط على البدء):
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  value={openShiftAmount}
                  onChange={(e) => setOpenShiftAmount(e.target.value)}
                  placeholder="أدخل الرصيد الأولي لليومية..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{settings.currency}</span>
              </div>

              <button
                onClick={() => {
                  const initBal = parseFloat(openShiftAmount) || 0;
                  openShift(initBal);
                  showToast(`تم فتح اليومية بنجاح وتسجيل التوقيت التلقائي! ✨`);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>فتح يومية جديدة الآن</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-500 font-medium">اختيار سريع للرصيد الافتتاحي:</span>
              <button
                onClick={() => setOpenShiftAmount('0')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                0 {settings.currency} (بدون سيولة سابقة)
              </button>
              <button
                onClick={() => setOpenShiftAmount('50')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                50 {settings.currency}
              </button>
              <button
                onClick={() => setOpenShiftAmount('100')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                100 {settings.currency}
              </button>
              <button
                onClick={() => setOpenShiftAmount('200')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                200 {settings.currency}
              </button>
              <button
                onClick={() => setOpenShiftAmount('500')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                500 {settings.currency}
              </button>
              <button
                onClick={() => setOpenShiftAmount(currentBalance.toString())}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/50 transition-colors"
              >
                رصيد الخزنة الحالي ({currentBalance.toLocaleString()} {settings.currency})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">سجل حركة الخزنة</h3>
          {isAdmin ? (
            <button
              onClick={() => {
                setManagerPasswordInput('');
                setPasswordErrorMsg('');
                setShowClearModal(true);
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كل بيانات الخزنة</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
              🔒 تعديل وحذف حركات الخزنة متاح للمدير فقط
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">البيان / الوصف</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">المستخدم</th>
                {isAdmin && <th className="p-3 text-center">إجراءات المدير</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {treasuryTransactions.map((tx) => {
                const isAdd = tx.type === 'deposit' || tx.type === 'sale';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleString('ar-DZ')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${isAdd ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {tx.type === 'deposit' ? 'إيداع' : tx.type === 'sale' ? 'مبيعات' : tx.type === 'withdrawal' ? 'سحب' : 'مصروف/شراء'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                    <td className={`p-3 font-black ${isAdd ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isAdd ? '+' : '-'}{tx.amount.toLocaleString()} {settings.currency}
                    </td>
                    <td className="p-3 text-slate-400">{tx.user}</td>
                    {isAdmin && (
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEditTx(tx)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                            title="تعديل حركة الخزنة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTx(tx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="حذف حركة الخزنة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit/Withdrawal Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
              {txType === 'deposit' ? 'إيداع نقدي في الخزنة' : 'سحب نقدي من الخزنة'}
            </h3>

            <form onSubmit={handleTxSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">البيان / التوضيح *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="سبب السحب أو الإيداع..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-md ${txType === 'deposit' ? 'bg-emerald-600' : 'bg-rose-600'}`}
                >
                  تأكيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Treasury Transaction Modal (Manager Only) */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-500" />
                <span>تعديل حركة الخزنة (صلاحية المدير)</span>
              </h3>
            </div>

            <form onSubmit={handleSaveEditTx} className="space-y-3 text-xs pt-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الحركة:</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as TreasuryTxType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                >
                  <option value="deposit">إيداع (+)</option>
                  <option value="withdrawal">سحب (-)</option>
                  <option value="sale">مبيعات (+)</option>
                  <option value="purchase">مشتريات (-)</option>
                  <option value="expense">مصروفات (-)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">البيان / الوصف *</label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الفئة:</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="الفئة المخصصة..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Manager Only) */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeletingTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>تأكيد حذف حركة الخزنة</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                هل أنت تأكد من رغبتك في حذف المعاملة: <span className="font-extrabold text-slate-900 dark:text-white underline">{deletingTx.description}</span> بمبلغ <span className="font-bold text-rose-600">{deletingTx.amount.toLocaleString()} {settings.currency}</span>؟
              </p>
              <p className="text-[11px] text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                ⚠️ سيتم شطب هذه المعاملة من سجلات الخزنة.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTx}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Editing Open Shift Starting Balance (Manager Only) */}
      {showEditShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowEditShiftModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-500" />
                <span>تعديل الرصيد الافتتاحي للشيفت الحالي (المدير)</span>
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateShiftStartingBalance(editShiftBalanceInput);
                setShowEditShiftModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرصيد الافتتاحي الجديد للشيفت:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editShiftBalanceInput}
                  onChange={(e) => setEditShiftBalanceInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                💡 يمكنك تعديل الرصيد الافتتاحي للشيفت الحالي في أي وقت لمطابقة السيولة المتاحة فعلياً بالصندوق عند بداية العمل.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditShiftModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Closing Shift and Handing Over Cash */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>إغلاق اليومية وتسليم الكاش النهائي</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">تاريخ اليومية:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{currentShift?.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">وقت الفتح:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{currentShift?.openedAt}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-extrabold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    وقت الإغلاق التلقائي الآن:
                  </span>
                  <span className="font-mono bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">مسؤول الكاشير:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentShift?.cashier}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">الرصيد الافتتاحي</span>
                  <span className="text-slate-800 dark:text-white font-black">{currentShift?.startingBalance.toLocaleString()} {settings.currency}</span>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <span className="block text-[10px] opacity-80">مبيعات الشيفت</span>
                  <span className="font-black">{(currentShift?.totalSales || 0).toLocaleString()} {settings.currency}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ النقدي المسلّم بالفعل في الخزنة عند الإغلاق:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={handoverCashInput}
                    onChange={(e) => setHandoverCashInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-black text-sm text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">{settings.currency}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  المبلغ المحسوب بالخزنة حالياً: <strong className="text-slate-700 dark:text-slate-300">{currentBalance.toLocaleString()} {settings.currency}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  closeShift(handoverCashInput);
                  setShowCloseShiftModal(false);
                  showToast('تم إغلاق اليومية وتسليم الكاش بنجاح وتسجيل توقيت الإغلاق! 🔒');
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>تأكيد الإغلاق وتسليم الكاش</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Confirming Treasury Reset/Clear with Manager Password */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const inputTrimmed = managerPasswordInput.trim();
              
              // Validate against manager accounts
              const managers = users.filter((u) => u.role === 'manager' || u.role === 'admin');
              const isValid = managers.some((m) => {
                if (m.password && m.password.trim() !== '') {
                  return m.password === inputTrimmed;
                }
                return inputTrimmed === '123' || inputTrimmed === 'admin' || inputTrimmed === m.username;
              }) || (currentUser?.password && currentUser.password === inputTrimmed);

              if (!isValid) {
                setPasswordErrorMsg('كلمة مرور المدير غير صحيحة!');
                return;
              }

              clearTreasuryTransactions();
              setShowClearModal(false);
              setManagerPasswordInput('');
              setPasswordErrorMsg('');
              showToast('تم مسح كافة بيانات وحركات الخزنة بنجاح! 🧹');
            }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  setPasswordErrorMsg('');
                  setManagerPasswordInput('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>مسح كل بيانات الخزنة</span>
              </h3>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              تحذير: مسح بيانات الخزنة عملية حساسة ولا يمكن التراجع عنها. لإتمام عملية المسح، يرجى إدخال كلمة مرور المدير للتأكيد.
            </p>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                كلمة مرور المدير:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={managerPasswordInput}
                  onChange={(e) => {
                    setManagerPasswordInput(e.target.value);
                    setPasswordErrorMsg('');
                  }}
                  placeholder="أدخل كلمة مرور المدير (الافتراضية: 123)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              {passwordErrorMsg && (
                <div className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  setPasswordErrorMsg('');
                  setManagerPasswordInput('');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد مسح الخزنة</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
