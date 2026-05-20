import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Clock, Recycle, Calendar, MapPin, CheckCircle2, Navigation, ArrowUpRight, Ban } from 'lucide-react';
import { PickupRequest } from '../../types';
import { cn } from '../../lib/utils';
import { EnhancedTracking } from './EnhancedTracking';

interface PickupHistoryListProps {
  requests: PickupRequest[];
}

export function PickupHistoryList({ requests }: PickupHistoryListProps) {
  const [trackingRequestId, setTrackingRequestId] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-slate-400 border-dashed bg-white/30 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-4 p-4">
          {Array(40).fill(0).map((_, i) => <Recycle key={i} size={24} />)}
        </div>
        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <Ban size={32} className="text-slate-200" />
        </div>
        <p className="font-black uppercase text-xs tracking-widest italic text-slate-900">Archive Offline</p>
        <p className="text-[10px] mt-2 font-bold uppercase text-slate-400">Your collection journey begins with your first request</p>
      </div>
    );
  }

  const activeTrackingRequest = requests.find(r => r.id === trackingRequestId);

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "glass-card p-4 group transition-all duration-300",
            trackingRequestId === request.id ? "border-eco-green/50 ring-4 ring-eco-green/5 bg-eco-green/5" : "hover:border-slate-200"
          )}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 shrink-0 rounded-2xl p-0.5 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm overflow-hidden">
              <div className="h-full w-full rounded-[0.9rem] overflow-hidden bg-white flex items-center justify-center">
                {request.imageURL ? (
                  <img src={request.imageURL} alt="Waste" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Recycle size={32} className="text-slate-100" />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Quest ID: {request.id.slice(0, 8)}</span>
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl italic leading-none group-hover:text-eco-green transition-colors">{request.category}</h4>
                </div>
                <StatusBadge status={request.status} />
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                  <Calendar size={12} className="text-eco-green" />
                  {request.pickupDate}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 truncate max-w-[200px]">
                  <MapPin size={12} className="text-eco-blue" />
                  <span className="truncate">{request.address}</span>
                </span>
                {request.pointsEarned && (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-eco-green/10 text-eco-green rounded-full border border-eco-green/20">
                      <ArrowUpRight size={12} />
                      +₹{request.pointsEarned} Earned
                   </span>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              {request.status === 'completed' ? (
                <div className="h-12 w-12 rounded-2xl bg-eco-green/10 flex items-center justify-center text-eco-green border border-eco-green/20">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <button 
                  onClick={() => setTrackingRequestId(trackingRequestId === request.id ? null : request.id)}
                  className={cn(
                    "w-full md:w-auto h-12 px-6 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    trackingRequestId === request.id 
                      ? "bg-eco-blue text-white shadow-lg shadow-eco-blue/30" 
                      : "bg-white border border-slate-200 text-slate-900 hover:border-eco-blue hover:text-eco-blue"
                  )}
                >
                  <Navigation size={14} className={cn(trackingRequestId === request.id && "animate-pulse")} />
                  {trackingRequestId === request.id ? 'Tracker Active' : 'Live Tracking'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {activeTrackingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingRequestId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <EnhancedTracking 
              request={activeTrackingRequest} 
              onClose={() => setTrackingRequestId(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: PickupRequest['status'] }) {
  const styles: Record<string, string> = {
    requested: "from-slate-400 to-slate-500",
    assigned: "from-amber-400 to-amber-500",
    on_the_way: "from-eco-blue to-indigo-500 shadow-eco-blue/20",
    collected: "from-indigo-500 to-indigo-600",
    recycling: "from-eco-green to-emerald-600 animate-pulse",
    completed: "from-emerald-500 to-teal-600",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-br shadow-md",
      styles[status] || "from-slate-400 to-slate-500"
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}
