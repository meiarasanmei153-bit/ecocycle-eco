import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Mail, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export function EmailVerificationBanner() {
  const { firebaseUser, sendVerificationEmail, refreshUser } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!firebaseUser || firebaseUser.emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendVerificationEmail();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error('Failed to resend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b-2 border-black flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-4 sticky top-[4rem] z-40">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 border border-amber-200">
          <Mail size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
            Verification Required
            <AlertCircle size={10} />
          </p>
          <p className="text-[10px] font-bold text-amber-700/70 uppercase">
            Check your inbox to verify your email address
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={handleResend}
          disabled={loading || sent}
          className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-white border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-0 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale"
        >
          {sent ? (
             <>
               <CheckCircle2 size={14} className="text-eco-green" />
               Sent
             </>
          ) : (
            <>
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Resend Link
            </>
          )}
        </button>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-black text-white border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-0 active:translate-y-0 transition-all disabled:opacity-50"
        >
          {refreshing ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight size={14} />}
          I Verified
        </button>
      </div>
    </div>
  );
}
