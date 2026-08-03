import React, { useState } from 'react';
import { Settings, Store, Printer, DollarSign, Shield, Moon, Sun, Save, Plus, Trash2, UserPlus, CheckCircle, CheckCircle2, Sparkles, Pencil, Key, X, Lock, Upload, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, AppUser } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const [storeName, setStoreName] = useState(settings.libraryName || '');
  const [storePhone, setStorePhone] = useState(settings.phone || '');
  const [storeAddress, setStoreAddress] = useState(settings.address || '');
  const [storeEmail, setStoreEmail] = useState(settings.email || '');
  const [storeLogoUrl, setStoreLogoUrl] = useState(settings.logoUrl || '');
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || '');
  const [currency, setCurrency] = useState(settings.currency || 'د.ت');
  const [taxRate, setTaxRate] = useState(settings.taxRate || 0);
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'A4'>(settings.thermalPrinterWidth || '80mm');

  // Success Feedback Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Add Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('cashier');

  // User Edit & Delete Form State
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('cashier');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار صورة بحجم أقل من 5 ميغابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreLogoUrl(reader.result);
        showToast('تم اختيار وتحميل الشعار بنجاح من جهازك! اضغط "حفظ التغييرات" لتطبيقه.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      libraryName: storeName,
      phone: storePhone,
      address: storeAddress,
      email: storeEmail,
      logoUrl: storeLogoUrl,
      receiptHeader,
      receiptFooter,
      currency,
      taxRate,
      thermalPrinterWidth: paperSize,
    });
    showToast('تم حفظ وتحديث إعدادات المكتبة والعنوان والشعار بنجاح! ✨');
  };

  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('عذراً، إضافة المستخدمين الجدد صلاحية محصورة بحساب المدير فقط.');
      return;
    }
    if (!newUsername || !newPassword || !newFullName) return;
    addUser({
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    showToast(`تم إضافة المستخدم "${newFullName}" بنجاح! ✨`);
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
  };

  const handleStartEditUser = (u: AppUser) => {
    if (!isAdmin) {
      showToast('عذراً، تعديل بيانات المستخدمين صلاحية محصورة بحساب المدير فقط.');
      return;
    }
    setEditingUser(u);
    setEditFullName(u.fullName || u.name || '');
    setEditUsername(u.username || '');
    setEditPassword(u.password || '');
    setEditRole(u.role || 'cashier');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingUser) return;
    if (!editUsername || !editFullName) {
      showToast('يرجى كتابة اسم المستخدم والاسم الكامل.');
      return;
    }
    updateUser(editingUser.id, {
      fullName: editFullName,
      name: editFullName,
      username: editUsername,
      password: editPassword,
      role: editRole,
    });
    showToast(`تم تغيير وتحديث اسم المستخدم وكلمة المرور للحساب "${editFullName}" بنجاح! ✨`);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          <span>إعدادات النظام والمحل والتخصيص</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تخصيص بيانات الفاتورة، العملة المحلية، الطابعة الحرارية، وربط المستخدمين
        </p>
      </div>

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black">{toastMessage}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-medium">
                تم حفظ وتطبيق الإعدادات الجديدة فوراً على جميع أجزاء النظام.
              </p>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-xs font-bold px-2 py-1"
          >
            إغلاق ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store & Receipt Config */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-right">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-500" />
            <span>معلومات المحل والطباعة</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المحل / المكتبة *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان المحل / المكتبة (يظهر في أعلى الفاتورة والوصل) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: الرديف - ولاية قفصة، تونس"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">يظهر مباشرة تحت اسم المحل في جميع الفواتير والمطبوعات.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف للوصل</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Direct Logo Upload Section */}
            <div className="space-y-1.5 pt-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                شعار المحل / التطبيق (تحميل مباشر من الهاتف أو الحاسوب) 🖼️
              </label>
              
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {storeLogoUrl ? (
                    <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xs bg-white shrink-0 flex items-center justify-center p-1">
                      <img src={storeLogoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {storeLogoUrl ? 'تم اختيار الشعار وتجهيزه' : 'لم يتم اختيار شعار بعد'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      يظهر في أعلى الفواتير والوصل الحراري وشريط التطبيق.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <input
                    type="file"
                    id="logo-upload-input-file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload-input-file"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all w-full sm:w-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختر صورة من جهازك</span>
                  </label>

                  {storeLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setStoreLogoUrl('');
                        showToast('تمت إزالة الشعار.');
                      }}
                      className="px-2.5 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/40 transition-all shrink-0 cursor-pointer"
                    >
                      إزالة
                    </button>
                  )}
                </div>
              </div>

              <details className="text-[11px] text-slate-400 pt-0.5">
                <summary className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200">
                  خيارات متقدمة: إدخال رابط الصورة (URL)
                </summary>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={storeLogoUrl}
                  onChange={(e) => setStoreLogoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-mono text-[11px]"
                />
              </details>
            </div>

            {/* Receipt Header & Footer Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ترويسة الفاتورة (أعلى الوصل)</label>
                <input
                  type="text"
                  placeholder="أهلاً بكم في مكتبتنا..."
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تذييل الفاتورة (أسفل الوصل)</label>
                <input
                  type="text"
                  placeholder="شكراً لزيارتكم!..."
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رمز العملة *</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">قياس الورق الحراري</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white cursor-pointer"
                >
                  <option value="80mm">طابعة حرارية 80mm (قياسي)</option>
                  <option value="58mm">طابعة حرارية 58mm (صغيرة)</option>
                  <option value="A4">ورق عادي A4</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التغييرات وتطبيق الإعدادات</span>
            </button>
          </form>
        </div>

        {/* Users & Permissions Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-right">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>إدارة المستخدمين والصلاحيات</span>
          </h3>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {users.map((u) => {
              const isTargetAdmin = u.role === 'manager' || u.role === 'admin';
              const canDelete = isAdmin && !isTargetAdmin && u.id !== currentUser?.id;

              return (
                <div
                  key={u.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>{u.fullName || u.name}</span>
                      {isTargetAdmin && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          مدير محمي 🛡️
                        </span>
                      )}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      اسم الدخول: <span className="font-mono text-slate-600 dark:text-slate-300">{u.username}</span> | الصلاحية:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {u.role === 'manager' || u.role === 'admin' ? 'مدير' : u.role === 'cashier' ? 'بائع' : 'محاسب'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => handleStartEditUser(u)}
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                        title="تغيير اسم المستخدم وكلمة المرور"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    )}
                    {canDelete ? (
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : isTargetAdmin ? (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg shadow-2xs">
                        حساب المدير 🔒
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {isAdmin ? (
            <form onSubmit={handleAddUser} className="pt-3 border-t space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">إضافة مستخدم جديد (بواسطة المدير):</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
                <input
                  type="text"
                  placeholder="اسم المستخدم (Username)"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white font-mono"
                />
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white font-mono"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                >
                  <option value="manager">مدير (Manager)</option>
                  <option value="cashier">بائع (Cashier)</option>
                  <option value="accountant">محاسب (Accountant)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة المستخدم</span>
              </button>
            </form>
          ) : (
            <div className="pt-3 border-t text-center text-xs font-bold text-amber-700 dark:text-amber-300 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl">
              🔒 إضافة، تعديل، وحذف المستخدمين وتغيير كلمات المرور صلاحية خاصة بحساب المدير فقط.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Editing User / Changing Password */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>تعديل حساب ({editingUser.fullName || editingUser.name})</span>
              </h3>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">اسم المستخدم للدخول (Username):</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">كلمة المرور الجديدة (Password):</label>
                <input
                  type="text"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">الصلاحية:</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold dark:text-white"
                >
                  <option value="manager">مدير (Manager)</option>
                  <option value="cashier">بائع (Cashier)</option>
                  <option value="accountant">محاسب (Accountant)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Deleting User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeletingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>تأكيد حذف المستخدم</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                هل أنت تأكد من رغبتك في حذف حساب <span className="font-extrabold text-slate-900 dark:text-white underline">{deletingUser.fullName || deletingUser.name}</span> ({deletingUser.username})؟
              </p>
              <p className="text-[11px] text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                ⚠️ تنبيه: سيؤدي ذلك إلى إزالة الحساب نهائياً ومنع المستخدم من تسجيل الدخول.
              </p>
            </div>

            <div className="pt-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(deletingUser.id);
                  showToast(`تم حذف حساب المستخدم "${deletingUser.fullName || deletingUser.name}" بنجاح! ✨`);
                  setDeletingUser(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
