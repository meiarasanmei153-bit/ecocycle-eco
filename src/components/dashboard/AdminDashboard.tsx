import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Truck, 
  Recycle, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PickupRequest, EcoUser } from '../../types';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    collected: 0,
    recycled: 0,
    revenue: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PickupRequest));
      setRequests(docs);
      
      const revenue = docs.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
      setStats({
        total: docs.length,
        pending: docs.filter(r => r.status === 'requested').length,
        collected: docs.filter(r => r.status === 'collected').length,
        recycled: docs.filter(r => r.status === 'completed').length,
        revenue
      });
    });
    return unsubscribe;
  }, []);

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const dashboardCards = [
    { label: 'Total Pickups', value: stats.total, icon: <Truck size={24} />, color: 'text-indigo-600', trend: '+12%' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'text-eco-green', trend: '+24%' },
    { label: 'Recycled', value: stats.recycled, icon: <Recycle size={24} />, color: 'text-emerald-500', trend: '+8%' },
    { label: 'Active Users', value: '1,248', icon: <Users size={24} />, color: 'text-eco-blue', trend: '+5%' }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Command <span className="text-eco-blue italic">Center</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 px-1">Delivery & Payment Intelligence</p>
        </div>
        <div className="flex gap-4">
           <button className="h-12 px-6 glass-card flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 border-slate-200">
             <Filter size={14} /> Global Filters
           </button>
           <button className="h-12 px-6 eco-button">
             <TrendingUp size={16} /> Export Intelligence
           </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {dashboardCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 border-slate-100 group hover:border-eco-blue/30"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl bg-slate-50 group-hover:bg-white shadow-sm transition-colors", card.color.replace('text', 'text'))}>
                {card.icon}
              </div>
              <span className="text-[10px] font-black text-eco-green bg-eco-green/10 px-2 py-0.5 rounded-full">{card.trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Requests Table */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tighter italic">Live Pickup Requests</h3>
                <div className="flex items-center gap-2">
                   <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Search ID..." 
                        className="h-9 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-eco-blue/20 w-40" 
                      />
                   </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">User/Request</th>
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(request => (
                      <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                               {request.imageURL ? (
                                 <img src={request.imageURL} className="h-full w-full object-cover" />
                               ) : (
                                 <Package size={20} className="text-slate-300" />
                               )}
                             </div>
                             <div>
                               <p className="text-xs font-black uppercase tracking-tight">{request.userName || 'Eco User'}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {request.id.slice(0, 8)}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-2 py-1 rounded">
                             {request.category}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <AdminStatusBadge status={request.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                           {request.status === 'requested' ? (
                             <button 
                               onClick={() => handleStatusUpdate(request.id, 'assigned')}
                               className="h-9 px-4 bg-eco-blue/10 text-eco-blue border border-eco-blue/20 rounded-xl text-[9px] font-black uppercase hover:bg-eco-blue hover:text-white transition-all"
                             >
                               Assign Agent
                             </button>
                           ) : (
                             <button className="h-9 w-9 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                               <MoreVertical size={16} />
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Right Rail: Performance & Real-time Info */}
        <div className="space-y-8">
           <div className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10">
                 <Truck size={120} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6">Recycler Network</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase">Active Agents</span>
                    <span className="text-sm font-black italic tracking-tight">24 Online</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase">Fleet Utilization</span>
                    <span className="text-sm font-black italic tracking-tight text-eco-green">88%</span>
                 </div>
              </div>
              <button className="w-full mt-8 h-12 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all">
                 Live Fleet Monitor
              </button>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Environmental Impact</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black uppercase">Carbon Offset Rank</span>
                       <span className="text-[10px] font-black text-eco-green italic">Alpha Phase</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-eco-green w-3/4" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[7px] font-black text-slate-400 uppercase mb-1">E-Waste Diverted</p>
                       <p className="text-lg font-black italic">1.2m Tons</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Mines Prevented</p>
                       <p className="text-lg font-black italic text-eco-blue">0.4k ha</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    requested: "bg-slate-100 text-slate-400",
    assigned: "bg-amber-100 text-amber-600",
    on_the_way: "bg-eco-blue/10 text-eco-blue",
    collected: "bg-indigo-100 text-indigo-600",
    recycling: "bg-emerald-100 text-emerald-600",
    completed: "bg-eco-green/10 text-eco-green",
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-transparent",
      styles[status] || "bg-slate-100 text-slate-400"
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}
