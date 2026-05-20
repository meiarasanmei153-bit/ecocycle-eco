import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 30 },
  { name: 'Sat', value: 25 },
  { name: 'Sun', value: 32 },
];

export function SustainabilityAnalytics() {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-900 italic tracking-tighter">Impact Analytics</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sustainability performance</p>
        </div>
        <div className="flex gap-2">
           <span className="px-2 py-0.5 bg-eco-green/10 text-eco-green rounded-full text-[8px] font-black uppercase tracking-widest border border-eco-green/20">Weekly</span>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              dy={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
              }}
              labelStyle={{ color: '#0f172a', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#22c55e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-eco-green" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency + 24%</span>
        </div>
        <button className="text-[10px] font-black uppercase text-eco-blue hover:underline">Full Report</button>
      </div>
    </div>
  );
}
