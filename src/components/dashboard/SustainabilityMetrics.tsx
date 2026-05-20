import React from 'react';
import { motion } from 'motion/react';
import { Award, Leaf, Zap, Globe, TrendingUp } from 'lucide-react';
import { EcoUser } from '../../types';

interface SustainabilityMetricsProps {
  user: EcoUser;
}

export function SustainabilityMetrics({ user }: SustainabilityMetricsProps) {
  const metrics = [
    {
      label: 'Eco Points',
      value: `₹${user.points}`,
      icon: <Award className="text-amber-500" />,
      color: 'bg-amber-500/10',
      description: 'Total rewards earned'
    },
    {
      label: 'Carbon Reduced',
      value: `${user.carbonReduced || 0} kg`,
      icon: <Zap className="text-eco-green" />,
      color: 'bg-eco-green/10',
      description: 'CO2 emissions prevented'
    },
    {
      label: 'Sustainability Score',
      value: `${user.sustainabilityScore || 0}%`,
      icon: <TrendingUp className="text-eco-blue" />,
      color: 'bg-eco-blue/10',
      description: 'Community impact rank'
    },
    {
      label: 'Global Rank',
      value: 'Eco-Hero',
      icon: <Globe className="text-indigo-500" />,
      color: 'bg-indigo-500/10',
      description: 'Your status among heroes'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6 flex flex-col items-center text-center group hover:border-eco-green/50"
        >
          <div className={`h-12 w-12 ${metric.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {metric.icon}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{metric.label}</p>
          <h3 className="text-xl font-black italic tracking-tighter text-slate-900">{metric.value}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {metric.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
