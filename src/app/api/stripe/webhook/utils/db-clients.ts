// src/app/api/stripe/webhook/utils/db-clients.ts
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not defined');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export the Sanity client
export { sanityClient };