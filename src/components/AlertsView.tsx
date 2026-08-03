import React from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AlertsView: React.FC = () => {
  const { alerts, setActiveTab } = useApp();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <span>مركز التنبيهات الذكية والإشعارات</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تنبيهات تلقائية لنقص المخزون، الديون المستحقة، والنسخ الاحتياطي
        </p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">لا توجد تنبيهات حالياً!</p>
            <p className="text-xs text-slate-400 mt-1">المستودع والدفاتر والميزانية بحالة سليمة تماماً.</p>
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm flex items-start justify-between gap-3 ${
                alt.type === 'danger'
                  ? 'border-r-4 border-r-rose-500 border-slate-200 dark:border-slate-800'
                  : 'border-r-4 border-r-amber-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    alt.type === 'danger'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {alt.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {alt.description}
                  </p>
                </div>
              </div>

              {alt.tabKey && (
                <button
                  onClick={() => setActiveTab(alt.tabKey as any)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-bold rounded-xl text-xs shrink-0 flex items-center gap-1"
                >
                  <span>معالجة</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
