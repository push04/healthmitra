import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure to run with --env-file=.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const email = 'admin@healthmitraus.com';
  const password = '@Admin123';

  console.log(`Testing login for ${email}...`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login failed:', error.message);
    process.exit(1);
  }

  console.log('Login successful! HTTP session established.');
  console.log('User ID:', data.user.id);

  console.log('Checking profile role...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Failed to fetch profile:', profileError.message);
    process.exit(1);
  }

  console.log('Profile role:', profile.role);
  if (profile.role === 'admin') {
    console.log('✅ Verification PASSED. User can login and has admin privileges.');
  } else {
    console.error('❌ Verification FAILED. User is not an admin.');
    process.exit(1);
  }
}

testLogin();
