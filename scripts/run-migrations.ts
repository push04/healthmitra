import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql: string) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.log('RPC exec_sql not available, trying alternative...');
    return { success: false, error };
  }
  return { success: true, data };
}

const sqlCommands = [
  // Add status column to profiles
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
  
  // Add columns to plans
  `ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
  
  // Add is_read to notifications
  `ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`,
  
  // Create wallets table
  `CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    minimum_balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create invoices table  
  `CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    invoice_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create contact_messages table
  `CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create departments table
  `CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create phr_categories table
  `CREATE TABLE IF NOT EXISTS public.phr_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create call_centre_agents table
  `CREATE TABLE IF NOT EXISTS public.call_centre_agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    agent_code TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create withdrawal_requests table
  `CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Create partner_commissions table
  `CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`
];

async function runMigrations() {
  console.log('Starting database migrations...');
  
  for (const sql of sqlCommands) {
    console.log(`Executing: ${sql.substring(0, 50)}...`);
    // Use raw SQL via postgrest
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!response.ok) {
        console.log(`Note: ${sql.substring(0, 30)}... - may need manual execution`);
      }
    } catch (e) {
      console.log(`Could not execute via API, please run the SQL file manually`);
    }
  }
  
  console.log('Migration script completed. Please run the SQL file manually if tables were not created.');
}

runMigrations();
