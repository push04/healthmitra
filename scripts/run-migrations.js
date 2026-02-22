const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSQL(sql) {
  const { data, error } = await supabase.rpc('pg_catalog.exec_sql', { query: sql });
  if (error) {
    console.log('Error:', error.message);
    return false;
  }
  return true;
}

async function main() {
  console.log('Running admin dashboard database fixes...\n');
  
  // 1. Add status to profiles
  console.log('1. Adding status column to profiles...');
  await runSQL(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
  
  // 2. Add status to plans
  console.log('2. Adding status column to plans...');
  await runSQL(`ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
  
  // 3. Add is_read to notifications
  console.log('3. Adding is_read column to notifications...');
  await runSQL(`ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`);
  
  // 4. Add read_at to notifications
  console.log('4. Adding read_at column to notifications...');
  await runSQL(`ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`);
  
  // 5. Create wallets table
  console.log('5. Creating wallets table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    minimum_balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 6. Create invoices table
  console.log('6. Creating invoices table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    invoice_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 7. Create contact_messages table
  console.log('7. Creating contact_messages table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 8. Create departments table
  console.log('8. Creating departments table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 9. Create phr_categories table
  console.log('9. Creating phr_categories table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.phr_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 10. Create call_centre_agents table
  console.log('10. Creating call_centre_agents table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.call_centre_agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    agent_code TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 11. Create withdrawal_requests table
  console.log('11. Creating withdrawal_requests table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 12. Create partner_commissions table
  console.log('12. Creating partner_commissions table...');
  await runSQL(`CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  
  // 13. Insert default departments
  console.log('13. Inserting default departments...');
  await runSQL(`INSERT INTO public.departments (id, name, description, is_active) 
    SELECT uuid_generate_v4(), 'Customer Support', 'Handle customer queries and issues', true
    WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Customer Support')`);
  await runSQL(`INSERT INTO public.departments (id, name, description, is_active)
    SELECT uuid_generate_v4(), 'Sales', 'Handle sales and inquiries', true
    WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Sales')`);
  await runSQL(`INSERT INTO public.departments (id, name, description, is_active)
    SELECT uuid_generate_v4(), 'Claims', 'Handle reimbursement claims', true
    WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Claims')`);
  
  // 14. Insert default PHR categories
  console.log('14. Inserting default PHR categories...');
  await runSQL(`INSERT INTO public.phr_categories (id, name, description, is_active)
    SELECT uuid_generate_v4(), 'Prescriptions', 'Doctor prescriptions and medicines', true
    WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Prescriptions')`);
  await runSQL(`INSERT INTO public.phr_categories (id, name, description, is_active)
    SELECT uuid_generate_v4(), 'Test Reports', 'Lab reports and diagnostic results', true
    WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Test Reports')`);
  await runSQL(`INSERT INTO public.phr_categories (id, name, description, is_active)
    SELECT uuid_generate_v4(), 'Bills', 'Medical bills and invoices', true
    WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Bills')`);
  
  // 15. Create indexes
  console.log('15. Creating indexes...');
  await runSQL(`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id)`);
  await runSQL(`CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id)`);
  await runSQL(`CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status)`);
  
  console.log('\n✅ Database migration completed!');
}

main().catch(console.error);
