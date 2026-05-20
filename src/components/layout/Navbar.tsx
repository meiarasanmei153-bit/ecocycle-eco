import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, UserCircle, ChevronLeft, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';
import { AppSettings } from './AppSettings';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Link to="/" className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-eco-green border-2 border-black text-white shadow-neo-sm"
                >
                  <Leaf size={24} />
                </motion.div>
                <span className="text-2xl font-black tracking-tighter uppercase">EcoCycle</span>
              </Link>
              
              <AnimatePresence>
                {!isHome && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => navigate(-1)}
                    className="absolute -bottom-8 left-0 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                  >
                    <ChevronLeft size={12} />
                    <span>Previous</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-4 ml-6">
                <NavLink to="/profile" active={location.pathname === '/profile'}>
                  <UserCircle size={16} />
                  Profile
                </NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="mr-6 flex items-center gap-2">
                  <div className="bg-white border-2 border-black px-4 py-1.5 rounded-full font-bold shadow-neo-sm flex items-center gap-3">
                    <span className="text-eco-green text-sm uppercase tracking-tight">{user.points} PTS</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowSettings(true)}
                  className="h-10 w-10 flex items-center justify-center bg-white border-2 border-black rounded-xl shadow-neo-sm hover:bg-slate-50 transition-all mr-2"
                >
                  <Settings size={18} />
                </button>

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 border-2 border-transparent hover:border-black px-3 py-2 text-xs font-black uppercase transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showSettings && (
          <AppSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2",
        active ? "bg-black text-white border-black" : "bg-white text-slate-400 border-transparent hover:border-slate-200"
      )}
    >
      {children}
    </Link>
  );
}
