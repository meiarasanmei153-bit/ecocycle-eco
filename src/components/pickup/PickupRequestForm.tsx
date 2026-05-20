import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Recycle, 
  Clock, 
  ChevronRight, 
  Package, 
  Smartphone,
  Navigation,
  Globe,
  AlertCircle
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';

export function PickupRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ category: string; confidence: string; description: string } | null>(null);
  const [formData, setFormData] = useState({
    category: 'E-Waste',
    pickupDate: '',
    pickupTime: '10:00 AM - 01:00 PM',
    address: user?.address || '',
    quantity: 'Small Box (1-2 kg)',
  });

  useEffect(() => {
    if (user?.address && !formData.address) {
      setFormData(prev => ({ ...prev, address: user.address || '' }));
    }
  }, [user?.address]);

  const categories = [
    'Laptops & Tablets', 
    'Smartphones & Mobile', 
    'Televisions & Monitors', 
    'Home Appliances', 
    'Computer Peripherals', 
    'Wires & Cables', 
    'Batteries', 
    'Other E-Waste'
  ];

  const timeSlots = [
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM',
    '06:00 PM - 09:00 PM'
  ];

  const quantities = [
    'Small Box (1-5 kg)',
    'Medium Box (5-15 kg)',
    'Large Unit (15-30 kg)',
    'Bulk Collection (>30 kg)'
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAiResult(null);

    // AI Identification
    setAnalyzing(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const response = await fetch('/api/ai/identify', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      setAiResult(data);
      if (data.category) {
        setFormData(prev => ({ ...prev, category: data.category }));
      }
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            setFormData(prev => ({ ...prev, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Please enable location permissions");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // In a real app, we would upload the image to Firebase Storage first
      // For this demo, we'll use a placeholder URL if storage isn't fully set up
      const imageURL = preview || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400';

      await addDoc(collection(db, 'requests'), {
        userId: user.uid,
        userName: user.name,
        userPhone: user.phone || '',
        category: formData.category,
        status: 'requested',
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        address: formData.address,
        quantityEstimation: formData.quantity,
        aiCategory: aiResult?.category || '',
        confidence: aiResult?.confidence || '',
        imageURL,
        estimatedValue: 450, // Mock dynamic pricing
        pointsEarned: 100, // Expected points
        createdAt: serverTimestamp(),
      });
      onSuccess();
    } catch (err) {
      console.error('Error adding request:', err);
      alert('Submission failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <div className="h-16 w-16 eco-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-eco-green/20">
           <Recycle size={32} className="animate-spin-slow" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">Initiate <span className="text-eco-green italic">Collection</span></h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Neural Waste Analysis & Scheduling</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Visual Analysis Pane */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-1 overflow-hidden h-full flex flex-col">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex-1 min-h-[300px] cursor-pointer group transition-all duration-700",
                  preview ? "bg-slate-900" : "bg-slate-50 border-2 border-dashed border-slate-200 m-4 rounded-[1.5rem]"
                )}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-300">
                    <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Camera size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-black uppercase text-xs tracking-widest text-slate-900">Upload Visuals</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-1">AI Scan for better rates</p>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {analyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-eco-dark/80 backdrop-blur-md"
                    >
                      <div className="relative">
                         <div className="h-24 w-24 border-4 border-eco-green/20 rounded-full border-t-eco-green animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Globe size={32} className="text-eco-green animate-pulse" />
                         </div>
                      </div>
                      <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-eco-green">Neural Cross-Reference...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-eco-green animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-white tracking-widest">Real-time Recognition Link Active</span>
                   </div>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <AnimatePresence>
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-900 text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-eco-green">AI Suggestion</span>
                       <span className="px-2 py-0.5 bg-eco-green/20 rounded text-[8px] font-black text-eco-green">{aiResult.confidence} Match</span>
                    </div>
                    <h4 className="text-xl font-black italic tracking-tighter uppercase mb-1">{aiResult.category}</h4>
                    <p className="text-[10px] font-bold text-white/50 uppercase leading-relaxed">{aiResult.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Configuration Pane */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-Waste Category</label>
                 <div className="relative group">
                   <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-green transition-colors" />
                   <select
                     value={formData.category}
                     onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                     className="eco-input pl-11 appearance-none cursor-pointer"
                   >
                     {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Quantity Estimate</label>
                 <div className="relative group">
                   <Navigation size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-blue transition-colors" />
                   <select
                     value={formData.quantity}
                     onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                     className="eco-input pl-11 appearance-none cursor-pointer"
                   >
                     {quantities.map(q => <option key={q} value={q}>{q}</option>)}
                   </select>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pickup Date</label>
                 <div className="relative group">
                   <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                   <input
                     type="date"
                     required
                     value={formData.pickupDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                     className="eco-input pl-11"
                   />
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preferred Slot</label>
                 <div className="relative group">
                   <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                   <select
                     value={formData.pickupTime}
                     onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                     className="eco-input pl-11 appearance-none cursor-pointer"
                   >
                     {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                   </select>
                 </div>
               </div>
             </div>

             <div className="space-y-3">
               <div className="flex items-center justify-between mb-1 px-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Collection Point</label>
                 <button
                   type="button"
                   onClick={handleGetLocation}
                   disabled={gettingLocation}
                   className="flex items-center gap-1.5 text-[9px] font-black uppercase text-eco-blue hover:text-eco-green transition-all"
                 >
                   {gettingLocation ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                   Smart Auto-Detect
                 </button>
               </div>
               <div className="relative group">
                 <MapPin size={16} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                 <textarea
                   required
                   value={formData.address}
                   onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                   placeholder="Enter precise collection address..."
                   className="eco-input pl-11 min-h-[120px] resize-none pt-4"
                 />
               </div>
             </div>
             
             <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Estimated Yield</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-black italic tracking-tighter text-eco-green uppercase">~ ₹450.00</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">+100 Points</span>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || analyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto eco-button h-16 px-12 text-lg italic tracking-tighter uppercase group"
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Confirm Schedule
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>
             </div>
           </div>
           
           <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20 flex gap-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                 <AlertCircle size={20} />
              </div>
              <div>
                 <h5 className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Environmental Note</h5>
                 <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                    By recycling this item, you are preventing toxic heavy metals like lead and mercury from entering our local soil and groundwater systems.
                 </p>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
