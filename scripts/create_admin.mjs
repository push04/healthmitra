import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key. Make sure to run with --env-file=.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@healthmitraus.com';
  const password = '@Admin123';

  console.log(`Checking if admin ${email} exists...`);
  
  // Create or Update user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
      console.error('Error listing users', listError);
      return;
  }
  
  let user = users.find(u => u.email === email);
  if (!user) {
      console.log('User not found. Creating user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
              full_name: 'Admin User'
          }
      });
      if (createError) {
          console.error('Error creating user:', createError);
          return;
      }
      user = newUser.user;
      console.log('User created:', user.id);
  } else {
      console.log('User exists. Updating password and email_confirm...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: password,
          email_confirm: true,
          user_metadata: {
              full_name: 'Admin User'
          }
      });
      if (updateError) {
          console.error('Error updating user password:', updateError);
          return;
      }
      console.log('User password updated.');
  }

  // Update the profiles table
  console.log('Updating profile role to admin...');
  const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
          id: user.id,
          role: 'admin',
          full_name: 'Admin User',
          email: email
      }, { onConflict: 'id' });
      
  if (profileError) {
      console.error('Error updating profile role:', profileError);
  } else {
      console.log('Admin profile setup successfully.');
  }
}

createAdmin();
