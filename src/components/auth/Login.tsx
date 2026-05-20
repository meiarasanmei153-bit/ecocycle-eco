import React from 'react';
import { motion } from 'motion/react';
import { Leaf, LogIn, Shield, Recycle, Award, Globe, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export function Login() {
  const [selectedRole, setSelectedRole] = React.useState<'user' | 'recycler'>('user');
  const [authMode, setAuthMode] = React.useState<'google' | 'email'>('google');
  const [emailMode, setEmailMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loginWithGoogle = () => {
    localStorage.setItem('preferred_role', selectedRole);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    localStorage.setItem('preferred_role', selectedRole);

    try {
      if (emailMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border-2 border-black rounded-[40px] shadow-neo-lg p-12 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mx-auto h-20 w-20 bg-eco-green border-2 border-black rounded-3xl flex items-center justify-center text-white mb-6 shadow-neo"
        >
          <Leaf size={40} />
        </motion.div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">EcoCycle</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-bold uppercase text-[10px] tracking-widest">
          Join the circular economy
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {(['user', 'recycler'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={cn(
                "p-3 rounded-2xl border-2 border-black transition-all text-[10px] font-black uppercase tracking-widest",
                selectedRole === role 
                  ? "bg-black text-white shadow-neo-sm -translate-y-1" 
                  : "bg-white text-slate-400 hover:bg-slate-50"
              )}
            >
              {role}
            </button>
          ))}
        </div>

        {authMode === 'google' ? (
          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="neo-button w-full h-14 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest"
            >
              <LogIn size={18} />
              <span>Continue with Google</span>
            </button>
            <button 
              onClick={() => setAuthMode('email')}
              className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-black transition-colors"
            >
              Or use email address
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {emailMode === 'signup' && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neo-input w-full pl-12 h-14 text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input w-full pl-12 h-14 text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full pl-12 h-14 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-button w-full h-14 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (emailMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>

            <div className="flex flex-col items-center gap-4 mt-6">
              <button 
                type="button"
                onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-black transition-colors"
              >
                {emailMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('google')}
                className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline"
              >
                Back to Google Sign In
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-xs text-slate-400 font-medium">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-50 border-2 border-black shadow-neo-sm transform transition-transform hover:scale-105">
      <div className="p-2 bg-white rounded-xl border border-slate-100">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}
