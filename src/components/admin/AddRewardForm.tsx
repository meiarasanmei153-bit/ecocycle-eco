import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Loader2, Sparkles, Plus, ShoppingBag, DollarSign, Building } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export function AddRewardForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 500,
    provider: '',
    code: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setAnalyzing(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const response = await fetch('/api/ai/analyze-product', {
        method: 'POST',
        body,
      });
      const data = await response.json();
      if (data.title) {
        setFormData({
          title: data.title,
          description: data.description || '',
          cost: data.cost || 500,
          provider: data.provider || '',
          code: Math.random().toString(36).substring(2, 10).toUpperCase()
        });
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'rewards'), {
        ...formData,
        createdAt: new Date().toISOString(),
      });
      onSuccess?.();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-black border-2 border-white text-white rounded-xl flex items-center justify-center shadow-neo-sm transform -rotate-3">
          <Plus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Stock Marketplace</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">List new rewards with AI assistance</p>
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative h-64 w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-black mb-8 transition-all",
          preview ? "ring-4 ring-eco-green/20" : "bg-slate-50 border-dashed hover:bg-slate-100"
        )}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
            <Camera size={48} />
            <span className="font-black uppercase text-xs tracking-widest">Capture Product Image</span>
          </div>
        )}
        {analyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="font-black uppercase text-xs tracking-widest animate-pulse text-eco-green">Neural Inventory Processing...</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} hidden accept="image/*" capture="environment" onChange={handleFileChange} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Product Title</label>
          <div className="relative">
             <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
             <input
               type="text"
               value={formData.title}
               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
               placeholder="e.g. Bamboo T-Shirt"
               className="neo-input pl-12"
               required
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Cost (Points)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                className="neo-input pl-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Provider</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                className="neo-input pl-12"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="neo-input min-h-[100px]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || analyzing}
          className="neo-button w-full flex items-center justify-center gap-3 h-16"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              <Sparkles size={24} />
              <span>List Item in Marketplace</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
