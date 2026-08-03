import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Pause,
  RotateCcw,
  Printer,
  Share2,
  Download,
  User,
  CreditCard,
  Banknote,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Zap,
  Check,
  Scan,
  RefreshCw,
  Camera,
  Package,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Product, SaleItem, Customer, SaleInvoice, PaymentMethod } from '../types';
import { CameraScannerModal } from './CameraScannerModal';

export const POSView: React.FC = () => {
  const {
    products,
    categories: appCategories,
    suppliers,
    customers,
    settings,
    addProduct,
    completeSale,
    holdSale,
    heldSales,
    restoreHeldSale,
    deleteHeldSale,
    returnSale,
    sales,
  } = useApp();

  // Search & Cart state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('زبون عادي');
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidInput, setPaidInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  // Barcode Scanner specialized state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [autoFocusScanner, setAutoFocusScanner] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedAlert, setScannedAlert] = useState<{ name: string; barcode: string; time: string } | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Unmatched Barcode & Quick Add Product Form State
  const [unmatchedBarcodeAlert, setUnmatchedBarcodeAlert] = useState<string | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickBarcode, setQuickBarcode] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickBrand, setQuickBrand] = useState('');
  const [quickPurchasePrice, setQuickPurchasePrice] = useState<number | string>(0);
  const [quickSalePrice, setQuickSalePrice] = useState<number | string>(0);
  const [quickStock, setQuickStock] = useState<number>(20);

  // Active Completed Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<SaleInvoice | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'A4-FR' | 'thermal-80' | 'thermal-58'>('A4-FR');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnInvoiceNum, setReturnInvoiceNum] = useState('');

  // Synth Beep Audio Feedback for Barcode Scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1080, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio fallback
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.brand.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const categories = ['الكل', ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart helper functions
  const addToCart = useCallback((product: Product) => {
    if (product.stock === 0 && !settings.allowNegativeStock) {
      alert(`تنبيه: المنتج "${product.name}" نفد من المخزون!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock && !settings.allowNegativeStock) {
          alert(`تم الوصول للحد الأقصى للمخزون المتاح (${product.stock} قطعة).`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          purchasePrice: product.purchasePrice,
          unitPrice: product.salePrice,
          quantity: 1,
          discount: 0,
          total: product.salePrice,
        },
      ];
    });
  }, [settings.allowNegativeStock]);

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setInvoiceDiscount(0);
    setPaidInput('');
    setNotesInput('');
  };

  // Subtotal & Totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = Math.min(subtotal, invoiceDiscount);
  const grandTotal = Math.max(0, subtotal - totalDiscount);
  const paidAmount = paidInput ? parseFloat(paidInput) : paymentMethod === 'debt' ? 0 : grandTotal;
  const debtAmount = Math.max(0, grandTotal - paidAmount);

  // Open Quick Add Product Modal for unregistered barcodes
  const openQuickAddModal = (barcodeToUse: string) => {
    setQuickBarcode(barcodeToUse);
    setQuickName('');
    setQuickCategory(appCategories[0]?.name || 'كراريس ودفاتر');
    setQuickBrand('');
    setQuickPurchasePrice(0);
    setQuickSalePrice(0);
    setQuickStock(20);
    setShowQuickAddModal(true);
    setUnmatchedBarcodeAlert(null);
  };

  const handleSaveQuickProduct = (addToCartAfterSave: boolean) => {
    if (!quickName.trim() || !quickBarcode.trim()) {
      alert('يرجى كتابة اسم المنتج والباركود بشكل صحيح!');
      return;
    }

    const newProdData = {
      name: quickName.trim(),
      barcode: quickBarcode.trim(),
      category: quickCategory || appCategories[0]?.name || 'عام',
      brand: quickBrand.trim() || 'عام',
      purchasePrice: Number(quickPurchasePrice) || 0,
      salePrice: Number(quickSalePrice) || 0,
      stock: Number(quickStock) || 10,
      minStockAlert: 5,
      supplierId: suppliers[0]?.id || '',
    };

    addProduct(newProdData);

    const createdProd: Product = {
      id: 'p_' + Date.now(),
      ...newProdData,
      soldCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: newProdData.stock === 0 ? 'out' : newProdData.stock <= 5 ? 'low' : 'good',
    };

    if (addToCartAfterSave) {
      // Automatically add 1 unit to cart
      addToCart(createdProd);

      // Show alert badge
      setScannedAlert({
        name: createdProd.name,
        barcode: createdProd.barcode,
        time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setTimeout(() => setScannedAlert(null), 4000);
    }

    setShowQuickAddModal(false);
    setSearchQuery('');
    setUnmatchedBarcodeAlert(null);
  };

  // Process exact Barcode scan matching
  const processBarcodeScan = useCallback((barcodeInput: string) => {
    const trimmed = barcodeInput.trim();
    if (!trimmed) return false;

    const matchedProduct = products.find(
      (p) => p.barcode.toLowerCase() === trimmed.toLowerCase() || p.id === trimmed
    );

    if (matchedProduct) {
      addToCart(matchedProduct);
      if (soundEnabled) playBeep();
      setScannedAlert({
        name: matchedProduct.name,
        barcode: matchedProduct.barcode,
        time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setTimeout(() => setScannedAlert(null), 3000);
      setSearchQuery('');
      setUnmatchedBarcodeAlert(null);
      if (autoFocusScanner && searchInputRef.current) {
        searchInputRef.current.focus();
      }
      return true;
    } else {
      setUnmatchedBarcodeAlert(trimmed);
      return false;
    }
  }, [products, addToCart, soundEnabled, autoFocusScanner]);

  // Handle Input typing - instant auto-scan if exact barcode matched while typing
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    const trimmed = val.trim();
    if (trimmed.length >= 3) {
      const exactMatch = products.find((p) => p.barcode.toLowerCase() === trimmed.toLowerCase());
      if (exactMatch) {
        processBarcodeScan(trimmed);
      }
    }
  };

  // Handle Barcode enter key search
  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const success = processBarcodeScan(searchQuery);
      if (!success) {
        if (filteredProducts.length === 1) {
          addToCart(filteredProducts[0]);
          if (soundEnabled) playBeep();
          setScannedAlert({
            name: filteredProducts[0].name,
            barcode: filteredProducts[0].barcode,
            time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          });
          setTimeout(() => setScannedAlert(null), 3000);
          setSearchQuery('');
          setUnmatchedBarcodeAlert(null);
        } else {
          openQuickAddModal(searchQuery.trim());
        }
      }
    }
  };

  // Global listener for USB/Bluetooth rapid Barcode Hardware Scanners
  useEffect(() => {
    if (!isScannerActive) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isOtherInputFocused =
        target &&
        (target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          (target.tagName === 'INPUT' && target !== searchInputRef.current));

      if (isOtherInputFocused) return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const success = processBarcodeScan(buffer);
          if (success) {
            e.preventDefault();
          }
          buffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isScannerActive, processBarcodeScan]);

  // Auto focus search input on mount and state change
  useEffect(() => {
    if (autoFocusScanner && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocusScanner]);

  // Complete Sale Action
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'debt' && !selectedCustomerId) {
      alert('يرجى اختيار زبون مسجل لربط الفاتورة كـ دَين على الحساب!');
      return;
    }

    const created = completeSale({
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomerName,
      items: cart,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: 0,
      totalAmount: grandTotal,
      paidAmount,
      debtAmount,
      paymentMethod,
      status: 'completed',
      notes: notesInput,
    });

    // Trigger celebration confetti
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // safe fallback
    }

    setActiveReceipt(created);
    clearCart();
  };

  // Hold Sale
  const handleHoldInvoice = () => {
    if (cart.length === 0) return;
    holdSale({
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomerName,
      items: cart,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: 0,
      totalAmount: grandTotal,
      paidAmount: 0,
      debtAmount: grandTotal,
      paymentMethod: 'cash',
      status: 'held',
    });
    clearCart();
    alert('تم تعليق الفاتورة بنجاح. يمكنك استرجاعها في أي وقت.');
  };

  const handleRestoreHeld = (id: string) => {
    const restored = restoreHeldSale(id);
    if (restored) {
      setCart(restored.items);
      setSelectedCustomerName(restored.customerName);
      setSelectedCustomerId(restored.customerId || '');
      setShowHeldModal(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element || !activeReceipt) return;
    
    try {
      setIsGeneratingPDF(true);
      const isThermal = receiptFormat.startsWith('thermal');
      const opt = {
        margin:       isThermal ? [2, 2, 2, 2] : [5, 5, 5, 5],
        filename:     `Facture_${activeReceipt.invoiceNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2.5, 
          useCORS: true, 
          logging: false,
          onclone: (clonedDoc: Document) => {
            // 1. Fix style tags in cloned document to remove or replace any oklch references
            const styleTags = clonedDoc.querySelectorAll('style');
            styleTags.forEach((styleTag) => {
              if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
                styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#2563eb');
              }
            });

            const receiptEl = clonedDoc.getElementById('printable-receipt');
            if (!receiptEl) return;

            // 2. Helper canvas to convert color values to standard rgb via pixel extraction
            const dummyCanvas = clonedDoc.createElement('canvas');
            dummyCanvas.width = 1;
            dummyCanvas.height = 1;
            const ctx = dummyCanvas.getContext('2d', { willReadFrequently: true });

            const oklchToRgb = (colorStr: string): string => {
              if (!colorStr) return colorStr;
              if (!colorStr.includes('oklch') && !colorStr.includes('color(')) return colorStr;
              if (!ctx) return '#2563eb';
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = colorStr;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                if (a === 0 && colorStr.includes('transparent')) return 'transparent';
                return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
              } catch (e) {
                return '#2563eb';
              }
            };

            const convertProps = [
              'color', 
              'backgroundColor', 
              'borderColor', 
              'borderTopColor', 
              'borderRightColor', 
              'borderBottomColor', 
              'borderLeftColor'
            ];

            const sanitizeElement = (htmlEl: HTMLElement) => {
              if (!htmlEl || !htmlEl.style) return;
              if (htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
                htmlEl.style.cssText = htmlEl.style.cssText.replace(/oklch\([^)]+\)/g, '#2563eb');
              }

              const computed = window.getComputedStyle(htmlEl);
              convertProps.forEach((prop) => {
                const val = computed.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('color('))) {
                  const converted = oklchToRgb(val);
                  htmlEl.style.setProperty(prop, converted, 'important');
                }
              });
            };

            sanitizeElement(receiptEl as HTMLElement);
            const allElements = receiptEl.querySelectorAll('*');
            allElements.forEach((el) => sanitizeElement(el as HTMLElement));
          }
        },
        jsPDF:        { 
          unit: 'mm', 
          format: receiptFormat === 'A4-FR' ? 'a4' : receiptFormat === 'thermal-80' ? [80, 220] : [58, 180], 
          orientation: 'portrait' 
        }
      };

      const html2pdfModule = await import('html2pdf.js');
      const html2pdfFunc = (html2pdfModule.default || html2pdfModule) as any;
      await html2pdfFunc().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintInvoice = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("Print trigger failed:", err);
      window.print();
    }
  };

  const handleReturnInvoiceSubmit = () => {
    if (!returnInvoiceNum.trim()) return;
    const inv = sales.find(
      (s) => s.invoiceNumber.toLowerCase() === returnInvoiceNum.trim().toLowerCase()
    );
    if (!inv) {
      alert('لم يتم العثور على فاتورة بهذا الرقم!');
      return;
    }
    returnSale(inv.id, 'إرجاع واستبدال من نقطة البيع');
    alert(`تم إرجاع الفاتورة ${inv.invoiceNumber} وإعادة البضاعة للمخزون بنجاح.`);
    setShowReturnModal(false);
    setReturnInvoiceNum('');
  };

  // WhatsApp invoice link generator
  const generateWhatsAppShare = (inv: SaleInvoice) => {
    const text = `*فاتورة مكتبة عائشة - Aïcha POS Pro*%0Aرقم الفاتورة: ${
      inv.invoiceNumber
    }%0Aالتاريخ: ${new Date(inv.date).toLocaleDateString(
      'ar-DZ'
    )}%0Aالزبون: ${inv.customerName}%0A------------------%0A` +
      inv.items.map((i) => `• ${i.name} x${i.quantity} = ${i.total} ${settings.currency}`).join('%0A') +
      `%0A------------------%0Aالإجمالي: ${inv.totalAmount} ${settings.currency}%0Aالمدفوع: ${inv.paidAmount} ${settings.currency}%0Aشكراً لزيارتكم!`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full pb-10">
      {/* Left Column: Product Selection Catalog */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Top Controls: Barcode Scanner & Search Bar */}
        <div className="p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm space-y-3">
          {/* Scanner Live Status & Quick Settings Bar */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScannerActive(!isScannerActive)}
                className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px] ${
                  isScannerActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
                title="تفعيل/إيقاف الاستماع التلقائي لماسح الباركود"
              >
                <span className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <Scan className="w-3.5 h-3.5" />
                <span>{isScannerActive ? 'الماسح الضوئي تلقائي' : 'الماسح موقوف'}</span>
              </button>

              <button
                onClick={() => {
                  setAutoFocusScanner(!autoFocusScanner);
                  if (!autoFocusScanner && searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                  autoFocusScanner
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
                title="إعادة التركيز التلقائي على خانة البحث"
              >
                <Zap className="w-3 h-3" />
                <span>تركيز تلقائي</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  soundEnabled
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
                title={soundEnabled ? 'صوت التنبيه مفعّل' : 'صوت التنبيه مكتوم'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {searchInputRef.current && (
                <button
                  onClick={() => searchInputRef.current?.focus()}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] flex items-center gap-1"
                  title="التركيز الآن"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تركيز</span>
                </button>
              )}
            </div>
          </div>

          {/* Instant Scanned Item Toast Alert */}
          {scannedAlert && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-black text-xs">{scannedAlert.name}</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    الباركود: {scannedAlert.barcode} • {scannedAlert.time}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded-lg">تمت الإضافة تلقائياً</span>
            </div>
          )}

          {/* Unmatched Barcode Prompt Banner */}
          {unmatchedBarcodeAlert && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-500/40 rounded-2xl flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs font-bold animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  الباركود <span className="font-mono underline font-black">{unmatchedBarcodeAlert}</span> غير مسجل بالمخزون!
                </span>
              </div>
              <button
                onClick={() => openQuickAddModal(unmatchedBarcodeAlert)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل كمنتج جديد فوراً</span>
              </button>
            </div>
          )}

          {/* Search Input Field */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-indigo-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDownSearch}
                placeholder="امسح الباركود بالماسح الضوئي مباشرة أو ابحث بالاسم/الماركة..."
                className="w-full pr-10 pl-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Camera Barcode Scanner Button */}
            <button
              onClick={() => setShowCameraModal(true)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 shrink-0 active:scale-95"
              title="فتح قارئ الباركود عبر كاميرا الجهاز المباشرة"
            >
              <Camera className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">مسح بالكاميرا</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] p-1">
          {filteredProducts.map((p) => {
            const isOut = p.stock === 0;
            const isLow = p.stock > 0 && p.stock <= p.minStockAlert;
            return (
              <div
                key={p.id}
                onClick={() => !isOut && addToCart(p)}
                className={`p-3.5 bg-white dark:bg-slate-900 border rounded-2xl transition-all shadow-sm flex flex-col justify-between group relative overflow-hidden ${
                  isOut
                    ? 'opacity-60 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                    : 'hover:border-emerald-500 hover:shadow-md cursor-pointer border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Status Badges */}
                {isOut && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-md">
                    نفد
                  </span>
                )}
                {isLow && !isOut && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-md">
                    متبقي {p.stock}
                  </span>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    {p.brand} • {p.category}
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {p.salePrice}
                    </span>
                    <span className="text-[10px] text-slate-400 mr-1">{settings.currency}</span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Order Cart & Receipt Billing */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                فاتورة البيع الحالية
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                {cart.length} أصناف
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {heldSales.length > 0 && (
                <button
                  onClick={() => setShowHeldModal(true)}
                  className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>معلقة ({heldSales.length})</span>
                </button>
              )}
              <button
                onClick={() => setShowReturnModal(true)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] flex items-center gap-1"
                title="إرجاع واستبدال فاتورة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إرجاع</span>
              </button>
            </div>
          </div>

          {/* Customer Selector */}
          <div className="mt-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const cust = customers.find((c) => c.id === e.target.value);
                setSelectedCustomerName(cust ? cust.name : 'زبون عادي');
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              <option value="">زبون عادي (نقدي)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.debt > 0 ? `(عليها دين: ${c.debt} ${settings.currency})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                الفاتورة فارغة حالياً. اضغط على أي منتج لإضافته.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex-1 min-w-0 ml-2">
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {item.unitPrice} {settings.currency} / قطعة
                    </span>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-extrabold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-16 text-left font-extrabold text-emerald-600 dark:text-emerald-400 mr-2 shrink-0">
                    {item.total} {settings.currency}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Calculation & Checkout Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Discount & Payment Method */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">الخصم الفوري:</label>
              <input
                type="number"
                step="any"
                min="0"
                value={invoiceDiscount === 0 ? '' : invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">طريقة الدفع:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white focus:outline-none"
              >
                <option value="cash">💵 نقداً (Cash)</option>
                <option value="card">💳 بطاقة (Card)</option>
                <option value="debt">📝 دَين / على الحساب</option>
              </select>
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-indigo-950/20 border border-indigo-500/30 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                المبلغ الإجمالي النهائي
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                (شامل الخصم والضريبة)
              </span>
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {grandTotal.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mr-1">{settings.currency}</span>
            </div>
          </div>

          {/* Checkout Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleHoldInvoice}
              disabled={cart.length === 0}
              className="py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Pause className="w-4 h-4" />
              <span>تعليق</span>
            </button>

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="py-2.5 bg-slate-200/80 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>إلغاء</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5 transform active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>إنهاء وطباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Held Invoices Modal */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                الفواتير المعلقة ({heldSales.length})
              </h3>
              <button
                onClick={() => setShowHeldModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {heldSales.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {h.customerName} ({h.items.length} أصناف)
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      مبلغ: {h.totalAmount} {settings.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreHeld(h.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                    >
                      استرجاع
                    </button>
                    <button
                      onClick={() => deleteHeldSale(h.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Return Invoice Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                إرجاع واستبدال فاتورة
              </h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              أدخل رقم الفاتورة لإرجاع المبيعات وإعادة الكميات للمخزون تلقائياً:
            </p>
            <input
              type="text"
              value={returnInvoiceNum}
              onChange={(e) => setReturnInvoiceNum(e.target.value)}
              placeholder="مثال: INV-2026-001"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleReturnInvoiceSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                تأكيد الإرجاع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 text-right my-auto transition-all ${receiptFormat === 'A4-FR' ? 'max-w-4xl' : 'max-w-md'}`}>
            
            {/* Modal Header Controls (No Print) */}
            <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" /> تمت العملية بنجاح
                </span>
                
                {/* Format Toggle Tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold mr-2">
                  <button
                    onClick={() => setReceiptFormat('A4-FR')}
                    className={`px-3 py-1 rounded-lg transition-all ${receiptFormat === 'A4-FR' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    📄 Facture A4 (Français)
                  </button>
                  <button
                    onClick={() => setReceiptFormat('thermal-80')}
                    className={`px-3 py-1 rounded-lg transition-all ${receiptFormat === 'thermal-80' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    🧾 Ticket 80mm
                  </button>
                  <button
                    onClick={() => setReceiptFormat('thermal-58')}
                    className={`px-3 py-1 rounded-lg transition-all ${receiptFormat === 'thermal-58' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    🧾 Ticket 58mm
                  </button>
                </div>
              </div>

              <button
                onClick={() => setActiveReceipt(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 mr-auto sm:mr-0"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Printable Area */}
            <div id="printable-receipt">
              {receiptFormat === 'A4-FR' ? (
                /* --- MODÈLE DE FACTURATION (FRANÇAIS / BILINGUE) --- */
                <div className="bg-white text-slate-900 font-sans p-6 sm:p-10 rounded-xl border border-slate-300 text-left space-y-6 dir-ltr shadow-xs max-w-4xl mx-auto">
                  
                  {/* Header Top Section: Big FACTURE on Left, Store Info & Logo on Right */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-4 border-b-2 border-blue-600">
                    
                    {/* Top Left: Large FACTURE Title */}
                    <div className="space-y-1">
                      <h1 className="text-4xl sm:text-5xl font-black text-blue-600 tracking-wider uppercase">FACTURE</h1>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Commercial</p>
                    </div>

                    {/* Top Right: Store Info & Logo (Left empty if no logoUrl) */}
                    <div className="text-left sm:text-right space-y-1 text-xs text-slate-700 w-full sm:w-auto">
                      {settings.logoUrl && (
                        <div className="flex justify-start sm:justify-end mb-2">
                          <img src={settings.logoUrl} alt="Logo" className="h-14 max-w-[180px] object-contain" />
                        </div>
                      )}
                      <h2 className="text-base sm:text-lg font-extrabold text-blue-900 dir-auto">{settings.libraryName || 'Maison d\'Édition & Librairie'}</h2>
                      <p className="text-slate-600 font-medium text-xs dir-auto">{settings.address || 'Tunis, Tunisie'}</p>
                      <p className="text-slate-600 font-mono text-xs">Tél: <span className="font-bold">{settings.phone || '+216 71 123 456'}</span></p>
                      <p className="text-slate-600 font-mono text-xs">Email: {settings.email || 'contact@aicha-library.tn'}</p>
                    </div>
                  </div>

                  {/* Invoice Meta Data Box */}
                  <div className="border-2 border-blue-600 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-blue-600 text-white font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-2.5 px-3 border-r border-blue-500 w-1/4 bg-blue-600 text-white font-bold text-center">N° DE FACTURE</th>
                          <th className="py-2.5 px-3 border-r border-blue-500 w-1/4 bg-blue-600 text-white font-bold text-center">DATE</th>
                          <th className="py-2.5 px-3 border-r border-blue-500 w-1/4 bg-blue-600 text-white font-bold text-center">CLIENT</th>
                          <th className="py-2.5 px-3 w-1/4 bg-blue-600 text-white font-bold text-center">MODALITÉS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-50 border-t-2 border-blue-600">
                          <td className="py-3 px-3 border-r border-slate-300 font-mono text-blue-900 font-black text-xs text-center bg-slate-50">{activeReceipt.invoiceNumber}</td>
                          <td className="py-3 px-3 border-r border-slate-300 font-mono text-slate-900 font-bold text-xs text-center bg-slate-50">{new Date(activeReceipt.date).toLocaleDateString('fr-FR')}</td>
                          <td className="py-3 px-3 border-r border-slate-300 text-slate-900 font-bold text-xs text-center bg-slate-50 dir-auto truncate">{activeReceipt.customerName || 'Client Passage'}</td>
                          <td className="py-3 px-3 text-slate-900 font-bold text-xs text-center bg-slate-50">{activeReceipt.paymentMethod === 'cash' ? 'Comptant / Espèces' : activeReceipt.paymentMethod === 'card' ? 'Carte Bancaire' : 'Crédit'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Main Table with Centered Text across all columns */}
                  <div className="border-2 border-blue-600 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wider">
                          <th className="px-3 py-2.5 border-r border-blue-500 w-[20%] text-center bg-blue-600 text-white font-bold">BARCODE</th>
                          <th className="px-3 py-2.5 border-r border-blue-500 w-[40%] text-center bg-blue-600 text-white font-bold">DESCRIPTION</th>
                          <th className="px-2 py-2.5 border-r border-blue-500 w-[10%] text-center bg-blue-600 text-white font-bold">QTÉ</th>
                          <th className="px-3 py-2.5 border-r border-blue-500 w-[15%] text-center bg-blue-600 text-white font-bold">PRIX UNIT.</th>
                          <th className="px-3 py-2.5 w-[15%] text-center bg-blue-600 text-white font-bold">MONTANT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 bg-white font-medium">
                        {activeReceipt.items.map((i, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 border-r border-slate-200 font-mono text-slate-600 text-xs text-center truncate bg-white">{i.barcode || '—'}</td>
                            <td className="px-3 py-2.5 border-r border-slate-200 font-bold text-slate-900 text-center dir-auto break-words bg-white">{i.name}</td>
                            <td className="px-2 py-2.5 border-r border-slate-200 font-mono font-bold text-center text-slate-900 bg-white">{i.quantity}</td>
                            <td className="px-3 py-2.5 border-r border-slate-200 font-mono text-center whitespace-nowrap text-slate-900 bg-white">{i.unitPrice} <span className="text-[10px] text-slate-400">{settings.currency}</span></td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-900 text-center whitespace-nowrap bg-white">{i.total} <span className="text-[10px] text-slate-400">{settings.currency}</span></td>
                          </tr>
                        ))}
                        {/* Fill visual grid rows for clean template look */}
                        {Array.from({ length: Math.max(0, 4 - activeReceipt.items.length) }).map((_, emptyIdx) => (
                          <tr key={`empty-${emptyIdx}`} className="h-8">
                            <td className="border-r border-slate-200 bg-white"></td>
                            <td className="border-r border-slate-200 bg-white"></td>
                            <td className="border-r border-slate-200 bg-white"></td>
                            <td className="border-r border-slate-200 bg-white"></td>
                            <td className="bg-white"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-end pt-2">
                    <div className="w-full sm:w-80 border-2 border-blue-600 rounded-lg overflow-hidden text-xs bg-white">
                      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <span>SOUS-TOTAL</span>
                        <span className="font-mono">{activeReceipt.subtotal} {settings.currency}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <span>REMISE</span>
                        <span className="font-mono text-rose-600">
                          {activeReceipt.discountAmount > 0 ? `-${activeReceipt.discountAmount}` : '0,00'} {settings.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5 bg-blue-600 text-white font-black text-sm">
                        <span>TOTAL NET</span>
                        <span className="font-mono text-base">{activeReceipt.totalAmount} {settings.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Centered Thank You Message & Contact Info stacked underneath */}
                  <div className="pt-6 border-t-2 border-slate-200 text-center space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-blue-600 tracking-wider uppercase">MERCI</h3>
                      <p className="text-xs text-slate-600 font-bold">Merci pour votre confiance et votre fidélité !</p>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 max-w-lg mx-auto pt-2 border-t border-slate-100">
                      <p className="font-semibold text-slate-600">En cas de questions concernant cette facture, veuillez contacter :</p>
                      <p className="font-bold text-slate-900">{settings.ownerName || 'Le Gestionnaire'} ({activeReceipt.cashierName || 'Vendeur'}) — Tél: <span className="font-mono">{settings.phone}</span></p>
                      <p className="font-mono text-slate-600">{settings.email}</p>
                    </div>

                    <div className="pt-3 text-[10px] text-slate-400">
                      <span>Imprimé le : {new Date().toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ) : receiptFormat === 'thermal-80' ? (
                /* --- THERMAL RECEIPT 80mm --- */
                <div className="space-y-3 text-slate-900 font-mono text-xs max-w-[320px] mx-auto p-4 bg-white rounded-xl border border-slate-300 shadow-xs">
                  <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                    {settings.logoUrl && (
                      <div className="flex justify-center mb-1">
                        <img src={settings.logoUrl} alt="Logo" className="h-12 max-w-[140px] object-contain" />
                      </div>
                    )}
                    <h2 className="text-base font-black tracking-tight">{settings.libraryName || 'مكتبة عائشة الرديف'}</h2>
                    <p className="text-[10px] text-slate-600">{settings.address || 'الرديف - ولاية قفصة، تونس'}</p>
                    <p className="text-[10px] text-slate-600 font-bold">الهاتف: {settings.phone}</p>
                    {settings.receiptHeader && <p className="text-[10px] text-emerald-700 font-bold">{settings.receiptHeader}</p>}
                  </div>

                  <div className="text-[11px] space-y-0.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facture N°:</span>
                      <span className="font-bold text-blue-900">{activeReceipt.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{new Date(activeReceipt.date).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Client:</span>
                      <span className="font-bold">{activeReceipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Caissier:</span>
                      <span>{activeReceipt.cashierName}</span>
                    </div>
                  </div>

                  <table className="w-full text-left border-t border-b border-dashed border-slate-400 py-2 my-2 text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600">
                        <th className="py-1 w-[50%]">Article</th>
                        <th className="py-1 text-center w-[20%]">Qté</th>
                        <th className="py-1 text-right w-[30%]">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeReceipt.items.map((i, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 font-bold dir-auto break-words pr-1">{i.name}</td>
                          <td className="py-1.5 text-center font-bold">x{i.quantity}</td>
                          <td className="py-1.5 text-right font-bold whitespace-nowrap">{i.total} <span className="text-[9px] text-slate-400">{settings.currency}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-Total:</span>
                      <span className="font-bold">{activeReceipt.subtotal} {settings.currency}</span>
                    </div>
                    {activeReceipt.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Remise:</span>
                        <span className="font-bold">-{activeReceipt.discountAmount} {settings.currency}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-400 text-blue-900">
                      <span>TOTAL NET:</span>
                      <span className="text-blue-700">{activeReceipt.totalAmount} {settings.currency}</span>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700">{settings.receiptFooter || 'Merci pour votre visite !'}</p>
                    <div className="font-mono text-[9px] tracking-widest text-slate-400 my-1">
                      |||||||| |||| ||||||||| |||||||
                    </div>
                  </div>
                </div>
              ) : (
                /* --- THERMAL RECEIPT 58mm --- */
                <div className="space-y-2 text-slate-900 font-mono text-[11px] max-w-[220px] mx-auto p-2.5 bg-white rounded-lg border border-slate-300">
                  <div className="text-center pb-1.5 border-b border-dashed border-slate-400 space-y-0.5">
                    {settings.logoUrl && (
                      <div className="flex justify-center mb-0.5">
                        <img src={settings.logoUrl} alt="Logo" className="h-9 max-w-[100px] object-contain" />
                      </div>
                    )}
                    <h2 className="text-xs font-black">{settings.libraryName || 'مكتبة عائشة الرديف'}</h2>
                    <p className="text-[9px] text-slate-600">{settings.address || 'الرديف - قفصة'}</p>
                    <p className="text-[9px] text-slate-500">Tél: {settings.phone}</p>
                  </div>

                  <div className="text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>N°: {activeReceipt.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{new Date(activeReceipt.date).toLocaleDateString('fr-FR')}</span>
                      <span>{activeReceipt.customerName}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-400 py-1.5 my-1 space-y-1.5">
                    {activeReceipt.items.map((i, idx) => (
                      <div key={idx} className="text-[10px]">
                        <div className="font-bold truncate">{i.name}</div>
                        <div className="flex justify-between text-slate-600 pl-1">
                          <span>{i.quantity} x {i.unitPrice}</span>
                          <span className="font-bold text-slate-900">{i.total} {settings.currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-400">
                      <span>TOTAL:</span>
                      <span>{activeReceipt.totalAmount} {settings.currency}</span>
                    </div>
                  </div>

                  <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[9px] text-slate-500">
                    <p>{settings.receiptFooter || 'Merci !'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Print, Download PDF & Share Controls */}
            <div className="no-print mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPDF ? 'جاري الإنشاء...' : 'تنزيل PDF (Télécharger)'}</span>
              </button>

              <button
                onClick={handlePrintInvoice}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة مباشرة (Print)</span>
              </button>

              <button
                onClick={() => generateWhatsAppShare(activeReceipt)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>إرسال واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onScanSuccess={(barcode) => processBarcodeScan(barcode)}
        onOpenAddProduct={(barcode) => openQuickAddModal(barcode)}
        products={products}
      />

      {/* Quick Add New Product Modal for Scanned/Unregistered Barcodes */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[90vh]">
            {/* Header */}
            <div className="flex-none p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">تسجيل منتج جديد بالباركود</h3>
                  <p className="text-[11px] text-amber-200/80 font-mono">الباركود الممسوح: {quickBarcode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuickProduct(true); }} className="p-4 sm:p-5 text-right overflow-y-auto flex-1 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رمز الباركود المفهرس
                </label>
                <input
                  type="text"
                  value={quickBarcode}
                  onChange={(e) => setQuickBarcode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنتج / المادة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="مثال: كراس 96 صفحة فاخر..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الفئة / التصنيف
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold dark:text-white"
                  >
                    {appCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الماركة / العلامة
                  </label>
                  <input
                    type="text"
                    value={quickBrand}
                    onChange={(e) => setQuickBrand(e.target.value)}
                    placeholder="عام"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سعر الشراء ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={quickPurchasePrice === '' ? '' : quickPurchasePrice}
                    onChange={(e) => setQuickPurchasePrice(e.target.value === '' ? '' : e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سعر البيع ({settings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={quickSalePrice === '' ? '' : quickSalePrice}
                    onChange={(e) => setQuickSalePrice(e.target.value === '' ? '' : e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الكمية بالدرج
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quickStock}
                    onChange={(e) => setQuickStock(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
                >
                  إلغاء العملية
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveQuickProduct(false)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ في المخزن فقط</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>حفظ وإضافة للسلة فوراً</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
