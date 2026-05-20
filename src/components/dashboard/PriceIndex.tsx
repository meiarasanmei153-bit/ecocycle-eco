import React from 'react';
import { motion } from 'motion/react';
import { Tag, TrendingUp, Info } from 'lucide-react';

export const WASTE_PRICES = [
  { category: 'Plastic', price: 10, unit: 'kg', color: 'text-blue-500' },
  { category: 'Steel', price: 50, unit: 'kg', color: 'text-slate-500' },
  { category: 'Aluminium', price: 50, unit: 'kg', color: 'text-indigo-500' },
  { category: 'Metal', price: 50, unit: 'kg', color: 'text-rose-500' },
  { category: 'Glass', price: 20, unit: 'kg', color: 'text-emerald-500' },
  { category: 'Wood', price: 15, unit: 'kg', color: 'text-amber-700' },
  { category: 'Paper', price: 8, unit: 'kg', color: 'text-amber-500' },
  { category: 'E-Waste', price: 100, unit: 'kg', color: 'text-purple-500' },
];

export function PriceIndex() {
  return (
    <div className="neo-card p-6 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
        <TrendingUp size={120} />
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 bg-black text-white rounded-lg flex items-center justify-center shadow-neo-sm">
          <Tag size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter italic">Waste Price Index</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Live marketplace rates</p>
        </div>
      </div>

      <div className="space-y-3">
        {WASTE_PRICES.map((item, idx) => (
          <motion.div 
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl border-2 border-black/5 hover:border-black/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full bg-current ${item.color}`} />
              <span className="text-xs font-black uppercase tracking-tighter text-slate-700">{item.category}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tighter">{item.price}</span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic pt-1">₹ / {item.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-black/10 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
            Prices are calculated upon verified weight by our recyclers at the time of pickup.
          </p>
        </div>
        <div className="pt-3 border-t border-black/5">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">
            Conversion: 1 Point = ₹1
          </p>
        </div>
      </div>
    </div>
  );
}
