import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Truck, 
  DollarSign, 
  Recycle,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'delivery' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Function to add a notification (can be exposed via custom event or context)
  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ ...notif, id, timestamp: new Date() } as Notification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Mock initial notifications to show design
  useEffect(() => {
     const timer = setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Quest Completed',
          message: 'Your e-waste has been successfully recycled. +500 Eco Points awarded.'
        });
     }, 3000);
     return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-24 right-6 z-[100] w-full max-w-sm pointer-events-none space-y-4">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="pointer-events-auto"
          >
            <div className="glass-panel p-5 overflow-hidden bg-white/95 border-slate-200/50 shadow-2xl flex gap-4">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border",
                notif.type === 'success' && "bg-eco-green/10 text-eco-green border-eco-green/20",
                notif.type === 'error' && "bg-red-500/10 text-red-500 border-red-500/20",
                notif.type === 'info' && "bg-eco-blue/10 text-eco-blue border-eco-blue/20",
                notif.type === 'delivery' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                notif.type === 'payment' && "bg-indigo-600/10 text-indigo-600 border-indigo-600/20",
              )}>
                 {notif.type === 'success' && <CheckCircle2 size={24} />}
                 {notif.type === 'error' && <AlertCircle size={24} />}
                 {notif.type === 'info' && <Info size={24} />}
                 {notif.type === 'delivery' && <Truck size={24} />}
                 {notif.type === 'payment' && <DollarSign size={24} />}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                 <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-tighter italic">{notif.title}</h4>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Now</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-2">
                   {notif.message}
                 </p>
              </div>

              <button 
                onClick={() => removeNotification(notif.id)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
              
              <div className="absolute bottom-0 left-0 h-1 bg-eco-green/20 w-full overflow-hidden">
                 <motion.div 
                   initial={{ width: '100%' }}
                   animate={{ width: '0%' }}
                   transition={{ duration: 5, ease: 'linear' }}
                   className={cn(
                     "h-full",
                     notif.type === 'success' && "bg-eco-green",
                     notif.type === 'error' && "bg-red-500",
                     notif.type === 'info' && "bg-eco-blue",
                     notif.type === 'delivery' && "bg-amber-500",
                     notif.type === 'payment' && "bg-indigo-600",
                   )}
                 />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
