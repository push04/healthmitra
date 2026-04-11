#!/usr/bin/env node
/**
 * HealthMitra Database Setup Script
 * Creates all missing tables in Supabase
 * 
 * Usage: node create-missing-tables.js <SUPABASE_SERVICE_ROLE_KEY>
 * 
 * Or set environment variable: SUPABASE_SERVICE_ROLE_KEY=xxx node create-missing-tables.js
 */

const SUPABASE_URL = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';

const tables = [
  {
    name: 'faqs',
    sql: `CREATE TABLE IF NOT EXISTS faqs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'testimonials',
    sql: `CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      designation TEXT,
      company TEXT,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'pages',
    sql: `CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      content TEXT,
      template TEXT DEFAULT 'default',
      is_published BOOLEAN DEFAULT false,
      published_at TIMESTAMPTZ,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'homepage_sections',
    sql: `CREATE TABLE IF NOT EXISTS homepage_sections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      section_key TEXT UNIQUE NOT NULL,
      title TEXT,
      subtitle TEXT,
      content TEXT,
      settings JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'media_folders',
    sql: `CREATE TABLE IF NOT EXISTS media_folders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      parent_id UUID REFERENCES media_folders(id),
      path TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'media',
    sql: `CREATE TABLE IF NOT EXISTS media (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      folder_id UUID REFERENCES media_folders(id),
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      caption TEXT,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'partners',
    sql: `CREATE TABLE IF NOT EXISTS partners (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company_name TEXT,
      company_type TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      gst_number TEXT,
      logo_url TEXT,
      status TEXT DEFAULT 'active',
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'commissions',
    sql: `CREATE TABLE IF NOT EXISTS commissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      partner_id UUID,
      user_id UUID,
      plan_id UUID,
      sale_id UUID,
      amount DECIMAL(10,2) NOT NULL,
      percentage DECIMAL(5,2),
      commission_type TEXT DEFAULT 'sale',
      status TEXT DEFAULT 'pending',
      payout_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'withdrawals',
    sql: `CREATE TABLE IF NOT EXISTS withdrawals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      partner_id UUID,
      amount DECIMAL(10,2) NOT NULL,
      payment_method TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      upi_id TEXT,
      status TEXT DEFAULT 'pending',
      remarks TEXT,
      processed_by UUID,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'support_tickets',
    sql: `CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ticket_number TEXT UNIQUE NOT NULL,
      user_id UUID,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      assigned_to UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'support_replies',
    sql: `CREATE TABLE IF NOT EXISTS support_replies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
      user_id UUID,
      message TEXT NOT NULL,
      is_internal BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'payment_transactions',
    sql: `CREATE TABLE IF NOT EXISTS payment_transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      plan_id UUID,
      invoice_id UUID,
      transaction_id TEXT,
      gateway TEXT,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      gateway_response JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'activity_logs',
    sql: `CREATE TABLE IF NOT EXISTS activity_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id UUID,
      old_data JSONB,
      new_data JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  }
];

async function createTables() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2];
  
  if (!serviceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not provided');
    console.log('\nUsage:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=xxx node create-missing-tables.js');
    console.log('  Or: node create-missing-tables.js <SUPABASE_SERVICE_ROLE_KEY>');
    process.exit(1);
  }

  console.log('🔄 Creating missing tables in Supabase...');
  console.log(`📡 URL: ${SUPABASE_URL}\n`);

  let created = 0;
  let failed = 0;

  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ sql: table.sql })
      });

      if (response.ok) {
        console.log(`✅ Created: ${table.name}`);
        created++;
      } else {
        const error = await response.text();
        // If the function doesn't exist, try alternative approach
        if (error.includes('function') && error.includes('does not exist')) {
          console.log(`⚠️  Skipping ${table.name} - RPC function not available`);
          console.log(`   Please run the SQL manually in Supabase Dashboard > SQL Editor`);
          failed++;
        } else {
          console.log(`❌ Failed: ${table.name} - ${error.substring(0, 100)}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`❌ Error: ${table.name} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${failed} skipped/failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tables could not be created via API.');
    console.log('Please run the SQL below in Supabase Dashboard > SQL Editor:\n');
    console.log(tables.map(t => t.sql).join('\n\n'));
  }

  return { created, failed };
}

createTables().catch(console.error);
