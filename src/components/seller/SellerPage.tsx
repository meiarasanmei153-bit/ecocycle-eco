import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Droplet, TrendingUp, Recycle, X } from 'lucide-react';
import { PickupRequestForm } from '../pickup/PickupRequestForm';

export function SellerPage() {
  const [showForm, setShowForm] = useState(false);

  const impacts = [
    { title: "Seller Earnings", desc: "Sellers earn rewards by managing and scheduling their household waste collections effectively.", icon: <Droplet className="text-blue-500" /> },
    { title: "Direct Impact", desc: "By selling your waste to certified recyclers, you ensure 100% material recovery.", icon: <TrendingUp className="text-eco-green" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600 border-2 border-black rounded-[40px] p-12 text-white shadow-neo relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 text-white/5 transform scale-150 -mr-10 -mt-10">
            <Recycle size={300} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-6 leading-tight">Seller <br/>Portal</h1>
            <p className="text-lg font-bold uppercase tracking-widest text-white/80 mb-8 leading-relaxed">
              As a registered seller, you are a vital link in the circular economy. Manage your inventory and schedule pickups.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowForm(true)}
                className="bg-white text-indigo-600 border-2 border-black px-8 py-3 rounded-xl font-black uppercase text-sm shadow-neo-sm hover:-translate-y-1 transition-all"
              >
                Schedule New Pickup
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pickup Form Overlay/Section */}
      {showForm && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 relative"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Schedule Your Pickup</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="h-10 w-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="neo-card bg-white p-8">
            <PickupRequestForm onSuccess={() => setShowForm(false)} />
          </div>
        </motion.section>
      )}

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl">
        {impacts.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="neo-card p-8 bg-white"
          >
            <div className="h-12 w-12 border-2 border-black rounded-xl bg-slate-50 flex items-center justify-center mb-6 shadow-neo-sm">
              {item.icon}
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">{item.title}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed tracking-wider">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
