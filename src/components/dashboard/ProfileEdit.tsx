import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Save, Loader2, MapPin, User as UserIcon, Smartphone, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { EcoUser } from '../../types';
import { PhoneVerification } from '../auth/PhoneVerification';
import { AnimatePresence } from 'motion/react';

interface ProfileEditProps {
  user: EcoUser;
  onClose: () => void;
}

export function ProfileEdit({ user, onClose }: ProfileEditProps) {
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address || '');
  const [landmark, setLandmark] = useState(user.landmark || '');
  const [avatarURL, setAvatarURL] = useState(user.avatarURL || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate size (max 2MB for profile pics is usually enough)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max size is 2MB');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarURL(url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Using local preview instead.');
      
      // Fallback to local preview if storage fails (might happen if storage is not provisioned)
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        address,
        landmark,
        avatarURL,
        isProfileComplete: name.length > 0 && address.length > 0
      });
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="neo-card bg-white w-full max-w-lg overflow-hidden"
      >
        <div className="bg-black p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Edit Profile</h2>
            <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mt-1">Customize your eco identity</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="h-10 w-10 border-2 border-white/20 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="h-24 w-24 rounded-[32px] border-4 border-black overflow-hidden shadow-neo-sm bg-slate-100 flex items-center justify-center">
                {avatarURL ? (
                  <img src={avatarURL} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-300" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[32px] cursor-pointer"
              >
                <Camera size={24} className="text-white" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="w-full mt-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Avatar URL or Upload</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={avatarURL}
                  onChange={(e) => setAvatarURL(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="neo-input w-full"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 px-4 bg-slate-50 border-2 border-black rounded-2xl flex items-center justify-center hover:bg-white transition-colors"
                  title="Upload from device"
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neo-input w-full pl-12"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Pickup Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
                <textarea 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="neo-input w-full pl-12 pt-4 h-24"
                  placeholder="Door No, Street Name, Area..."
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Landmark</label>
              <input 
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="neo-input w-full"
                placeholder="Near Eco Mall..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Mobile Number</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="neo-input w-full pl-12"
                    placeholder="+91 00000 00000"
                    disabled={user.phoneVerified}
                  />
                </div>
                {user.phoneVerified ? (
                  <div className="h-14 px-4 bg-eco-green/10 border-2 border-eco-green/20 rounded-2xl flex items-center gap-2 text-eco-green">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase">Verified</span>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowPhoneVerify(true)}
                    className="h-14 px-6 bg-amber-50 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors shadow-neo-sm"
                  >
                    Verify
                  </button>
                )}
              </div>
              {!user.phoneVerified && phone && (
                <p className="text-[9px] font-bold text-amber-600 uppercase mt-1 ml-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Verify your mobile to receive live pickup updates
                </p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="neo-button w-full h-14 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {showPhoneVerify && (
          <PhoneVerification 
            userId={user.uid}
            currentPhone={phone}
            onSuccess={(verifiedPhone) => {
              setPhone(verifiedPhone);
              setShowPhoneVerify(false);
            }}
            onClose={() => setShowPhoneVerify(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
