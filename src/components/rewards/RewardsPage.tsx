import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, runTransaction, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Reward } from '../../types';
import { 
  Award, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Tag, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Truck, 
  History, 
  ChevronRight, 
  Search, 
  Filter,
  Zap,
  Globe,
  Star,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PaymentDialog } from '../payment/PaymentDialog';

type MarketTab = 'market' | 'wishlist' | 'cart' | 'orders' | 'address';

interface Order {
  id: string;
  rewardId: string;
  rewardTitle: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  cost: number;
  deliveryMethod?: string;
  paymentMethod?: 'points' | 'card' | 'upi';
}

const SAMPLE_REWARDS: Reward[] = [
  {
    id: 'sample-1',
    title: 'Nerve-Zero Mesh Jacket',
    description: 'High-performance weatherproof jacket made from 50 reclaimed ocean plastic bottles.',
    cost: 1500,
    provider: 'EcoWear',
    category: 'Fashion'
  },
  {
    id: 'sample-2',
    title: 'Atomic Bamboo Set',
    description: 'Zero-waste travel set for your daily meals. Durable, lightweight, and compostable.',
    cost: 450,
    provider: 'GreenLife',
    category: 'Lifestyle'
  },
  {
    id: 'sample-3',
    title: 'Quantum Solar Cell',
    description: 'Charge your devices using clean sun energy. 20,000mAh capacity with fast charging.',
    cost: 2200,
    provider: 'SunTech',
    category: 'Tech'
  },
  {
    id: 'sample-4',
    title: 'Reforest Matrix Cert',
    description: 'We will plant a native tree in your name in the Amazon basin to help reforestation.',
    cost: 300,
    provider: 'Trees4All',
    category: 'Eco-Action'
  },
];

