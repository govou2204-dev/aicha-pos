import React, { useState, useRef } from 'react';
import { HardDrive, Download, Upload, FileJson, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BackupView: React.FC = () => {
  const { exportBackup, importBackup, resetData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingRestoreContent, setPendingRestoreContent] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPendingRestoreContent(content);
      }
    };
    reader.readAsText(file);
    // reset input so user can re-select same file if needed
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreContent) return;
    const success = importBackup(pendingRestoreContent);
    setPendingRestoreContent(null);
    if (success) {
      showNotification('تمت استعادة البيانات والنسخة الاحتياطية بنجاح! ✨', 'success');
    } else {
      showNotification('خطأ: الملف غير صالح أو تالف.', 'error');
    }
  };

  const handleConfirmReset = () => {
    resetData();
    setShowResetConfirm(false);
    showNotification('تمت إعادة ضبط النظام للبيانات الافتراضية بنجاح! 🔄', 'success');
  };

  return (
    <div className="space-y-6 pb-10 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> : <AlertTriangle className="w-5 h-5 text-rose-200" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-500" />
          <span>النسخ الاحتياطي واستعادة البيانات</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          حفظ نسخة أمان كاملة من قاعدة البيانات على جهازك واستعادتها بضغطة زر
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 text-right">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              حفظ وتصدير نسخة احتياطية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              قم بتحميل ملف JSON يحتوي على كامل قاعدة بيانات مكتبة عائشة (المنتجات، العملاء، الفواتير، والخزنة).
            </p>
          </div>
          <button
            onClick={() => {
              exportBackup();
              showNotification('تم بدء تنزيل ملف النسخة الاحتياطية (.json) بنجاح!');
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileJson className="w-4 h-4" />
            <span>تنزيل النسخة الاحتياطية الآن (.json)</span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 text-right">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              استعادة نسخة احتياطية من جهازك
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              اختر ملف النسخة الاحتياطية (.json) لاستعادة كافة السجلات والبيانات السابقة.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>رفع واستعادة ملف البيانات</span>
          </button>
        </div>
      </div>

      {/* Reset System Danger Zone */}
      <div className="p-6 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl space-y-3 text-right">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm font-extrabold">
            منطقة الأمان وإعادة ضبط المصنع
          </h3>
        </div>
        <p className="text-xs text-rose-600/80 dark:text-rose-300 leading-relaxed">
          إذا كنت تريد البدء من جديد ومسح كافة البيانات التجريبية والتغيرات، يمكنك استعادة بيانات المصنع الافتراضية بضغطة واحدة.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة الضبط الافتراضي</span>
        </button>
      </div>

      {/* Restore Confirmation Modal */}
      {pendingRestoreContent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-500" />
                <span>تأكيد استعادة النسخة الاحتياطية</span>
              </h3>
              <button
                onClick={() => setPendingRestoreContent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال كامل البيانات الحالية في النظام بالسجلات المخزنة في هذا الملف.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingRestoreContent(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all"
              >
                تأكيد الاستعادة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950/60 pb-3">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>تأكيد إعادة الضبط الافتراضي</span>
              </h3>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-extrabold">⚠️ تنبيه هـام جدًا!</p>
              <p className="leading-relaxed">
                سيتم مسح كافة الفواتير والمنتجات والحركات والمستخدمين المضافين حديثاً، وإعادة ضبط قاعدة البيانات إلى الحالة الافتراضية الأولى.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all"
              >
                تأكيد وإعادة الضبط الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

