import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  QrCode, 
  CheckCircle2, 
  Loader2,
  Lock,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentDialogProps {
  amount: number;
  onSuccess: (method: string) => void;
  onClose: () => void;
}

export function PaymentDialog({ amount, onSuccess, onClose }: PaymentDialogProps) {
  const [step, setStep] = useState<'selection' | 'processing' | 'qr' | 'success'>('selection');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const methods = [
    { id: 'upi', label: 'UPI / QR', icon: <QrCode size={20} />, sub: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Card Payment', icon: <CreditCard size={20} />, sub: 'Credit or Debit Cards' },
    { id: 'wallet', label: 'Eco Wallet', icon: <Wallet size={20} />, sub: 'Pay with Eco Points' },
    { id: 'cash', label: 'Cash on Pickup', icon: <Truck size={20} />, sub: 'Pay agent directly' },
  ];

  const handleSelection = (id: string) => {
    setSelectedMethod(id);
    if (id === 'upi') {
      setStep('qr');
    } else if (id === 'cash') {
      handleSuccess('cash');
    } else {
      setStep('processing');
      setTimeout(() => setStep('success'), 2000);
    }
  };

  const handleSuccess = (method: string) => {
    setStep('success');
    setTimeout(() => {
      onSuccess(method);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-md overflow-hidden bg-white/90"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">Secure Checkout</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order #EC-88321</p>
           </div>
           <button 
             onClick={onClose}
             className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        <div className="p-8">
           <AnimatePresence mode="wait">
             {step === 'selection' && (
               <motion.div
                 key="selection"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-6"
               >
                 <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black italic tracking-tighter text-slate-900">₹{amount.toFixed(2)}</span>
                 </div>

                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Select Method</p>
                   {methods.map(method => (
                     <button
                       key={method.id}
                       onClick={() => handleSelection(method.id)}
                       className="w-full glass-card p-4 flex items-center gap-4 hover:border-eco-green/40 hover:bg-eco-green/5 group text-left"
                     >
                       <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-eco-green transition-colors">
                         {method.icon}
                       </div>
                       <div className="flex-1">
                         <h4 className="text-xs font-black uppercase tracking-tight">{method.label}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{method.sub}</p>
                       </div>
                       <ChevronRight size={16} className="text-slate-200 group-hover:text-eco-green group-hover:translate-x-1 transition-all" />
                     </button>
                   ))}
                 </div>
                 
                 <div className="pt-4 flex items-center justify-center gap-2 text-slate-300">
                   <Lock size={12} />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                 </div>
               </motion.div>
             )}

             {step === 'qr' && (
               <motion.div
                 key="qr"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center text-center py-4"
               >
                 <div className="h-64 w-64 bg-white p-6 rounded-3xl shadow-xl mb-8 border border-slate-100 flex items-center justify-center relative">
                    <QrCode size={180} className="text-slate-900" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-xl shadow-lg border border-slate-50">
                       <Smartphone size={24} className="text-eco-blue" />
                    </div>
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-tight">Scan with any UPI App</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-8">
                   Open Google Pay, PhonePe or Paytm and scan the QR code to finish paying ₹{amount}
                 </p>
                 <button 
                   onClick={() => handleSuccess('upi')}
                   className="mt-8 eco-button w-full"
                 >
                   Skip & Simulate Success
                 </button>
               </motion.div>
             )}

             {step === 'processing' && (
               <motion.div
                 key="processing"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center py-20 gap-6"
               >
                 <div className="relative">
                    <Loader2 size={64} className="text-eco-green animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <ShieldCheck size={24} className="text-eco-green animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center">
                   <h4 className="text-sm font-black uppercase tracking-tight">Verifying Payment</h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedMethod?.toUpperCase()} Gateway Link Connected</p>
                 </div>
               </motion.div>
             )}

             {step === 'success' && (
               <motion.div
                 key="success"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center text-center py-4"
               >
                 <div className="h-24 w-24 bg-eco-green/10 text-eco-green rounded-full flex items-center justify-center mb-8 relative">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-eco-green rounded-full"
                    />
                 </div>
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Payment Successful</h4>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Points have been allocated</p>
                 
                 <div className="w-full mt-12 grid grid-cols-2 gap-3">
                   <button className="h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all text-[9px] font-black uppercase">
                     <Download size={14} /> Invoice
                   </button>
                   <button className="h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 hover:border-eco-blue text-slate-600 transition-all text-[9px] font-black uppercase">
                     <Share2 size={14} /> Share
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
