import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PickupRequest } from '../../types';
import { 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Calendar, 
  User, 
  Navigation, 
  Clock, 
  Package, 
  ChevronRight, 
  Smartphone,
  TrendingUp,
  DollarSign,
  Search,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

export function RecyclerDashboard() {
  const { user: authUser } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PickupRequest)));
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (requestId: string, status: any) => {
    setLoading(requestId);
    try {
      const requestRef = doc(db, 'requests', requestId);
      const updateData: any = { status };
      
      // If assigning to self
      if (status === 'assigned') {
        updateData.recyclerId = authUser?.uid;
        updateData.recyclerName = authUser?.name;
        updateData.recyclerPhone = authUser?.phone;
        updateData.recyclerVehicle = 'Eco-Drive 04'; // Mock
      }

      await updateDoc(requestRef, updateData);
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setLoading(null);
    }
  };

  const activeTasks = requests.filter(r => r.status !== 'completed' && r.status !== 'requested');
  const incomingTasks = requests.filter(r => r.status === 'requested');

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
             <span className="px-3 py-1 bg-eco-blue/10 text-eco-blue rounded-full text-[9px] font-black uppercase tracking-widest border border-eco-blue/20">Agent Terminal</span>
             <span className="h-2 w-2 rounded-full bg-eco-green animate-pulse" />
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Connection</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.9]">
            Agent <span className="text-eco-blue italic">Logistics</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Optimizing global recycling routes</p>
        </div>

        <div className="flex gap-4">
           <div className="glass-card px-8 py-5 flex items-center gap-4 bg-slate-900 text-white">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-eco-green">
                 <DollarSign size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase text-white/40 mb-1">Today's Payout</p>
                 <p className="text-xl font-black italic tracking-tighter">₹2,450.00</p>
              </div>
           </div>
           <div className="glass-card px-8 py-5 flex items-center gap-4">
              <div className="h-10 w-10 bg-eco-blue/10 rounded-xl flex items-center justify-center text-eco-blue">
                 <TrendingUp size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Impact Core</p>
                 <p className="text-xl font-black italic tracking-tighter">Alpha-9</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Active Route & Task */}
        <div className="lg:col-span-2 space-y-8">
           {selectedRequest ? (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-panel overflow-hidden"
             >
                <div className="eco-gradient p-8 text-white relative">
                   <button 
                     onClick={() => setSelectedRequest(null)}
                     className="absolute top-8 right-8 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center"
                   >
                     <ChevronRight size={20} />
                   </button>
                   <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60 italic">Navigation Engine Active</p>
                   <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Task Path: {selectedRequest.id.slice(0, 8)}</h3>
                   
                   <div className="mt-8 flex items-center gap-12">
                      <div>
                         <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">ETA</p>
                         <p className="text-lg font-black italic">12:30 PM</p>
                      </div>
                      <div className="h-12 w-px bg-white/20" />
                      <div>
                         <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Distance</p>
                         <p className="text-lg font-black italic">2.4 KM</p>
                      </div>
                      <div className="h-12 w-px bg-white/20" />
                      <div>
                         <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Client</p>
                         <p className="text-lg font-black italic uppercase">{selectedRequest.userName || 'Eco Hero'}</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 space-y-8 bg-white/30 backdrop-blur-md">
                   <div className="glass-card h-[350px] relative overflow-hidden bg-slate-100 flex items-center justify-center">
                      <div className="absolute inset-0 bg-eco-blue/5" />
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                      <div className="relative z-10 flex flex-col items-center gap-4">
                         <div className="h-12 w-12 bg-white rounded-full shadow-lg flex items-center justify-center text-eco-blue">
                            <Navigation size={24} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Map Visualization</p>
                      </div>
                      
                      {/* Interaction HUD */}
                      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => updateStatus(selectedRequest.id, 'collected')}
                           className="h-14 bg-eco-green text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-eco-green/20"
                         >
                            <Package size={18} /> Confirm Collection
                         </button>
                         <button className="h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-black/20">
                            <Smartphone size={18} /> Contact Client
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card p-6 border-slate-100 bg-white/80">
                         <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-6">Request Intel</h4>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                               <span className="text-[10px] font-bold text-slate-500 uppercase">Category</span>
                               <span className="text-xs font-black uppercase text-slate-900">{selectedRequest.category}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                               <span className="text-[10px] font-bold text-slate-500 uppercase">Address</span>
                               <span className="text-xs font-black uppercase text-slate-900 truncate max-w-[200px]">{selectedRequest.address}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                               <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Vol</span>
                               <span className="text-xs font-black uppercase text-slate-900">{selectedRequest.quantityEstimation || '15-20 KG'}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="glass-card p-4 border-slate-100 bg-white/80">
                         {selectedRequest.imageURL && (
                           <img src={selectedRequest.imageURL} className="w-full h-full object-cover rounded-2xl" />
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-sm font-black uppercase tracking-tighter italic">Active Quest Log</h2>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{activeTasks.length} Units Pipeline</span>
                </div>
                
                {activeTasks.length === 0 ? (
                  <div className="glass-card p-20 text-center border-dashed bg-white/30">
                     <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Truck size={32} className="text-slate-100" />
                     </div>
                     <p className="text-xs font-black uppercase italic text-slate-900">Fleet Resting</p>
                     <p className="text-[10px] mt-2 font-bold uppercase text-slate-400 tracking-widest">Select an incoming request to start your route</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {activeTasks.map(task => (
                       <motion.div 
                         key={task.id}
                         whileHover={{ scale: 1.02 }}
                         className="glass-card p-6 bg-white/80 border-slate-100 group cursor-pointer"
                         onClick={() => setSelectedRequest(task)}
                       >
                          <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 eco-gradient rounded-xl flex items-center justify-center text-white">
                                   <Truck size={20} />
                                </div>
                                <div>
                                   <p className="text-[8px] font-black uppercase text-slate-400">Route Node</p>
                                   <h4 className="text-sm font-black uppercase italic tracking-tight">{task.id.slice(0, 8)}</h4>
                                </div>
                             </div>
                             <div className={cn(
                               "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                               task.status === 'assigned' ? "bg-amber-100 text-amber-600" : "bg-eco-blue/10 text-eco-blue"
                             )}>
                                {task.status.replace('_', ' ')}
                             </div>
                          </div>
                          <div className="space-y-3 pt-6 border-t border-slate-50">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 truncate">
                               <MapPin size={12} className="text-eco-blue" />
                               {task.address}
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400">{task.category}</span>
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-900 group-hover:text-eco-green transition-colors">
                                   Continue Quest <ChevronRight size={12} />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Right Rail: Incoming Signals */}
        <div className="space-y-8">
           <div className="glass-card p-8 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tighter italic border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                <Smartphone size={16} className="text-eco-blue" />
                Incoming Signals ({incomingTasks.length})
              </h3>
              
              <div className="space-y-4">
                 {incomingTasks.length === 0 ? (
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center py-12">No pending requests in your sector</p>
                 ) : (
                   incomingTasks.map(task => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="text-xs font-black uppercase italic tracking-tight">{task.category}</p>
                               <span className="text-[9px] font-bold text-white/40 flex items-center gap-1 mt-1">
                                  <MapPin size={10} /> {task.address.split(',')[0]}
                               </span>
                            </div>
                            <span className="text-[9px] font-black text-eco-green">₹{task.estimatedValue || 450}</span>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => updateStatus(task.id, 'assigned')}
                              className="flex-1 h-9 bg-eco-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-eco-blue/20"
                            >
                               Accept
                            </button>
                            <button className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/40 transition-colors">
                               <X size={14} />
                            </button>
                         </div>
                      </motion.div>
                   ))
                 )}
              </div>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Recycler Achievements</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 eco-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Check size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black italic tracking-tighter uppercase">Route Master</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">200+ Successful Collections</p>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-50">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3">Today's Performance</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-eco-blue w-2/3" />
                    </div>
                    <div className="flex justify-between mt-2">
                       <span className="text-[8px] font-bold text-slate-400 uppercase">8/12 Goals met</span>
                       <span className="text-[8px] font-black text-eco-blue uppercase">Keep going!</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
