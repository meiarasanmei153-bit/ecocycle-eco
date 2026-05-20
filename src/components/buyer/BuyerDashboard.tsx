import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PickupRequest } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, MapPin, Truck, TrendingUp, Info, Tag, CheckCircle2, X } from 'lucide-react';
import { WASTE_PRICES } from '../dashboard/PriceIndex';

export function BuyerDashboard() {
  const [inventory, setInventory] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    contact: '',
    notes: ''
  });

  useEffect(() => {
    // Buyers are interested in 'recycled' materials ready for purchase
    const q = query(collection(db, 'requests'), where('status', '==', 'recycled'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PickupRequest));
      setInventory(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const totalStock = inventory.reduce((acc, curr) => acc + ((curr as any).weight || 0), 0);

  const handlePurchase = async (requestId: string) => {
    if (!deliveryDetails.address || !deliveryDetails.contact) {
      alert("Please provide delivery address and contact number");
      return;
    }

    setPurchasing(requestId);
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        status: 'purchased',
        purchasedAt: new Date().toISOString(),
        deliveryDetails: deliveryDetails
      });
      setShowSuccess(true);
      setShowDeliveryModal(null);
      setDeliveryDetails({ address: '', contact: '', notes: '' });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Purchase failed:', err);
    } finally {
      setPurchasing(null);
    }
  };

  const getPrice = (category: string, weight: number) => {
    const rate = WASTE_PRICES.find(p => p.category.toLowerCase() === category.toLowerCase())?.price || 10;
    const points = Math.round(rate * weight);
    return { points, price: points }; // 1 point = 1rs
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="h-12 w-12 bg-black border-2 border-white text-white rounded-xl flex items-center justify-center shadow-neo-sm transform -rotate-3">
          <ShoppingCart size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Buyer Marketplace</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Procure Certified Recycled Materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          icon={<Package className="text-blue-500" />} 
          label="Available Lots" 
          value={inventory.length.toString()} 
        />
        <StatCard 
          icon={<TrendingUp className="text-eco-green" />} 
          label="Total Weight" 
          value={`${totalStock.toFixed(1)} kg`} 
        />
        <div className="neo-card p-6 bg-indigo-600 text-white border-black">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Marketplace Status</p>
          <p className="text-2xl font-black italic uppercase tracking-tighter">Live & Fluid</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-eco-green animate-pulse" />
            <span className="text-[9px] font-bold uppercase">Updating in real-time</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified Inventory</h3>
          </div>

          {loading ? (
             <div className="flex items-center justify-center h-64">
               <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
             </div>
          ) : inventory.length === 0 ? (
            <div className="neo-card p-12 text-center text-slate-400 border-dashed">
              <Package size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-black uppercase text-xs">No Inventory Available</p>
              <p className="text-[10px] mt-2 font-bold uppercase">Check back when more pickups are processed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="neo-card p-5 bg-white flex flex-col hover:shadow-neo transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-16 w-16 rounded-xl border-2 border-black flex items-center justify-center bg-slate-50 overflow-hidden shadow-neo-sm">
                      {item.imageURL ? (
                        <img src={item.imageURL} alt="Lot" className="h-full w-full object-cover" />
                      ) : (
                        <Tag size={24} className="text-slate-300" />
                      )}
                    </div>
                    <span className="bg-eco-green text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-black shadow-neo-sm">
                      Certified Lot
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1">{item.category} Lot</h4>
                  {(item as any).listingDescription && (
                    <p className="text-[10px] font-medium text-slate-600 mb-3 line-clamp-2 italic">
                      "{ (item as any).listingDescription }"
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <MapPin size={10} /> {item.address.split(',')[0]}...
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between py-2 border-y border-black/5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Lot Weight</span>
                      <span className="text-lg font-black tracking-tighter">{(item as any).weight || 0} kg</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 bg-slate-50 rounded-lg border border-black/5">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Point Value</p>
                          <p className="text-sm font-black text-eco-green italic">{getPrice(item.category, (item as any).weight || 0).points} PTS</p>
                       </div>
                       <div className="p-2 bg-slate-50 rounded-lg border border-black/5 text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Cash Price</p>
                          <p className="text-sm font-black text-slate-900">₹{getPrice(item.category, (item as any).weight || 0).price}</p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowDeliveryModal(item.id)}
                      className="neo-button w-full h-10 text-[10px] flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Procure Material
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
           <PriceIndicator />
           <div className="neo-card p-6 bg-slate-50 border-dashed">
              <div className="flex items-start gap-3 mb-4">
                <Info size={16} className="text-slate-400 mt-1" />
                <h4 className="text-xs font-black uppercase">Procurement Protocol</h4>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                All materials in the marketplace have been verified for weight and quality by certified recyclers. Procurement is instant and blockchain-recorded.
              </p>
           </div>
        </div>
      </div>
      <AnimatePresence>
        {showDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="neo-card bg-white p-8 max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowDeliveryModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-neo-sm">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Delivery Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Where should we send the lot?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Shipping Address</label>
                  <textarea 
                    value={deliveryDetails.address}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full shipping address..."
                    className="neo-input min-h-[100px] text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contact Number</label>
                  <input 
                    type="text"
                    value={deliveryDetails.contact}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="+91 99999 99999"
                    className="neo-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Additional Notes (Optional)</label>
                  <input 
                    type="text"
                    value={deliveryDetails.notes}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Gate code, specific timing..."
                    className="neo-input text-xs font-bold"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => handlePurchase(showDeliveryModal)}
                    disabled={purchasing === showDeliveryModal || !deliveryDetails.address || !deliveryDetails.contact}
                    className="neo-button w-full h-12 flex items-center justify-center gap-2 group"
                  >
                    {purchasing === showDeliveryModal ? (
                      <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span className="uppercase tracking-widest font-black text-xs">Confirm & Pay</span>
                        <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-black text-white p-4 rounded-2xl shadow-neo border-2 border-white flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-eco-green rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest italic">Order Confirmed!</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Material lot has been reserved for pickup</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-4 text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="neo-card p-6 bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 border-2 border-black rounded-xl flex items-center justify-center bg-slate-50 shadow-neo-sm">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PriceIndicator() {
  return (
    <div className="neo-card p-6 bg-white">
      <h3 className="text-sm font-black uppercase italic mb-4 tracking-tighter">Procurement Rates</h3>
      <div className="space-y-3">
        {WASTE_PRICES.slice(0, 4).map((p) => (
          <div key={p.category} className="flex items-center justify-between text-[10px]">
             <span className="font-black uppercase text-slate-400">{p.category}</span>
             <span className="font-black">₹{(p.price * 1.2).toFixed(1)} / kg</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[8px] font-bold text-slate-400 uppercase text-center border-t border-black/5 pt-4">
        Prices include 20% marketplace processing fee
      </p>
    </div>
  );
}
