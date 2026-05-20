import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { User, Phone, MapPin, Globe, Home, Flag, UserCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ProfileSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    country: user?.country || 'India',
    state: user?.state || '',
    district: user?.district || '',
    pincode: user?.pincode || '',
    address: user?.address || '',
    landmark: user?.landmark || '',
  });

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isProfileComplete: true,
      });
    } catch (error) {
      console.error('Error skipping profile:', error);
    } finally {
      setLoading(false);
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
        alert("Unable to retrieve your location");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        isProfileComplete: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card bg-white p-8 md:p-12 mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-neo transform -rotate-3">
                <UserCircle size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  {user?.isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {user?.isProfileComplete ? 'Keep your details up to date' : `Welcome, ${user?.role}! Let's get you started.`}
                </p>
              </div>
            </div>
            {user?.isProfileComplete ? (
              <button 
                onClick={() => window.history.back()}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-black transition-colors flex items-center gap-2"
              >
                Go Back
              </button>
            ) : (
              <button 
                onClick={handleSkip}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-black underline underline-offset-4 tracking-[0.1em]"
              >
                Skip for now
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="neo-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Globe size={12} /> Email Address
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ''}
                  className="neo-input bg-slate-50 cursor-not-allowed opacity-70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="neo-input"
                  placeholder="+91 99999 99999"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gender</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="neo-input appearance-none bg-white font-bold"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Globe size={12} /> Country
                </label>
                <input
                  required
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="neo-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Flag size={12} /> State
                </label>
                <input
                  required
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="neo-input"
                  placeholder="e.g. Karnataka"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <MapPin size={12} /> District
                </label>
                <input
                  required
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="neo-input"
                  placeholder="e.g. Bangalore"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pincode</label>
                <input
                  required
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="neo-input"
                  placeholder="560001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Home size={12} /> Full Address
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {gettingLocation ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <MapPin size={12} />
                  )}
                  Auto-fill Address
                </button>
              </div>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="neo-input min-h-[100px]"
                placeholder="House no, Street, Area..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                className="neo-input"
                placeholder="e.g. Near Eco Park"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-button w-full py-4 mt-8 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin text-white" />
              ) : (
                <>
                  <span className="text-sm font-black uppercase tracking-widest">
                    {user?.isProfileComplete ? 'Save Changes' : 'Complete Registration'}
                  </span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Flag size={20} className="text-white" />
                  </motion.div>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
