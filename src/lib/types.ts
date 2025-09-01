export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  description: string;
  ai_advice: string | null;
  referral_needed: boolean | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  payment_ref: string | null;
  created_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  created_at?: string;
  distance?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}