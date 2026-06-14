import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify credentials exist before creating client
console.log('[Supabase Init] URL exists:', !!supabaseUrl);
console.log('[Supabase Init] Service Role Key exists:', !!supabaseServiceKey);

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment variables');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables - This is required for server-side operations');
}

// Admin client for server-side operations (service role key)
// This has full database access and should only be used server-side
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Disable session persistence for server-side use
  },
});

// Test connection on module load
(async () => {
  try {
    const { data, error } = await supabase.from('chat_sessions').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase Error] Connection test failed:', error.message);
    } else {
      console.log('[Supabase Success] Connected to Supabase');
    }
  } catch (err) {
    console.error('[Supabase Error] Connection test exception:', err instanceof Error ? err.message : String(err));
  }
})();
