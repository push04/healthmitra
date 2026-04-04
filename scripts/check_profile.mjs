import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'admin@healthmitraus.com');
  console.log('User ID from auth.users:', user?.id);

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
  console.log('Profile from DB:', profile);
  console.log('Error:', error);
}

check();
