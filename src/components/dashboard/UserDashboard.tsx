import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { PickupRequest } from '../../types';
import { cn } from '../../lib/utils';
import { SustainabilityMetrics } from './SustainabilityMetrics';
import { SustainabilityAnalytics } from './SustainabilityAnalytics';
import { PickupHistoryList } from '../pickup/PickupHistoryList';
import { EnhancedTracking } from '../pickup/EnhancedTracking';
import { ProfileEdit } from './ProfileEdit';
import { 
  Award, 
  Plus, 
  MapPin, 
  User, 
  Settings, 
  Smartphone, 
  ShoppingBag, 
  Store, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  Zap,
  Globe
} from 'lucide-react';

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PickupRequest));
      setRequests(docs);
    });

    return unsubscribe;
  }, [user]);

  if (!user) return null;

  const activeRequest = requests.find(r => r.status !== 'completed');

  return (
    <div className="min-h-screen pb-20">
      {/* Immersive Welcome Hub */}
      <div className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-slate-50">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-eco-green/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-eco-blue/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-6 mb-8"
              >
                <div className="relative group">
                  <div className="h-28 w-28 rounded-[2.5rem] p-1 bg-gradient-to-br from-eco-green to-eco-blue shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <div className="h-full w-full rounded-[2.2rem] overflow-hidden bg-white flex items-center justify-center">
                      {user.avatarURL ? (
                        <img src={user.avatarURL} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User size={48} className="text-slate-200" />
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfileEdit(true)}
                    className="absolute -bottom-1 -right-1 h-10 w-10 bg-white shadow-xl rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-eco-green border border-slate-100"
                  >
                    <Settings size={18} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-0.5 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                        {user.role} Hub
                     </span>
                     <span className="px-3 py-0.5 bg-eco-green/10 text-eco-green rounded-full text-[9px] font-black uppercase tracking-widest border border-eco-green/20">
                        Verified Guardian
                     </span>
                  </div>
                  <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 leading-[0.9]">
                    EcoCycle <span className="text-eco-green italic">OS</span>
                  </h1>
                  <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} className="text-eco-blue" />
                    Global Sustainability Rank: #1,204
                  </p>
                </div>
              </motion.div>

              <SustainabilityMetrics user={user} />
            </div>

            <div className="w-full lg:w-[400px] flex flex-col gap-6">
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate('/pickup')}
                 className="eco-button h-24 text-xl italic tracking-tighter uppercase"
               >
                 <Plus size={24} className="animate-pulse" />
                 Schedule Collection
               </motion.button>
               
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => navigate('/rewards')}
                    className="glass-card p-6 flex flex-col items-center gap-3 hover:border-eco-green/30"
                  >
                    <ShoppingBag className="text-eco-green" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Market</span>
                  </button>
                  <button 
                    onClick={() => navigate('/seller')}
                    className="glass-card p-6 flex flex-col items-center gap-3 hover:border-eco-blue/30"
                  >
                    <Store className="text-eco-blue" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller Hub</span>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Tracking Mini-Card */}
            <AnimatePresence>
              {activeRequest && !selectedRequest && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="glass-card p-1 overflow-hidden"
                >
                  <button 
                    onClick={() => setSelectedRequest(activeRequest)}
                    className="w-full p-6 text-left hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 eco-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-eco-green/20">
                         <Clock size={32} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="h-2 w-2 rounded-full bg-eco-blue animate-ping" />
                           <p className="text-[10px] font-black uppercase text-eco-blue tracking-widest">Live Collection in tracking</p>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">
                          {activeRequest.status.replace('_', ' ')}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                           Estimated Completion: 45 Mins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="hidden md:block text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Open Tracker</span>
                       <div className="h-12 w-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-eco-green group-hover:border-eco-green/30 group-hover:bg-eco-green/5 transition-all">
                          <ArrowUpRight size={20} />
                       </div>
                    </div>
                  </button>
                  <div className="h-1.5 w-full bg-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: activeRequest.status === 'requested' ? '20%' : activeRequest.status === 'assigned' ? '40%' : '60%' }}
                      className="h-full eco-gradient shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SustainabilityAnalytics />
            
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black uppercase text-slate-900 italic tracking-tighter">Collection History</h3>
                 <button className="text-[9px] font-black uppercase text-slate-400 hover:text-eco-blue transition-colors">See All</button>
               </div>
               <PickupHistoryList requests={requests} />
            </div>
          </div>

          {/* Right Rail: Notifications & Gamification */}
          <div className="space-y-8">
             {/* Verification Alert */}
             {!user.phoneVerified && (
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="glass-card p-6 bg-amber-500 text-white shadow-xl shadow-amber-500/20"
               >
                 <div className="flex items-start gap-4">
                   <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                     <AlertCircle size={20} />
                   </div>
                   <div>
                     <h4 className="text-sm font-black uppercase italic tracking-tighter">Mobile Sync Required</h4>
                     <p className="text-[10px] font-bold text-white/70 uppercase leading-relaxed mt-1">Get real-time SMS alerts for recyclers</p>
                     <button 
                       onClick={() => setShowProfileEdit(true)}
                       className="mt-4 px-4 h-9 bg-white text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                     >
                       <Smartphone size={12} />
                       Sync Device
                     </button>
                   </div>
                 </div>
               </motion.div>
             )}

             {/* Green Badges Gallery */}
             <div className="glass-card p-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Green Badges Earned</h4>
                <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="aspect-square glass-card bg-slate-50/50 flex items-center justify-center border-dashed group cursor-pointer hover:border-eco-green/40">
                        <Award className={cn("text-slate-200 group-hover:scale-110 transition-transform", i === 1 && "text-amber-400")} size={24} />
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 text-[9px] font-black uppercase text-slate-400 hover:text-eco-green transition-colors flex items-center justify-center gap-2">
                   View Achievement Map <ArrowUpRight size={12} />
                </button>
             </div>

             {/* Sustainability Tips Card */}
             <div className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                   <Zap size={180} />
                </div>
                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Eco Tip</h4>
                <p className="text-xs font-bold text-white/60 leading-relaxed uppercase">
                   Recycling 1 high-performance server saves enough energy to power a home for 30 days.
                </p>
                <button className="mt-6 text-[10px] font-black text-eco-green uppercase tracking-widest hover:underline">Learn More</button>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <EnhancedTracking 
              request={selectedRequest} 
              onClose={() => setSelectedRequest(null)} 
            />
          </div>
        )}

        {showProfileEdit && (
          <ProfileEdit 
            user={user} 
            onClose={() => setShowProfileEdit(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
