import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Truck, Recycle, MapPin, Calendar, Package, Smartphone, ShieldCheck, ChevronRight, QrCode, User, Navigation, Leaf } from 'lucide-react';
import { PickupRequest } from '../../types';
import { cn } from '../../lib/utils';

interface EnhancedTrackingProps {
  request: PickupRequest;
  onClose: () => void;
}

export function EnhancedTracking({ request, onClose }: EnhancedTrackingProps) {
  const allSteps = [
    { id: 'requested', label: 'Requested', icon: <Clock size={16} />, desc: 'Collection scheduled' },
    { id: 'assigned', label: 'Assigned', icon: <User size={16} />, desc: 'Recycler confirmed' },
    { id: 'on_the_way', label: 'On Way', icon: <Navigation size={16} />, desc: 'Agent incoming' },
    { id: 'collected', label: 'Collected', icon: <Package size={16} />, desc: 'Waste received' },
    { id: 'recycling', label: 'Processing', icon: <Recycle size={16} />, desc: 'Eco-sorting' },
    { id: 'completed', label: 'Verified', icon: <ShieldCheck size={16} />, desc: 'Carbon offset added' },
  ];

  const statusOrder = ['requested', 'assigned', 'on_the_way', 'collected', 'recycling', 'completed'];
  const currentIndex = statusOrder.indexOf(request.status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel w-full max-w-5xl mx-auto overflow-hidden text-slate-900"
    >
      <div className="eco-gradient p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                Active Tracking
              </span>
              <span className="text-[10px] font-bold opacity-60">ID: {request.id.slice(0, 12)}</span>
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Quest for Net Zero</h2>
          </div>
          <button 
            onClick={onClose}
            className="h-12 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Global Progress Line */}
        <div className="mt-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 rounded-full" />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
            className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
          />
          <div className="relative flex justify-between">
            {allSteps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isPast ? "bg-white border-white text-eco-green" : 
                    isCurrent ? "bg-white border-white text-eco-blue scale-125 shadow-lg" : 
                    "bg-eco-green border-white/30 text-white"
                  )}>
                    {isPast ? <CheckCircle2 size={16} /> : step.icon}
                  </div>
                  <span className={cn(
                    "mt-3 text-[9px] font-black uppercase tracking-widest hidden md:block",
                    isCurrent ? "text-white" : "opacity-40"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white/30">
        {/* Left: Map & Real-time Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card h-[400px] relative overflow-hidden bg-slate-100 flex items-center justify-center">
             {/* Map Placeholder */}
             <div className="absolute inset-0 bg-eco-blue/5">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
             </div>
             <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                  <Navigation className="text-eco-blue" size={32} />
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Live Route Visualization</p>
             </div>
             
             {/* Overlay Info */}
             <div className="absolute bottom-6 left-6 right-6 flex gap-4">
               <div className="flex-1 glass-card p-4 flex items-center gap-4 bg-white/90">
                 <div className="h-10 w-10 bg-eco-blue/10 rounded-xl flex items-center justify-center text-eco-blue">
                   <Clock size={20} />
                 </div>
                 <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Estimated Arrival</p>
                   <p className="text-sm font-black uppercase">{request.pickupTime || '10:30 AM'}</p>
                 </div>
               </div>
               <div className="flex-1 glass-card p-4 flex items-center gap-4 bg-white/90">
                 <div className="h-10 w-10 bg-eco-green/10 rounded-xl flex items-center justify-center text-eco-green">
                   <Navigation size={20} />
                 </div>
                 <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Distance</p>
                   <p className="text-sm font-black uppercase">1.2 KM Away</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Sustainability Impact</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Leaf size={16} className="text-eco-green" />
                    <span className="text-xs font-bold text-slate-600">Points to Earn</span>
                  </div>
                  <span className="text-lg font-black text-eco-green italic">+{request.pointsEarned || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-eco-blue" />
                    <span className="text-xs font-bold text-slate-600">Trust Verification</span>
                  </div>
                  <span className="text-[9px] font-black text-white bg-slate-900 px-2 py-0.5 rounded uppercase">Blockchain</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-center items-center gap-3 text-center">
                <div className="h-20 w-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                   <QrCode size={40} className="text-slate-300" />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-900">Pickup Pass</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Show this to the agent on arrival</p>
                </div>
            </div>
          </div>
        </div>

        {/* Right: Agent & Waste Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-slate-900 text-white">
            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-6">Assigned Recycler</h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-white/10 rounded-2xl border border-white/20 overflow-hidden flex items-center justify-center">
                {request.recyclerName ? (
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.recyclerId}`} alt="Agent" />
                ) : (
                  <User size={32} className="text-white/40" />
                )}
              </div>
              <div>
                <h5 className="text-lg font-black italic tracking-tighter uppercase">{request.recyclerName || 'Assigning...'}</h5>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{request.recyclerVehicle || 'Eco-Van 04'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 h-12 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5">
                <Smartphone size={16} />
                <span className="text-[10px] font-black uppercase">Call Agent</span>
              </button>
              <div className="flex gap-2">
                 <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="text-[7px] font-black text-white/40 uppercase mb-1">Badge</p>
                   <p className="text-[9px] font-black uppercase">Certified</p>
                 </div>
                 <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="text-[7px] font-black text-white/40 uppercase mb-1">Rating</p>
                   <p className="text-[9px] font-black uppercase text-amber-400">4.9 ★</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Waste Identification</h4>
            <div className="space-y-6">
              {request.imageURL ? (
                <div className="relative group overflow-hidden rounded-2xl border border-slate-100">
                  <img 
                    src={request.imageURL} 
                    alt="E-waste" 
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase border border-white/20">
                    AI Scanned
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-3">
                  <Package size={40} />
                  <p className="text-[9px] font-black uppercase">No visual data</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase">Category</span>
                  <span className="font-black uppercase text-slate-900">{request.aiCategory || request.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase">Estimation</span>
                  <span className="font-black uppercase text-slate-900">{request.quantityEstimation || '1.5 - 2 KG'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase">Value</span>
                  <span className="font-black uppercase text-eco-green">₹{request.estimatedValue || 450}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
