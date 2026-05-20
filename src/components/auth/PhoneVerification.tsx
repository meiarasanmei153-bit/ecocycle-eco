import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CheckCircle2, ChevronRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface PhoneVerificationProps {
  userId: string;
  currentPhone?: string;
  onSuccess: (phone: string) => void;
  onClose: () => void;
}

export function PhoneVerification({ userId, currentPhone, onSuccess, onClose }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Hidden recaptcha verifier
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'Failed to send OTP. Please check the number format (e.g., +1234567890)');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;

    setLoading(true);
    setError(null);

    try {
      await confirmationResult.confirm(otp);
      
      // Update firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phone: phoneNumber,
        phoneVerified: true
      });

      onSuccess(phoneNumber);
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 transition-all"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="neo-card bg-white w-full max-w-sm overflow-hidden"
      >
        <div id="recaptcha-container"></div>
        
        <div className="bg-eco-green p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Mobile Verify</h2>
            <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mt-1">Step {step === 'phone' ? '1' : '2'} of 2</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 border-2 border-white/20 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-eco-green/10 rounded-2xl flex items-center justify-center text-eco-green">
                    <Smartphone size={32} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm font-bold text-slate-600">Enter your mobile number with country code</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic uppercase font-black">Example: +919876543210</p>
                </div>

                <div className="relative">
                  <Smartphone className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", loading ? "text-eco-green animate-pulse" : "text-slate-400")} size={18} />
                  <input 
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="neo-input w-full pl-12 h-14 font-black"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="text-[9px] font-bold uppercase leading-tight">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phoneNumber.startsWith('+')}
                  className="neo-button w-full h-14 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Send OTP
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-4"
              >
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-eco-green/10 rounded-2xl flex items-center justify-center text-eco-green">
                    <ShieldCheck size={32} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm font-bold text-slate-600">Enter the 6-digit code</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic uppercase font-black">Sent to {phoneNumber}</p>
                </div>

                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="neo-input w-full h-16 text-center text-3xl font-black tracking-[0.5em] focus:tracking-[0.5em] placeholder:text-slate-100"
                />

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="text-[9px] font-bold uppercase leading-tight">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="neo-button w-full h-14 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Verify OTP
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-black transition-colors"
                >
                  Change Number
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