export function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<MarketTab>('market');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [address, setAddress] = useState("123 Eco Hub, Silicon Sector, BLR");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const fetchedRewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
      setRewards(fetchedRewards.length > 0 ? fetchedRewards : SAMPLE_REWARDS);
    });
    return unsubscribe;
  }, []);

  const filteredRewards = useMemo(() => {
    return rewards.filter(reward => 
      reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rewards, searchQuery]);

  const cartTotal = useMemo(() => {
    return rewards.filter(r => cart.includes(r.id)).reduce((acc, curr) => acc + curr.cost, 0);
  }, [rewards, cart]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCart = (id: string) => {
    setCart(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePaymentSuccess = async (method: string) => {
    if (!user) return;
    setLoading('checkout');
    
    try {
      const itemsToBuy = rewards.filter(r => cart.includes(r.id));
      
      for (const item of itemsToBuy) {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          rewardId: item.id,
          rewardTitle: item.title,
          date: new Date().toISOString(),
          status: 'processing',
          cost: item.cost,
          deliveryMethod: 'Smart Drone Delivery',
          paymentMethod: method,
          createdAt: new Date().toISOString()
        });
      }
      
      setCart([]);
      setShowPayment(false);
      setActiveTab('orders');
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="pb-20">
      {/* Immersive Header */}
      <div className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
           <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
           <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-eco-blue/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 bg-eco-green/10 text-eco-green rounded-full text-[9px] font-black uppercase tracking-widest border border-eco-green/20">Marketplace</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Credits: ₹{user.points}</span>
              </div>
              <h1 className="text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.8] mb-6">
                Eco <span className="text-eco-blue italic">Perks</span>
              </h1>
              <div className="flex items-center gap-6">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                      </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-tight">
                    Join 12k+ guardians <br /> redeeming today
                 </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <TabButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<ShoppingBag size={14} />} label="Boutique" />
              <TabButton active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} icon={<Heart size={14} />} label="Vault" count={wishlist.length} />
              <TabButton active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} icon={<ShoppingCart size={14} />} label="Cargo" count={cart.length} />
              <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<History size={14} />} label="Nexus" count={orders.length} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-12">
         <AnimatePresence mode="wait">
            {activeTab === 'market' && (
              <motion.div key="market" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-12">
                {/* Search Bar */}
                <div className="glass-panel p-2 flex flex-col md:flex-row items-center gap-2">
                   <div className="relative flex-1 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-blue transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search Sustainable Assets..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-white rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-eco-blue/20 transition-all placeholder:text-slate-300" 
                      />
                   </div>
                   <button className="h-16 px-8 rounded-[2rem] bg-slate-900 border border-slate-800 text-white flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                      <Filter size={16} /> Filters
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {filteredRewards.map((reward, idx) => (
                     <motion.div 
                        key={reward.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card group hover:border-eco-blue/30"
                      >
                        <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center m-3 rounded-[1.5rem] group-hover:bg-eco-blue/5 transition-colors">
                           <RewardIcon title={reward.title} />
                           <button 
                             onClick={() => toggleWishlist(reward.id)}
                             className={cn(
                               "absolute top-4 right-4 h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all",
                               wishlist.includes(reward.id) ? "bg-red-500 border-red-400 text-white" : "bg-white/60 border-white/20 text-slate-300 hover:text-red-400"
                             )}
                           >
                             <Heart size={18} fill={wishlist.includes(reward.id) ? 'currentColor' : 'none'} />
                           </button>
                           <div className="absolute bottom-4 left-4 flex gap-2">
                              <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-lg border border-white/10">
                                 {reward.category}
                              </span>
                           </div>
                        </div>
                        <div className="p-6 pt-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{reward.provider}</p>
                           <h4 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase leading-none group-hover:text-eco-blue transition-colors truncate">{reward.title}</h4>
                           <p className="text-[10px] font-bold text-slate-500 mt-3 line-clamp-2 uppercase leading-relaxed">{reward.description}</p>
                           
                           <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eco Value</p>
                                 <p className="text-xl font-black italic text-eco-green">₹{reward.cost}</p>
                              </div>
                              <button 
                                onClick={() => toggleCart(reward.id)}
                                className={cn(
                                  "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                  cart.includes(reward.id) ? "bg-eco-green text-white" : "bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white"
                                )}
                              >
                                 {cart.includes(reward.id) ? 'In Cargo' : 'Acquire'}
                              </button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {wishlist.length === 0 ? <EmptyState icon={<Heart size={48} />} label="Vault Empty" sub="Store your favorite eco-assets here" /> : (
                   rewards.filter(r => wishlist.includes(r.id)).map(reward => <AssetMini key={reward.id} reward={reward} onRemove={() => toggleWishlist(reward.id)} />)
                 )}
              </motion.div>
            )}

            {activeTab === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2 space-y-4">
                    {cart.length === 0 ? <EmptyState icon={<ShoppingCart size={48} />} label="Cargo Empty" sub="Acquire assets to see them here" /> : (
                       rewards.filter(r => cart.includes(r.id)).map(reward => (
                         <div key={reward.id} className="glass-card p-4 flex items-center gap-6 group hover:translate-x-1">
                            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                               <RewardIcon title={reward.title} size={32} />
                            </div>
                            <div className="flex-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{reward.provider}</p>
                               <h4 className="text-lg font-black italic tracking-tighter text-slate-900 uppercase leading-none mt-1">{reward.title}</h4>
                               <p className="text-[10px] font-black text-eco-green mt-2">₹{reward.cost}</p>
                            </div>
                            <button onClick={() => toggleCart(reward.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                               <AlertCircle size={20} />
                            </button>
                         </div>
                       ))
                    )}
                 </div>

                 <div className="space-y-6">
                    <div className="glass-card p-8 bg-slate-900 text-white">
                       <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                          <CreditCard size={20} className="text-eco-blue" />
                          Cargo Manifest
                       </h3>
                       <div className="space-y-4 mb-10">
                          <div className="flex justify-between text-[11px] font-black uppercase text-white/40">
                             <span>Assets</span>
                             <span>{cart.length} Units</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-black uppercase text-white/40">
                             <span>Processing</span>
                             <span>₹0.00</span>
                          </div>
                          <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
                             <span className="text-[11px] font-black uppercase tracking-widest">Total Value</span>
                             <span className="text-3xl font-black italic text-eco-green">₹{cartTotal}</span>
                          </div>
                       </div>
                       <button 
                         disabled={cart.length === 0}
                         onClick={() => setShowPayment(true)}
                         className="w-full eco-button h-16 text-lg italic tracking-tighter uppercase disabled:opacity-50"
                       >
                          Secure Auth
                       </button>
                       <p className="text-[8px] font-bold text-white/20 uppercase text-center mt-4 tracking-[0.3em]">Quantum Encrypted Gateway</p>
                    </div>

                    <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
                       <div className="flex items-center gap-3 mb-4">
                          <ShieldCheck size={20} className="text-amber-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Consumer Shield</h4>
                       </div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                          All assets from the boutique are blockchain verified and carbon negative by design.
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
               <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
                  {orders.length === 0 ? <EmptyState icon={<History size={48} />} label="No Nexus Nodes" sub="Redeem your points to start eco-deployment" /> : (
                    orders.map(order => (
                      <div key={order.id} className="glass-card p-6 flex flex-col md:flex-row items-center gap-8 group hover:border-eco-blue/30">
                         <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-eco-blue/5 transition-colors">
                            <RewardIcon title={order.rewardTitle} size={40} />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[8px] font-black text-slate-500 uppercase">#{order.id.slice(0, 8)}</span>
                               <span className="px-2 py-0.5 bg-eco-green/10 text-eco-green rounded-lg text-[8px] font-black uppercase italic tracking-widest">{order.status}</span>
                            </div>
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 group-hover:text-eco-blue transition-colors">{order.rewardTitle}</h4>
                            <div className="flex items-center gap-6 mt-4">
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <Truck size={14} /> {order.deliveryMethod}
                               </div>
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <Lock size={14} /> Paid via {order.paymentMethod?.toUpperCase()}
                               </div>
                            </div>
                         </div>
                         <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
                            <p className="text-xl font-black italic tracking-tighter text-slate-900">₹{order.cost}</p>
                            <button className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all w-full md:w-auto">
                               Track Nexus
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </motion.div>
            )}

            {activeTab === 'address' && (
               <motion.div key="address" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                  <div className="glass-card p-10 bg-white/60">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 eco-gradient rounded-2xl flex items-center justify-center text-white">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Geo Location</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deployment Destination Hub</p>
                        </div>
                     </div>
                     <textarea 
                       value={address}
                       onChange={(e) => setAddress(e.target.value)}
                       className="eco-input min-h-[160px] pt-4 resize-none mb-8"
                       placeholder="Enter full logistics address..."
                     />
                     <button className="eco-button w-full h-16">
                        Sync Location Node
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPayment && !loading && (
          <PaymentDialog 
            amount={cartTotal} 
            onSuccess={handlePaymentSuccess} 
            onClose={() => setShowPayment(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative",
        active 
          ? "bg-slate-900 text-white shadow-xl translate-y-[-2px]" 
          : "bg-white/50 text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent"
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn(
          "h-4 w-4 rounded-md flex items-center justify-center text-[8px] font-black",
          active ? "bg-eco-green text-white" : "bg-slate-100 text-slate-400"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

const AssetMini: React.FC<{ reward: Reward; onRemove: () => void }> = ({ reward, onRemove }) => {
   return (
      <div className="glass-card p-6 flex items-center gap-4 group">
         <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
            <RewardIcon title={reward.title} size={32} />
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black uppercase italic tracking-tight truncate">{reward.title}</h4>
            <p className="text-[10px] font-black text-eco-green mt-1 italic">₹{reward.cost}</p>
         </div>
         <button onClick={onRemove} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
            <Heart size={18} fill="currentColor" />
         </button>
      </div>
   );
};

function RewardIcon({ title, size = 48 }: { title: string, size?: number }) {
  const t = title.toLowerCase();
  if (t.includes('jacket') || t.includes('fashion') || t.includes('set')) return <Tag size={size} className="text-indigo-600" />;
  if (t.includes('solar') || t.includes('tech') || t.includes('power')) return <Zap size={size} className="text-amber-500" />;
  if (t.includes('tree') || t.includes('cert')) return <Globe size={size} className="text-eco-green" />;
  return <Star size={size} className="text-slate-400" />;
}

function EmptyState({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
   return (
     <div className="col-span-full py-24 flex flex-col items-center text-center">
        <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border-2 border-dashed border-slate-200">
           {icon}
        </div>
        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">{label}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{sub}</p>
     </div>
   );
}

function Lock({ size, className }: { size?: number, className?: string }) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
