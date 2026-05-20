import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
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
  Package,
  Plus,
  Database
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PickupRequest, EcoUser } from '../../types';
import { cn } from '../../lib/utils';
import { AddRewardForm } from './AddRewardForm';

export function AdminDashboard() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [users, setUsers] = useState<EcoUser[]>([]);
  const [showAddReward, setShowAddReward] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    collected: 0,
    recycled: 0,
    revenue: 0
  });

  useEffect(() => {
    const qRequests = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
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

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as EcoUser)));
    });

    return () => { unsubRequests(); unsubUsers(); };
  }, []);

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const seedRewards = async () => {
    setSeeding(true);
    try {
      const initialRewards = [
        { title: "Eco-Coffee Voucher", description: "Enjoy a free organic coffee.", cost: 500, provider: "Greenhouse Cafe", category: "Lifestyle", createdAt: new Date().toISOString() },
        { title: "Solar Power Hub Day Pass", description: "High speed co-working access.", cost: 2000, provider: "EcoHub", category: "Tech", createdAt: new Date().toISOString() },
      ];
      for (const r of initialRewards) {
        await addDoc(collection(db, 'rewards'), r);
      }
      alert('Rewards seeded successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const dashboardCards = [
    { label: 'Total Pickups', value: stats.total, icon: <Truck size={24} />, color: 'text-indigo-600', trend: '+12%' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'text-eco-green', trend: '+24%' },
    { label: 'Recycled', value: stats.recycled, icon: <Recycle size={24} />, color: 'text-emerald-500', trend: '+8%' },
    { label: 'Cloud Users', value: users.length, icon: <Users size={24} />, color: 'text-eco-blue', trend: '+5%' }
  ];

  const categoryData = requests.reduce((acc: any[], curr) => {
    const found = acc.find(a => a.name === curr.category);
    if (found) found.value++;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#0ea5e9', '#22c55e', '#6366f1', '#f59e0b', '#ec4899'];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Command <span className="text-eco-blue italic">Center</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 px-1">Global Logistics & Payout Systems</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button 
             onClick={() => setShowAddReward(!showAddReward)}
             className="h-12 px-6 glass-card flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 border-slate-200"
           >
             {showAddReward ? 'Close Form' : 'Nexus Registry'}
           </button>
           <button 
             onClick={seedRewards}
             disabled={seeding}
             className="h-12 px-6 eco-button"
           >
             {seeding ? <Loader2 className="animate-spin" /> : <Database size={16} />}
             Auto-Seed Market
           </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddReward && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <AddRewardForm onSuccess={() => setShowAddReward(false)} />
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className={cn("p-4 rounded-2xl bg-slate-50 group-hover:bg-white shadow-sm transition-colors", card.color)}>
                {card.icon}
              </div>
              <span className="text-[10px] font-black text-eco-green bg-eco-green/10 px-2 py-0.5 rounded-full">{card.trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Requests Table */}
        <div className="lg:col-span-2 space-y-12">
           <div className="glass-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tighter italic">Live Transmission Log</h3>
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Search Registry..." 
                        className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-eco-blue/20 w-48" 
                      />
                   </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">Entity / Hash</th>
                      <th className="px-8 py-5 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                      <th className="px-8 py-5 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest">Phase</th>
                      <th className="px-8 py-5 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(request => (
                      <tr key={request.id} className="hover:bg-slate-50/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="h-11 w-11 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 group-hover:bg-white">
                               {request.imageURL ? (
                                 <img src={request.imageURL} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                               ) : (
                                 <Package size={20} className="text-slate-200" />
                               )}
                             </div>
                             <div>
                               <p className="text-xs font-black uppercase tracking-tight text-slate-900">{request.userName || 'Eco Guardian'}</p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SIG_{request.id.slice(0, 8)}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                             {request.category}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <AdminStatusBadge status={request.status} />
                        </td>
                        <td className="px-8 py-5 text-right">
                           {request.status === 'requested' ? (
                             <button 
                               onClick={() => handleStatusUpdate(request.id, 'assigned')}
                               className="h-10 px-5 bg-eco-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-eco-blue/20 hover:scale-105 active:scale-95 transition-all"
                             >
                               Assign Terminal
                             </button>
                           ) : (
                             <button className="h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
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

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="glass-card p-8">
                 <div className="flex items-center justify-between mb-10">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stream Composition</h4>
                    <BarChart3 size={16} className="text-eco-blue" />
                 </div>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fontWeight: 900, textTransform: 'uppercase' }} />
                          <YAxis axisLine={false} tickLine={false} fontSize={9} tick={{ fontWeight: 900 }} />
                          <Tooltip 
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} 
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                             {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass-card p-8 bg-slate-900 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Recycle size={180} />
                 </div>
                 <div className="flex items-center justify-between mb-10">
                    <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Global Purity Index</h4>
                    <TrendingUp size={16} className="text-eco-green" />
                 </div>
                 <div className="h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={categoryData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={8}
                             dataKey="value"
                             stroke="none"
                          >
                             {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#000', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} 
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-12">
           <div className="glass-card p-8 bg-eco-blue text-white overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12">
                 <Truck size={160} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Fleet Pulse</h3>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-10">Real-time Recycler Logistics</p>
              
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase">Active Terminals</span>
                    <span className="text-sm font-black italic tracking-tight">24 Online</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase">Fleet Purity</span>
                    <span className="text-sm font-black italic tracking-tight text-white">96.8%</span>
                 </div>
              </div>
              <button className="w-full mt-10 h-14 bg-white/20 hover:bg-white/30 rounded-2xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md transition-all">
                 Infiltrate Live Logistics
              </button>
           </div>

           <div className="glass-card p-8 bg-slate-50 border-slate-200">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-10">Impact Summary</h3>
              <div className="space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-eco-green border border-slate-100">
                       <Recycle size={24} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase">Mass Recovered</p>
                       <p className="text-2xl font-black italic tracking-tighter">1,248.5 T</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-eco-blue border border-slate-100">
                       <Globe size={24} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase">Eco Restoration</p>
                       <p className="text-2xl font-black italic tracking-tighter">Alpha-4 Grade</p>
                    </div>
                 </div>
                 
                 <div className="pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-[9px] font-black uppercase text-slate-400">Quarterly Target</p>
                       <p className="text-[9px] font-black text-eco-blue">82% COMPLETE</p>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '82%' }}
                         className="h-full bg-eco-blue"
                       />
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
    recycled: "bg-eco-green/10 text-eco-green",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-transparent",
      styles[status] || "bg-slate-100 text-slate-400"
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function Globe({ size, className }: { size?: number, className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20" />
      <path d="M2 12h20" />
    </svg>
  );
}
