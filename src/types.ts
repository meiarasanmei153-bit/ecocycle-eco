export type UserRole = 'user' | 'recycler' | 'admin';

export interface EcoUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  createdAt: string;
  phone?: string;
  gender?: string;
  country?: string;
  state?: string;
  district?: string;
  pincode?: string;
  address?: string;
  landmark?: string;
  isProfileComplete: boolean;
  avatarURL?: string;
  phoneVerified?: boolean;
  greenBadge?: string;
  sustainabilityScore?: number;
  carbonReduced?: number; // in kg
}

export type PickupStatus = 'requested' | 'assigned' | 'on_the_way' | 'collected' | 'recycling' | 'completed';

export interface PickupRequest {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  category: string;
  status: PickupStatus;
  pickupDate: string;
  pickupTime?: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  imageURL: string;
  quantityEstimation?: string;
  aiCategory?: string;
  confidence?: string;
  pointsEarned?: number;
  createdAt: string;
  // Recycler details
  recyclerId?: string;
  recyclerName?: string;
  recyclerPhone?: string;
  recyclerVehicle?: string;
  liveLocation?: {
    lat: number;
    lng: number;
  };
  qrCode?: string;
  // Payment info
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: 'upi' | 'card' | 'payout' | 'cash';
  estimatedValue?: number;
  invoiceURL?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  provider: string;
  code?: string;
  category?: string;
}
