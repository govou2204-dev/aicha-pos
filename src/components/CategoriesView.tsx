import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';

const COLOR_OPTIONS = [
  { name: 'أخضر زمردي', value: 'bg-emerald-500' },
  { name: 'أزرق', value: 'bg-blue-500' },
  { name: 'بنفسجي داكن', value: 'bg-indigo-500' },
  { name: 'بنفسجي زاهي', value: 'bg-purple-500' },
  { name: 'ذهبي / عنبري', value: 'bg-amber-500' },
  { name: 'وردي / أحمر', value: 'bg-rose-500' },
  { name: 'سماوي / كواتشوك', value: 'bg-teal-500' },
  { name: 'سماوي فاتح', value: 'bg-cyan-500' },
  { name: 'زهري فوشيا', value: 'bg-fuchsia-500' },
  { name: 'برتقالي', value: 'bg-orange-500' },
  { name: 'رمادي داكن', value: 'bg-slate-600' },
];

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);

  // Form State
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(COLOR_OPTIONS[0].value);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].value);
    setShowModal(true);
  };

  const openEditModal = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatColor(cat.color || COLOR_OPTIONS[0].value);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showNotification('يرجى كتابة اسم الصنف أولاً', 'error');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, catName.trim(), catColor);
      showNotification(`تم تعديل الصنف "${catName.trim()}" بنجاح ✨`);
    } else {
      addCategory(catName.trim(), catColor);
      showNotification(`تمت إضافة الصنف الجديد "${catName.trim()}" بنجاح 🏷️`);
    }

    setShowModal(false);
    setCatName('');
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    const name = deletingCategory.name;
    deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
    showNotification(`تم حذف الصنف "${name}" بنجاح 🗑️`);
  };

  // Helper to count products in category
  const getCategoryStats = (catName: string) => {
    const catProducts = products.filter((p) => p.category === catName);
    const count = catProducts.length;
    const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
    return { count, totalStock };
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-200" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-indigo-500" />
            <span>إدارة الأصناف والتصنيفات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل وحذف أصناف المنتجات للتحكم الكامل في تنظيم المكتبة والمتجر
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الأصناف</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{categories.length} صنف</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي المنتجات المسجلة</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{products.length} منتج</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">متوسط المنتجات/صنف</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {categories.length > 0 ? (products.length / categories.length).toFixed(1) : 0} منتج
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم صنف..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            مسح البحث
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <Tags className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
            {categories.length === 0 ? 'لا توجد أصناف معرفة حالياً' : 'لم يتم العثور على أي صنف بهذا الاسم'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {categories.length === 0
              ? 'قم بإضافة أول صنف لتنظيم منتجات المكتبة بشكل مرتب وسهل Access.'
              : 'تأكد من كتابة الاسم بشكل صحيح أو قم بإضافة صنف جديد.'}
          </p>
          {categories.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف الآن</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const { count, totalStock } = getCategoryStats(cat.name);
            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${cat.color || 'bg-indigo-500'} shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-800`} />
                      <h3 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        title="تعديل صنف"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        title="حذف صنف"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">عدد المنتجات</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{count} منتج</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">المخزون الكلي</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{totalStock} قطعة</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('products')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>عرض المنتجات بالكتالوج</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Tags className="w-4 h-4 text-indigo-500" />
                <span>{editingCategory ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم الصنف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="مثال: كتب وروايات، أدوات هندسية، أقلام..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  اختر لون تمييز الصنف
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = catColor === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCatColor(c.value)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${c.value} shrink-0`} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                          {c.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة الصنف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950/60 pb-3">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>تأكيد حذف الصنف</span>
              </h3>
              <button
                onClick={() => setDeletingCategory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف الصنف <span className="font-extrabold text-slate-900 dark:text-white underline">{deletingCategory.name}</span>؟
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300">
              ملاحظة: المنتجات المسجلة تحت هذا الصنف لن تُحذف، بل يمكنك إعادة تعيين تصنيفها لاحقاً.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
