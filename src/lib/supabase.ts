// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not defined');
}

// Client-side Supabase client that uses cookies for auth state
export const supabase = createClientComponentClient<Database>({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
});

// Regular Supabase client for non-auth operations or when specific configuration is needed
export const supabaseRegular = createClient(supabaseUrl, supabaseAnonKey);

// Ensure supabaseAdmin is only initialized on the server
export const supabaseAdmin =
  supabaseServiceRoleKey && typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;