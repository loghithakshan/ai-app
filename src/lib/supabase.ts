import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = configuredSupabaseUrl && !configuredSupabaseUrl.startsWith('your_')
  ? configuredSupabaseUrl
  : 'https://placeholder.supabase.co';
const supabaseAnonKey = configuredSupabaseAnonKey && !configuredSupabaseAnonKey.startsWith('your_')
  ? configuredSupabaseAnonKey
  : 'placeholder';

export const isSupabaseConfigured = Boolean(
  configuredSupabaseUrl &&
  configuredSupabaseAnonKey &&
  !configuredSupabaseUrl.startsWith('your_') &&
  !configuredSupabaseAnonKey.startsWith('your_')
);

let supabaseInstance: any = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Use a proxy to maintain the existing 'import { supabase }' syntax while allowing lazy initialization
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    return getSupabase()[prop];
  }
});

// Shared database types for strong architecture
export type UserProfile = {
  id: string;
  email: string;
  subscription_tier: 'FREE' | 'PRIME';
  stripe_customer_id?: string;
};

export type AIChild = {
  id: string;
  user_id: string;
  name: string;
  level: number;
  stage: string;
  traits: string[];
  total_xp: number;
  completed_lessons: string[];
};

export type Memory = {
  id: string;
  child_id: string;
  type: 'emotional' | 'factual' | 'skill' | 'value' | 'moment';
  content: string;
  embedding?: number[];
  timestamp: number;
};
