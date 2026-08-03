import React from 'react';
import { Info, Smartphone, Code2, Download, ExternalLink, CheckCircle2, Copy, Sparkles, BookOpen } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 pb-10 text-right">
      <div className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white rounded-3xl shadow-xl space-y-3 border border-indigo-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          <h2 className="text-xl font-black">📚 Aïcha POS Pro - النسخة 1.0 Sleek</h2>
        </div>
        <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
          نظام التسيير وإدارة نقاط البيع والمستودع الشامل لمكتبة عائشة بتصميم Sleek العصري. تم تطوير وتصميم هذا البرنامج خصيصاً ليعمل بكفاءة فائقة على هواتف الأندرويد، الأجهزة اللوحية، والشاشات الذكية، وهو جاهز تماماً للتشغيل على تطبيق <span className="font-black text-amber-300">Acode</span> أو أي متصفح هاتف.
        </p>
      </div>

      {/* Guide for Acode Android App Integration */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Smartphone className="w-5 h-5 text-indigo-500" />
          <span>دليل التثبيت والتشغيل على تطبيق Acode للاندرويد</span>
        </h3>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">1</span>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">تثبيت تطبيق Acode</h4>
              <p className="text-slate-500 mt-0.5">قم بتنزيل تطبيق Acode - code editor for Android من متجر جوجل بلاي (Google Play) أو F-Droid على هاتفك.</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">2</span>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">تنزيل مشروع التطبيق ZIP</h4>
              <p className="text-slate-500 mt-0.5">قم بتنزيل ملفات هذا التطبيق بالضغط على قائمة Export / ZIP في أعلى شاشة AI Studio أو حفظ مجلد المشروع على ذاكرة الهاتف.</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">3</span>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">فتح المجلد وتجربة المعاينة Preview</h4>
              <p className="text-slate-500 mt-0.5">افتح تطبيق Acode، ثم اختر Open Folder وافتح مجلد المشروع. يمكنك تشغيل المعاينة المباشرة بالنقر على زر التشغيل ▶️ في Acode وسيفتح التطبيق فوراً بشاشة كاملة وبدون أنترنت!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
