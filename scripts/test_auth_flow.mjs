import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Signing in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@healthmitraus.com',
    password: '@Admin123'
  });
  
  if (error) {
    console.error('Sign in error:', error);
    return;
  }
  console.log('Sign in success! UID:', data.user.id);
  
  // Now try fetching the profile
  console.log('Fetching profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();
    
  console.log('Profile:', profile);
  console.log('Profile Error:', profileError);
}

test();
