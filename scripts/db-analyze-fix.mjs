/**
 * HealthMitra Database Analyzer & Fixer
 * Connects directly to Supabase, audits schema, runs all fixes.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://umyjamvtynsteamwvztu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwMjc3NywiZXhwIjoyMDg1MTc4Nzc3fQ.wMEenn29p0vR0T0qvD1z-Gogx8kPsgDQ01YBJnQod18';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Helper: run raw SQL via rpc if available, else via REST ─────────────────
async function sql(query) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ sql: query })
    });
    if (!res.ok) {
        // Fallback: try direct pg endpoint
        const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({ query })
        });
        if (!res2.ok) {
            const text = await res2.text();
            return { error: text, rows: null };
        }
        return { error: null, rows: await res2.json() };
    }
    return { error: null, rows: await res.json() };
}

// ─── Helper: check table existence & columns ────────────────────────────────
async function getTableColumns(table) {
    const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable,column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table);
    return { data, error };
}

async function tableExists(table) {
    const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);
    return !error || error.code !== '42P01'; // 42P01 = table does not exist
}

async function columnExists(table, column) {
    // query information_schema via REST (it's a view in pg)
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/column_exists`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({ p_table: table, p_column: column })
        }
    );
    if (res.ok) return await res.json();
    // fallback: try select
    const { data, error } = await supabase.from(table).select(column).limit(1);
    return !error;
}

// ─── PHASE 1: Audit existing tables ─────────────────────────────────────────
async function auditTables() {
    console.log('\n════════════════════════════════════════');
    console.log('  PHASE 1: AUDITING EXISTING TABLES');
    console.log('════════════════════════════════════════');

    const expectedTables = [
        'profiles', 'plans', 'ecard_members', 'payments', 'invoices',
        'service_requests', 'request_messages', 'reimbursement_claims',
        'wallet_transactions', 'wallets', 'withdrawal_requests',
        'notifications', 'phr_documents', 'phr_categories',
        'franchises', 'franchise_partners', 'coupons',
        'system_settings', 'audit_logs', 'cms_content',
        'cities', 'appointments', 'departments'
    ];

    const results = {};
    for (const table of expectedTables) {
        const exists = await tableExists(table);
        results[table] = exists;
        console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    }
    return results;
}

// ─── PHASE 2: Audit critical columns ────────────────────────────────────────
async function auditColumns() {
    console.log('\n════════════════════════════════════════');
    console.log('  PHASE 2: AUDITING CRITICAL COLUMNS');
    console.log('════════════════════════════════════════');

    const checks = [
        { table: 'plans', column: 'duration_days' },
        { table: 'plans', column: 'duration_months' },
        { table: 'plans', column: 'status' },
        { table: 'plans', column: 'is_active' },
        { table: 'plans', column: 'type' },
        { table: 'plans', column: 'is_featured' },
        { table: 'notifications', column: 'recipient_id' },
        { table: 'notifications', column: 'user_id' },
        { table: 'notifications', column: 'is_read' },
        { table: 'notifications', column: 'read' },
        { table: 'notifications', column: 'sender_id' },
        { table: 'service_requests', column: 'request_id_display' },
        { table: 'service_requests', column: 'type' },
        { table: 'service_requests', column: 'assigned_to' },
        { table: 'profiles', column: 'status' },
        { table: 'profiles', column: 'role' },
        { table: 'ecard_members', column: 'coverage_amount' },
        { table: 'ecard_members', column: 'member_id_code' },
        { table: 'payments', column: 'plan_id' },
        { table: 'payments', column: 'razorpay_order_id' },
        { table: 'payments', column: 'payment_method' },
    ];

    const results = {};
    for (const { table, column } of checks) {
        const exists = await columnExists(table, column);
        results[`${table}.${column}`] = exists;
        console.log(`  ${exists ? '✓' : '✗'} ${table}.${column}`);
    }
    return results;
}

// ─── PHASE 3: Check data integrity ──────────────────────────────────────────
async function auditData() {
    console.log('\n════════════════════════════════════════');
    console.log('  PHASE 3: DATA INTEGRITY CHECKS');
    console.log('════════════════════════════════════════');

    // Count records in each key table
    const tables = ['profiles', 'plans', 'ecard_members', 'payments', 'invoices',
                    'service_requests', 'reimbursement_claims', 'notifications', 'coupons'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`  ✗ ${table}: ${error.message}`);
        } else {
            console.log(`  ✓ ${table}: ${count} rows`);
        }
    }

    // Check for profiles with role='user' vs 'customer'
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
    const { count: customerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');
    const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    console.log(`\n  Profile roles: user=${userCount || 0}, customer=${customerCount || 0}, admin=${adminCount || 0}`);

    // Check payment statuses
    const { data: payStatuses } = await supabase.from('payments').select('status');
    if (payStatuses) {
        const statusCounts = {};
        payStatuses.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
        console.log(`  Payment statuses:`, statusCounts);
    }

    // Check plans duration columns
    const { data: plans } = await supabase.from('plans').select('id, name, duration_days').limit(3);
    if (plans && plans.length > 0) {
        console.log(`  Sample plans (duration_days):`, plans.map(p => `${p.name}: ${p.duration_days} days`));
    }
}

// ─── PHASE 4: Run all SQL migrations ────────────────────────────────────────
async function runMigrations(tableAudit, columnAudit) {
    console.log('\n════════════════════════════════════════');
    console.log('  PHASE 4: RUNNING SQL MIGRATIONS');
    console.log('════════════════════════════════════════');

    const migrations = [];

    // 1. withdrawal_requests table
    if (!tableAudit['withdrawal_requests']) {
        migrations.push({
            name: 'Create withdrawal_requests table',
            sql: `
                CREATE TABLE IF NOT EXISTS withdrawal_requests (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    customer_name VARCHAR(255),
                    customer_email VARCHAR(255),
                    amount DECIMAL(12, 2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
                    bank_name VARCHAR(255),
                    bank_account VARCHAR(100),
                    ifsc_code VARCHAR(20),
                    admin_notes TEXT,
                    processed_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
                CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
                ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
                CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
                DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawal_requests;
                CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
                DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;
                CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin')));
            `
        });
    }

    // 2. request_messages table
    if (!tableAudit['request_messages']) {
        migrations.push({
            name: 'Create request_messages table',
            sql: `
                CREATE TABLE IF NOT EXISTS request_messages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
                    sender_id UUID REFERENCES profiles(id),
                    message TEXT NOT NULL,
                    attachments JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_request_messages_request_id ON request_messages(request_id);
                ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS "Users can view messages for own requests" ON request_messages;
                CREATE POLICY "Users can view messages for own requests" ON request_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM service_requests WHERE id = request_messages.request_id AND user_id = auth.uid()) OR sender_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin')));
                DROP POLICY IF EXISTS "Authenticated users can post messages" ON request_messages;
                CREATE POLICY "Authenticated users can post messages" ON request_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
            `
        });
    }

    // 3. notifications - add recipient_id if missing
    if (tableAudit['notifications'] && !columnAudit['notifications.recipient_id']) {
        migrations.push({
            name: 'Add recipient_id to notifications',
            sql: `
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id UUID;
                UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL AND user_id IS NOT NULL;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
                CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
                DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
                CREATE POLICY "Users view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
                DROP POLICY IF EXISTS "Users can update own read status" ON notifications;
                CREATE POLICY "Users can update own read status" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
            `
        });
    }

    // 4. plans - add status, type, is_featured if missing
    const planFixes = [];
    if (tableAudit['plans'] && !columnAudit['plans.status']) {
        planFixes.push(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`);
        planFixes.push(`UPDATE plans SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END WHERE status IS NULL OR status = '';`);
    }
    if (tableAudit['plans'] && !columnAudit['plans.type']) {
        planFixes.push(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'health';`);
    }
    if (tableAudit['plans'] && !columnAudit['plans.is_featured']) {
        planFixes.push(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`);
    }
    if (planFixes.length > 0) {
        migrations.push({ name: 'Fix plans table columns', sql: planFixes.join('\n') });
    }

    // 5. service_requests - add missing columns
    const srFixes = [];
    if (tableAudit['service_requests'] && !columnAudit['service_requests.request_id_display']) {
        srFixes.push(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS request_id_display TEXT;`);
        srFixes.push(`CREATE UNIQUE INDEX IF NOT EXISTS service_requests_request_id_display_key ON service_requests(request_id_display) WHERE request_id_display IS NOT NULL;`);
    }
    if (tableAudit['service_requests'] && !columnAudit['service_requests.type']) {
        srFixes.push(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS type VARCHAR(100);`);
    }
    if (tableAudit['service_requests'] && !columnAudit['service_requests.assigned_to']) {
        srFixes.push(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);`);
    }
    if (srFixes.length > 0) {
        migrations.push({ name: 'Fix service_requests columns', sql: srFixes.join('\n') });
    }

    // 6. profiles - ensure status column exists
    if (tableAudit['profiles'] && !columnAudit['profiles.status']) {
        migrations.push({
            name: 'Add status column to profiles',
            sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`
        });
    }

    // 7. payments - add plan_id and payment_method if missing
    const payFixes = [];
    if (tableAudit['payments'] && !columnAudit['payments.plan_id']) {
        payFixes.push(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id UUID;`);
    }
    if (tableAudit['payments'] && !columnAudit['payments.payment_method']) {
        payFixes.push(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);`);
    }
    if (payFixes.length > 0) {
        migrations.push({ name: 'Fix payments table columns', sql: payFixes.join('\n') });
    }

    // 8. invoices table
    if (!tableAudit['invoices']) {
        migrations.push({
            name: 'Create invoices table',
            sql: `
                CREATE TABLE IF NOT EXISTS invoices (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    plan_id UUID,
                    invoice_number VARCHAR(50) UNIQUE,
                    plan_name VARCHAR(255),
                    amount DECIMAL(12,2),
                    gst DECIMAL(12,2) DEFAULT 0,
                    total DECIMAL(12,2),
                    payment_method VARCHAR(50),
                    transaction_id VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
                CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
                DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
                CREATE POLICY "Admins can view all invoices" ON invoices FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
            `
        });
    }

    // 9. wallets table
    if (!tableAudit['wallets']) {
        migrations.push({
            name: 'Create wallets table',
            sql: `
                CREATE TABLE IF NOT EXISTS wallets (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
                    balance DECIMAL(12,2) DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
                CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
                DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
                CREATE POLICY "Users can update own wallet" ON wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
                DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
                CREATE POLICY "Users can insert own wallet" ON wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
            `
        });
    }

    // 10. phr_categories table
    if (!tableAudit['phr_categories']) {
        migrations.push({
            name: 'Create phr_categories table',
            sql: `
                CREATE TABLE IF NOT EXISTS phr_categories (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name TEXT NOT NULL,
                    description TEXT,
                    icon TEXT,
                    is_active BOOLEAN DEFAULT true,
                    display_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                INSERT INTO phr_categories (name, icon, display_order) VALUES
                    ('Prescriptions', 'pill', 1),
                    ('Bills', 'receipt', 2),
                    ('Test Reports', 'flask', 3),
                    ('General Records', 'folder', 4),
                    ('Discharge Summaries', 'file-text', 5),
                    ('Vaccination Records', 'syringe', 6)
                ON CONFLICT DO NOTHING;
            `
        });
    }

    // Run all migrations
    console.log(`\n  Found ${migrations.length} migration(s) to run.`);

    for (const migration of migrations) {
        console.log(`\n  → Running: ${migration.name}`);
        try {
            // Use supabase rpc or direct insert approach
            // Since we can't run raw SQL directly via REST API without an exec function,
            // we'll split by statement and attempt each one
            const statements = migration.sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const stmt of statements) {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                        'apikey': SERVICE_ROLE_KEY,
                    },
                    body: JSON.stringify({ sql: stmt + ';' })
                });
                if (!res.ok && res.status !== 404) {
                    const text = await res.text();
                    console.log(`    ⚠ Statement may have failed: ${text.substring(0, 100)}`);
                }
            }
            console.log(`    ✓ Done`);
        } catch (err) {
            console.log(`    ✗ Error: ${err.message}`);
        }
    }
}

// ─── PHASE 5: Verify env variables match live credentials ───────────────────
async function verifyEnvFile() {
    console.log('\n════════════════════════════════════════');
    console.log('  PHASE 5: VERIFYING .env CREDENTIALS');
    console.log('════════════════════════════════════════');

    const fs = await import('fs');
    const path = await import('path');

    const envFiles = ['.env.local', '.env', '.env.development'];
    let envContent = null;
    let envFile = null;

    for (const f of envFiles) {
        try {
            envContent = fs.readFileSync(path.join(process.cwd(), f), 'utf-8');
            envFile = f;
            break;
        } catch {}
    }

    if (!envContent) {
        console.log('  ✗ No .env file found! Creating .env.local with correct credentials...');
        const envTemplate = `NEXT_PUBLIC_SUPABASE_URL=https://umyjamvtynsteamwvztu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDI3NzcsImV4cCI6MjA4NTE3ODc3N30.gBz3bpYjamUQIOPeVRZ8wkjX2tzJREA3Gf1rZExYQUE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwMjc3NywiZXhwIjoyMDg1MTc4Nzc3fQ.wMEenn29p0vR0T0qvD1z-Gogx8kPsgDQ01YBJnQod18
`;
        fs.writeFileSync(path.join(process.cwd(), '.env.local'), envTemplate);
        console.log('  ✓ Created .env.local');
        return;
    }

    console.log(`  Found: ${envFile}`);

    const checks = [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', expected: 'https://umyjamvtynsteamwvztu.supabase.co' },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', expected: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDI3NzcsImV4cCI6MjA4NTE3ODc3N30.gBz3bpYjamUQIOPeVRZ8wkjX2tzJREA3Gf1rZExYQUE' },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', expected: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwMjc3NywiZXhwIjoyMDg1MTc4Nzc3fQ.wMEenn29p0vR0T0qvD1z-Gogx8kPsgDQ01YBJnQod18' },
    ];

    let hasUpdates = false;
    let updatedContent = envContent;

    for (const { key, expected } of checks) {
        const regex = new RegExp(`^${key}=(.*)$`, 'm');
        const match = envContent.match(regex);

        if (!match) {
            console.log(`  ✗ ${key}: MISSING`);
            updatedContent += `\n${key}=${expected}`;
            hasUpdates = true;
        } else if (match[1].trim() !== expected) {
            console.log(`  ✗ ${key}: WRONG VALUE → fixing`);
            updatedContent = updatedContent.replace(regex, `${key}=${expected}`);
            hasUpdates = true;
        } else {
            console.log(`  ✓ ${key}: correct`);
        }
    }

    if (hasUpdates) {
        fs.writeFileSync(path.join(process.cwd(), envFile), updatedContent);
        console.log(`  ✓ Updated ${envFile}`);
    }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  HealthMitra DB Analyzer & Fixer       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`  Target: ${SUPABASE_URL}`);

    // Test connection
    const { data: test, error: connErr } = await supabase.from('profiles').select('id').limit(1);
    if (connErr && connErr.code === 'PGRST301') {
        console.error('\n  ✗ Connection failed:', connErr.message);
        process.exit(1);
    }
    console.log('  ✓ Connection successful');

    const tableAudit = await auditTables();
    const columnAudit = await auditColumns();
    await auditData();
    await runMigrations(tableAudit, columnAudit);
    await verifyEnvFile();

    console.log('\n════════════════════════════════════════');
    console.log('  COMPLETE');
    console.log('════════════════════════════════════════\n');
}

main().catch(console.error);
