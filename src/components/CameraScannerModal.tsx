import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, RefreshCw, Volume2, VolumeX, CheckCircle, AlertTriangle, Zap, Barcode, ShieldAlert, Plus, Flashlight } from 'lucide-react';
import { Product } from '../types';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => boolean; // returns true if product matched
  onOpenAddProduct?: (barcode: string) => void; // opens new product modal if barcode is not found
  products: Product[];
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onOpenAddProduct,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual' | 'products'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [continuousScan, setContinuousScan] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedMessage, setScannedMessage] = useState<{ text: string; type: 'success' | 'warning'; barcode?: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-camera-barcode-reader';
  const lastScanRef = useRef<{ barcode: string; time: number }>({ barcode: '', time: 0 });

  // Sound feedback beeps
  const playBeep = useCallback((type: 'success' | 'warning') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }, [soundEnabled]);

  // Stop camera stream safely
  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
        setTorchOn(false);
      }
    }
  }, []);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (html5QrcodeRef.current && isScanning) {
      try {
        const nextState = !torchOn;
        await html5QrcodeRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState } as any],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch not supported:', err);
        alert('خاصية الفلاش الضوئي غير مدعومة في جهازك أو كاميرا المتصفح الحالية.');
      }
    }
  };

  // Handle scanned barcode logic
  const handleBarcodeFound = useCallback(
    (decodedText: string) => {
      const trimmed = decodedText.trim();
      if (!trimmed) return;

      // Throttle scanning duplicate barcodes within 1.6 seconds
      const now = Date.now();
      if (trimmed === lastScanRef.current.barcode && now - lastScanRef.current.time < 1600) {
        return;
      }
      lastScanRef.current = { barcode: trimmed, time: now };

      const matched = onScanSuccess(trimmed);

      if (matched) {
        playBeep('success');
        const foundProduct = products.find((p) => p.barcode.toLowerCase() === trimmed.toLowerCase() || p.id === trimmed);
        setScannedMessage({
          text: `تمت إضافة: "${foundProduct ? foundProduct.name : trimmed}" إلى سلة المشتريات`,
          type: 'success',
          barcode: trimmed,
        });

        // Close camera scanner automatically as requested
        setTimeout(() => {
          stopScanner();
          onClose();
        }, 350);
      } else {
        playBeep('warning');
        setScannedMessage({
          text: `الباركود (${trimmed}) غير مسجل! جاري فتح نموذج الإضافة...`,
          type: 'warning',
          barcode: trimmed,
        });

        // Close camera scanner and open add product modal automatically
        setTimeout(() => {
          stopScanner();
          onClose();
          if (onOpenAddProduct) {
            onOpenAddProduct(trimmed);
          }
        }, 400);
      }
    },
    [onScanSuccess, onOpenAddProduct, products, stopScanner, onClose, playBeep]
  );

  // Start camera scanning feed
  const startScanner = useCallback(async (cameraIdOverride?: string) => {
    setCameraError(null);
    await stopScanner();

    const containerEl = document.getElementById(scannerContainerId);
    if (!containerEl) {
      console.warn(`Scanner element ${scannerContainerId} not found in DOM yet.`);
      return;
    }

    try {
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (devices && devices.length > 0) {
        setCameras(devices.map((d) => ({ id: d.id, label: d.label || `كاميرا ${d.id.slice(0, 5)}` })));
      }

      if (!document.getElementById(scannerContainerId)) {
        return;
      }

      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      html5QrcodeRef.current = html5Qrcode;

      const targetCamera = cameraIdOverride || (devices && devices.length > 0 ? devices[devices.length - 1].id : { facingMode: 'environment' });

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333333,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF,
        ],
      };

      await html5Qrcode.start(
        targetCamera,
        config,
        (decodedText) => {
          handleBarcodeFound(decodedText);
        },
        () => {
          // ignore scan frame misses
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera Scanner start notice:', err);
      // Only set error if element still exists and active
      if (document.getElementById(scannerContainerId)) {
        setCameraError('تعذر الوصول إلى الكاميرا. يرجى التأكد من إعطاء الصلاحية للكاميرا بمتصفحك، أو استخدام طريقة المسح اليدوي/الافتراضي.');
      }
      setIsScanning(false);
    }
  }, [stopScanner, handleBarcodeFound]);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner(selectedCameraId);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, startScanner, stopScanner, selectedCameraId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">قارئ الباركود بالكاميرا المباشرة</h3>
              <p className="text-xs text-indigo-200/80">وجه كاميرا الهاتف أو الكمبيوتر مباشرة نحو الرمز الشريط</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>كاميرا المسح</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>إدخال يدوي</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'products'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>منتجات سريعة</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Scanned Notification Banner */}
          {scannedMessage && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 ${
                scannedMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/80 border-amber-500/40 text-amber-800 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {scannedMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <span>{scannedMessage.text}</span>
              </div>

              {scannedMessage.type === 'warning' && scannedMessage.barcode && onOpenAddProduct && (
                <button
                  onClick={() => {
                    const bc = scannedMessage.barcode!;
                    stopScanner();
                    onClose();
                    onOpenAddProduct(bc);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل المنتج الآن</span>
                </button>
              )}
            </div>
          )}

          {/* Tab 1: Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Controls bar */}
              <div className="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={toggleTorch}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border text-xs transition-colors ${
                    torchOn
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  title="تفعيل فلاش الضوء للأماكن المظلمة"
                >
                  <Flashlight className={`w-3.5 h-3.5 ${torchOn ? 'text-slate-950 animate-pulse' : ''}`} />
                  <span>{torchOn ? 'الفلاش مفعّل' : 'فلاش ضوئي'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setContinuousScan(!continuousScan)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 border text-xs transition-colors ${
                      continuousScan
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${continuousScan ? 'animate-spin' : ''}`} />
                    <span>{continuousScan ? 'مسح متكرر' : 'تلقائي سريع'}</span>
                  </button>

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                      soundEnabled
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                    }`}
                    title={soundEnabled ? 'صوت التنبيه مفعّل' : 'صوت التنبيه مكتوم'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Camera Switcher if multiple available */}
              {cameras.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold shrink-0">اختيار الكاميرا:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      startScanner(e.target.value);
                    }}
                    className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold dark:text-white"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scanner Video View Container */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/30 shadow-inner min-h-[260px] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full" />

                {/* Visual Laser Line Scan Effect */}
                {isScanning && !cameraError && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-64 h-40 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-bounce" />
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                      جاري المسح الضوئي المباشر...
                    </span>
                  </div>
                )}

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="p-6 text-center space-y-3 text-slate-300">
                    <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-amber-400 max-w-xs mx-auto">{cameraError}</p>
                    <button
                      onClick={() => startScanner()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      إعادة محاولة تفعيل الكاميرا
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Manual Input */}
          {activeTab === 'manual' && (
            <div className="space-y-4 py-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أدخل رمز الباركود أو رقم الكود المباشر:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (manualCode.trim()) {
                        handleBarcodeFound(manualCode.trim());
                        setManualCode('');
                      }
                    }
                  }}
                  placeholder="مثال: 6131001001 أو p1"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (manualCode.trim()) {
                      handleBarcodeFound(manualCode.trim());
                      setManualCode('');
                    }
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md"
                >
                  إضافة
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Fast Product Barcode Selector */}
          {activeTab === 'products' && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                اضغط على أي باركود لتجربة مسحه فوراً وإضافته إلى السلة:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleBarcodeFound(p.barcode);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-2xl text-right transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="block font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {p.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        الباركود: {p.barcode}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] rounded-lg">
                      {p.price} د.ج
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
