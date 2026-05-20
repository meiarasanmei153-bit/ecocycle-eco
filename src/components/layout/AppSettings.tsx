import React from 'react';
import { motion } from 'motion/react';
import { X, Moon, Sun, Bell, Shield, Smartphone, Globe, Palette } from 'lucide-react';

interface AppSettingsProps {
  onClose: () => void;
}

export function AppSettings({ onClose }: AppSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="neo-card bg-white w-full max-w-lg overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">App Settings</h2>
            <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mt-1">Configure your experience</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 border-2 border-white/20 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Appearance</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-tight">Dark Mode</span>
              </div>
              <div className="h-6 w-12 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full border border-slate-300"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-eco-green" />
                <span className="text-xs font-black uppercase tracking-tight">Eco Theme</span>
              </div>
              <div className="h-6 w-12 bg-eco-green rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full border border-black shadow-sm"></div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Notifications</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-amber-500" />
                <span className="text-xs font-black uppercase tracking-tight">Pickup Updates</span>
              </div>
              <div className="h-6 w-12 bg-black rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-slate-600" />
                <span className="text-xs font-black uppercase tracking-tight">SMS Alerts</span>
              </div>
              <div className="h-6 w-12 bg-black rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
              </div>
            </div>
          </section>

          <div className="pt-4 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 neo-button bg-slate-100 text-slate-600 border-slate-200 h-14 text-xs font-black uppercase"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 neo-button bg-indigo-600 text-white h-14 text-xs font-black uppercase"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
