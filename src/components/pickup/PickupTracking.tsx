import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Truck, Recycle, ArrowRight, MapPin, Calendar, Package } from 'lucide-react';
import { PickupRequest } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface PickupTrackingProps {
  request: PickupRequest;
  onClose: () => void;
}

export function PickupTracking({ request, onClose }: PickupTrackingProps) {
  const steps = [
    {
      id: 'requested',
      label: 'Request Received',
      description: 'Your pickup request has been successfully registered.',
      icon: <Clock size={20} />,
      isCompleted: true,
      activeColor: 'text-amber-500',
    },
    {
      id: 'collected',
      label: 'Agent Assigned',
      description: 'A certified recycler has been assigned to your collection.',
      icon: <Truck size={20} />,
      isCompleted: request.status === 'collected' || request.status === 'recycling' || request.status === 'completed',
      activeColor: 'text-blue-500',
    },
    {
      id: 'completed',
      label: 'Processing Complete',
      description: 'Waste has been safely processed and points awarded.',
      icon: <Recycle size={20} />,
      isCompleted: request.status === 'completed',
      activeColor: 'text-eco-green',
    },
  ];

  const currentStepIndex = steps.findIndex(step => 
    ((request.status === 'requested' || request.status === 'assigned' || request.status === 'on_the_way') && step.id === 'requested') ||
    ((request.status === 'collected' || request.status === 'recycling') && step.id === 'collected') ||
    (request.status === 'completed' && step.id === 'completed')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card bg-white p-0 overflow-hidden"
    >
      <div className="bg-black p-6 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Tracking Request</h3>
          <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mt-1">ID: {request.id.slice(0, 8)}...</p>
        </div>
        <button 
          onClick={onClose}
          className="h-8 w-8 rounded-lg border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Status Steps */}
          <div className="lg:col-span-2 space-y-8">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="relative flex gap-4">
                  {!isLast && (
                    <div 
                      className={cn(
                        "absolute left-[19px] top-10 w-0.5 h-[calc(100%+16px)] transition-colors duration-500",
                        idx < currentStepIndex ? "bg-black" : "bg-slate-100"
                      )}
                    />
                  )}
                  
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all duration-300 z-10",
                    isActive ? "bg-black border-black text-white shadow-neo-sm scale-110" : "bg-white border-slate-200 text-slate-300"
                  )}>
                    {idx < currentStepIndex ? <CheckCircle2 size={18} /> : step.icon}
                  </div>

                  <div className="flex-1 pt-1">
                    <h4 className={cn(
                      "font-black uppercase tracking-tight leading-none",
                      isActive ? "text-black" : "text-slate-400"
                    )}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">
                      {step.description}
                    </p>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mt-3 px-3 py-1 bg-slate-100 border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-widest"
                      >
                        In Progress
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Request Details Card */}
          <div className="space-y-6">
            <div className="neo-card bg-slate-50 p-6 border-dashed">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Request Specs</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Category</p>
                    <p className="text-xs font-black uppercase">{request.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Schedule</p>
                    <p className="text-xs font-black uppercase">{request.pickupDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Location</p>
                    <p className="text-xs font-black uppercase truncate max-w-[140px]">{request.address}</p>
                  </div>
                </div>
              </div>

              {request.status === 'completed' && (
                <div className="mt-6 pt-6 border-t-2 border-black border-dotted">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase text-slate-400">Yield</span>
                     <span className="text-lg font-black text-eco-green italic">+{request.pointsEarned} PTS</span>
                   </div>
                </div>
              )}
            </div>

            {request.imageURL && (
              <div className="neo-card p-2">
                <img 
                  src={request.imageURL} 
                  alt="Waste identification" 
                  className="w-full h-40 object-cover rounded-xl border-2 border-black"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
