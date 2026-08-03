import React from 'react';
import { History, Shield, ShieldAlert, UserCheck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" />
          <span>سجل العمليات والتدقيق الأمني (Audit Log)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تتبع دقيق لجميع الأنشطة، عمليات البيع، التعديل، الحذف، والتسجيل من قبل العمال
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">الوقت والتاريخ</th>
                <th className="p-3.5">المستخدم</th>
                <th className="p-3.5">نوع العملية</th>
                <th className="p-3.5">التفاصيل / البيان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('ar-DZ')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                    {log.userName}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
