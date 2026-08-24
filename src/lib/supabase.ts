import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

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
  !configuredSupabaseAnonKey.startsWith('your_') &&
  !configuredSupabaseAnonKey.includes('...')
);

let supabaseInstance: SupabaseClient<Database> | null = null;

const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Use a proxy to maintain the existing 'import { supabase }' syntax while allowing lazy initialization
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (_target, prop: keyof SupabaseClient<Database>) => {
    const client = getSupabase();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
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
