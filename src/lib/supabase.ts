import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only throw error in production, allow development without env vars
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.PROD) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
      };
      symptoms: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          ai_advice: string | null;
          referral_needed: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          ai_advice?: string | null;
          referral_needed?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          ai_advice?: string | null;
          referral_needed?: boolean | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          payment_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: string;
          payment_ref?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          status?: string;
          payment_ref?: string | null;
          created_at?: string;
        };
      };
      clinics: {
        Row: {
          id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string | null;
          created_at?: string;
        };
      };
    };
  };
};