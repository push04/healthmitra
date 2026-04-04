/**
 * HealthMitra — Direct PostgreSQL DB Audit & Migration Runner
 */
import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'db.umyjamvtynsteamwvztu.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Pushpal2004',
    ssl: { rejectUnauthorized: false }
});

function log(msg) { process.stdout.write(msg + '\n'); }
function ok(msg)  { log(`  ✓ ${msg}`); }
function fail(msg){ log(`  ✗ ${msg}`); }
function head(msg){ log(`\n══════════════════════════════════════\n  ${msg}\n══════════════════════════════════════`); }

async function query(sql, params = []) {
    const res = await client.query(sql, params);
    return res.rows;
}

async function scalar(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] ? Object.values(rows[0])[0] : null;
}

async function tableExists(t) {
    const r = await scalar(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`, [t]
    );
    return r === true;
}

async function colExists(t, c) {
    const r = await scalar(
        `SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2)`, [t, c]
    );
    return r === true;
}

async function indexExists(name) {
    const r = await scalar(`SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname=$1)`, [name]);
    return r === true;
}

async function constraintExists(name) {
    const r = await scalar(`SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conname=$1)`, [name]);
    return r === true;
}

async function run(sql) {
    await client.query(sql);
}

// ─── PHASE 1: Table Audit ────────────────────────────────────────────────────
async function auditTables() {
    head('PHASE 1: TABLE AUDIT');
    const tables = [
        'profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','reimbursement_claims',
        'wallet_transactions','wallets','withdrawal_requests',
        'notifications','phr_documents','phr_categories',
        'franchises','franchise_partners','coupons',
        'system_settings','audit_logs','cms_content',
        'cities','appointments','departments'
    ];
    const result = {};
    for (const t of tables) {
        result[t] = await tableExists(t);
        (result[t] ? ok : fail)(t);
    }
    return result;
}

// ─── PHASE 2: Column Audit ───────────────────────────────────────────────────
async function auditColumns() {
    head('PHASE 2: COLUMN AUDIT');
    const checks = [
        ['plans','duration_days'], ['plans','duration_months'], ['plans','status'],
        ['plans','is_active'], ['plans','type'], ['plans','is_featured'],
        ['notifications','recipient_id'], ['notifications','user_id'],
        ['notifications','is_read'], ['notifications','read'],
        ['notifications','sender_id'], ['notifications','action_url'],
        ['notifications','priority'], ['notifications','metadata'],
        ['service_requests','request_id_display'], ['service_requests','type'],
        ['service_requests','assigned_to'], ['service_requests','admin_notes'],
        ['profiles','status'], ['profiles','role'],
        ['ecard_members','coverage_amount'], ['ecard_members','member_id_code'],
        ['payments','plan_id'], ['payments','razorpay_order_id'], ['payments','payment_method'],
        ['reimbursement_claims','claim_id_display'], ['reimbursement_claims','rejection_reason'],
    ];
    const result = {};
    for (const [t, c] of checks) {
        result[`${t}.${c}`] = await colExists(t, c);
        (result[`${t}.${c}`] ? ok : fail)(`${t}.${c}`);
    }
    return result;
}

// ─── PHASE 3: Data Audit ────────────────────────────────────────────────────
async function auditData() {
    head('PHASE 3: DATA INTEGRITY');

    const tables = ['profiles','plans','ecard_members','payments','invoices',
                    'service_requests','reimbursement_claims','notifications','coupons','wallets'];
    for (const t of tables) {
        try {
            const count = await scalar(`SELECT COUNT(*) FROM ${t}`);
            ok(`${t}: ${count} rows`);
        } catch(e) {
            fail(`${t}: ${e.message}`);
        }
    }

    // Role distribution
    const roles = await query(`SELECT role, COUNT(*) as cnt FROM profiles GROUP BY role ORDER BY cnt DESC`);
    log(`\n  Profile roles: ${roles.map(r => `${r.role}=${r.cnt}`).join(', ') || 'no profiles'}`);

    // Payment statuses
    try {
        const statuses = await query(`SELECT status, COUNT(*) as cnt FROM payments GROUP BY status`);
        if (statuses.length > 0) log(`  Payment statuses: ${statuses.map(s => `${s.status}=${s.cnt}`).join(', ')}`);
    } catch(e) {}

    // Plans sample
    try {
        const plans = await query(`SELECT name, duration_days, status, type FROM plans LIMIT 5`);
        if (plans.length > 0) {
            log(`\n  Plans sample:`);
            plans.forEach(p => log(`    - ${p.name}: ${p.duration_days}d, status=${p.status}, type=${p.type}`));
        }
    } catch(e) {}

    // Check for duplicate request_id_display in service_requests
    try {
        const dups = await query(`
            SELECT request_id_display, COUNT(*) as cnt
            FROM service_requests
            WHERE request_id_display IS NOT NULL
            GROUP BY request_id_display HAVING COUNT(*) > 1
        `);
        if (dups.length > 0) fail(`Duplicate request_id_display values found: ${dups.length}`);
        else ok(`No duplicate request_id_display values`);
    } catch(e) {}

    // Check unique constraint on service_requests.request_id_display
    const hasUnique = await constraintExists('service_requests_request_id_display_key');
    (hasUnique ? ok : fail)(`Unique constraint on service_requests.request_id_display: ${hasUnique}`);
}

// ─── PHASE 4: Run All Migrations ────────────────────────────────────────────
async function runMigrations(tables, cols) {
    head('PHASE 4: MIGRATIONS');

    // Helper to run a migration step
    async function migrate(name, sql) {
        try {
            await run(sql);
            ok(name);
        } catch(e) {
            if (e.message.includes('already exists') || e.message.includes('duplicate')) {
                ok(`${name} (already done)`);
            } else {
                fail(`${name}: ${e.message}`);
            }
        }
    }

    // ── WITHDRAWAL REQUESTS ──
    if (!tables['withdrawal_requests']) {
        await migrate('Create withdrawal_requests table', `
            CREATE TABLE withdrawal_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                amount DECIMAL(12,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
                bank_name VARCHAR(255),
                bank_account VARCHAR(100),
                ifsc_code VARCHAR(20),
                admin_notes TEXT,
                processed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await migrate('Index withdrawal_requests.user_id', `CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id)`);
        await migrate('Index withdrawal_requests.status', `CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status)`);
        await migrate('Enable RLS on withdrawal_requests', `ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY`);
        await migrate('RLS: users view own withdrawals', `CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
        await migrate('RLS: users insert own withdrawals', `CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
        await migrate('RLS: admins manage all withdrawals', `CREATE POLICY "Admins manage all withdrawals" ON withdrawal_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    } else { ok('withdrawal_requests: exists'); }

    // ── REQUEST MESSAGES ──
    if (!tables['request_messages']) {
        await migrate('Create request_messages table', `
            CREATE TABLE request_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
                sender_id UUID REFERENCES profiles(id),
                message TEXT NOT NULL,
                attachments JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await migrate('Index request_messages.request_id', `CREATE INDEX idx_request_messages_request_id ON request_messages(request_id)`);
        await migrate('Enable RLS on request_messages', `ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY`);
        await migrate('RLS: request_messages select', `
            CREATE POLICY "View messages for own requests" ON request_messages FOR SELECT TO authenticated
            USING (EXISTS (SELECT 1 FROM service_requests WHERE id = request_messages.request_id AND user_id = auth.uid())
                   OR sender_id = auth.uid()
                   OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        `);
        await migrate('RLS: request_messages insert', `
            CREATE POLICY "Post messages" ON request_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid())
        `);
    } else { ok('request_messages: exists'); }

    // ── INVOICES ──
    if (!tables['invoices']) {
        await migrate('Create invoices table', `
            CREATE TABLE invoices (
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
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await migrate('Enable RLS on invoices', `ALTER TABLE invoices ENABLE ROW LEVEL SECURITY`);
        await migrate('RLS: invoices user select', `CREATE POLICY "Users view own invoices" ON invoices FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
        await migrate('RLS: invoices admin all', `CREATE POLICY "Admins manage all invoices" ON invoices FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    } else { ok('invoices: exists'); }

    // ── WALLETS ──
    if (!tables['wallets']) {
        await migrate('Create wallets table', `
            CREATE TABLE wallets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
                balance DECIMAL(12,2) DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await migrate('Enable RLS on wallets', `ALTER TABLE wallets ENABLE ROW LEVEL SECURITY`);
        await migrate('RLS: wallets user policies', `
            CREATE POLICY "Users manage own wallet" ON wallets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
        `);
    } else { ok('wallets: exists'); }

    // ── PHR CATEGORIES ──
    if (!tables['phr_categories']) {
        await migrate('Create phr_categories table', `
            CREATE TABLE phr_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await migrate('Seed phr_categories', `
            INSERT INTO phr_categories (name, icon, display_order) VALUES
            ('Prescriptions','pill',1),('Bills','receipt',2),
            ('Test Reports','flask',3),('General Records','folder',4),
            ('Discharge Summaries','file-text',5),('Vaccination Records','syringe',6)
            ON CONFLICT (name) DO NOTHING
        `);
    } else { ok('phr_categories: exists'); }

    // ── PLANS: missing columns ──
    if (!cols['plans.status']) {
        await migrate('plans: add status column', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);
        await migrate('plans: migrate is_active -> status', `UPDATE plans SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END WHERE status IS NULL OR status = ''`);
    }
    if (!cols['plans.type']) await migrate('plans: add type column', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'health'`);
    if (!cols['plans.is_featured']) await migrate('plans: add is_featured column', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`);
    if (!cols['plans.duration_days']) await migrate('plans: add duration_days column', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 365`);

    // ── NOTIFICATIONS: migrate to recipient_id schema ──
    if (!cols['notifications.recipient_id']) {
        await migrate('notifications: add recipient_id', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id UUID`);
        if (await colExists('notifications', 'user_id')) {
            await migrate('notifications: copy user_id -> recipient_id', `UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL`);
        }
    }
    if (!cols['notifications.sender_id']) await migrate('notifications: add sender_id', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID`);
    if (!cols['notifications.is_read']) {
        await migrate('notifications: add is_read', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`);
        if (await colExists('notifications', 'read')) {
            await migrate('notifications: migrate read -> is_read', `UPDATE notifications SET is_read = read WHERE is_read IS NULL`);
        }
    }
    if (!cols['notifications.action_url']) {
        await migrate('notifications: add action_url', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`);
        if (await colExists('notifications', 'action_link')) {
            await migrate('notifications: migrate action_link -> action_url', `UPDATE notifications SET action_url = action_link WHERE action_url IS NULL`);
        }
    }
    if (!cols['notifications.priority']) await migrate('notifications: add priority', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'`);
    if (!cols['notifications.metadata']) await migrate('notifications: add metadata', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'`);
    if (await colExists('notifications', 'recipient_id')) {
        await migrate('notifications: index on recipient_id', `CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id)`);
        await migrate('notifications: drop old SELECT policy', `DROP POLICY IF EXISTS "Users view own notifications" ON notifications`);
        await migrate('notifications: RLS select by recipient_id', `CREATE POLICY "Users view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id)`);
        await migrate('notifications: RLS update by recipient_id', `DROP POLICY IF EXISTS "Users can update own read status" ON notifications`);
        await migrate('notifications: RLS update policy', `CREATE POLICY "Users can update own read status" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id)`);
    }

    // ── SERVICE REQUESTS: missing columns ──
    if (!cols['service_requests.request_id_display']) {
        await migrate('service_requests: add request_id_display', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS request_id_display TEXT`);
        await migrate('service_requests: unique index on request_id_display', `CREATE UNIQUE INDEX IF NOT EXISTS service_requests_request_id_display_key ON service_requests(request_id_display) WHERE request_id_display IS NOT NULL`);
    }
    if (!cols['service_requests.type']) await migrate('service_requests: add type column', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS type VARCHAR(100)`);
    if (!cols['service_requests.assigned_to']) await migrate('service_requests: add assigned_to', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id)`);
    if (!cols['service_requests.admin_notes']) await migrate('service_requests: add admin_notes', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`);

    // ── PROFILES: missing status ──
    if (!cols['profiles.status']) await migrate('profiles: add status column', `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);

    // ── PAYMENTS: missing columns ──
    if (!cols['payments.plan_id']) await migrate('payments: add plan_id', `ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id UUID`);
    if (!cols['payments.payment_method']) await migrate('payments: add payment_method', `ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`);
    // Allow null on razorpay_order_id if it has NOT NULL
    try {
        await client.query(`ALTER TABLE payments ALTER COLUMN razorpay_order_id DROP NOT NULL`);
        ok('payments: razorpay_order_id made nullable');
    } catch(e) { ok('payments: razorpay_order_id already nullable'); }

    // ── REIMBURSEMENT CLAIMS: missing columns ──
    if (!cols['reimbursement_claims.claim_id_display']) await migrate('reimbursement_claims: add claim_id_display', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS claim_id_display TEXT`);
    if (!cols['reimbursement_claims.rejection_reason']) await migrate('reimbursement_claims: add rejection_reason', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS rejection_reason TEXT`);

    // ── ECARD MEMBERS ──
    if (!cols['ecard_members.coverage_amount']) await migrate('ecard_members: add coverage_amount', `ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12,2)`);
    if (!cols['ecard_members.member_id_code']) await migrate('ecard_members: add member_id_code', `ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS member_id_code TEXT UNIQUE`);

    // ── ADMIN RLS POLICIES ──
    await migrate('RLS: admins can view all profiles', `DROP POLICY IF EXISTS "Admins view all profiles" ON profiles`);
    await migrate('RLS: admins can manage all profiles', `CREATE POLICY "Admins view all profiles" ON profiles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))`);

    await migrate('RLS: admins view all service_requests', `DROP POLICY IF EXISTS "Admins view all requests" ON service_requests`);
    await migrate('RLS: create admin service_requests policy', `CREATE POLICY "Admins view all requests" ON service_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    await migrate('RLS: admins view all reimbursements', `DROP POLICY IF EXISTS "Admins manage all claims" ON reimbursement_claims`);
    await migrate('RLS: create admin reimbursements policy', `CREATE POLICY "Admins manage all claims" ON reimbursement_claims FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    await migrate('RLS: enable coupons RLS', `ALTER TABLE coupons ENABLE ROW LEVEL SECURITY`);
    await migrate('RLS: coupons admin access', `DROP POLICY IF EXISTS "Admins manage coupons" ON coupons`);
    await migrate('RLS: create admin coupons policy', `CREATE POLICY "Admins manage coupons" ON coupons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('RLS: coupons public read', `DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons`);
    await migrate('RLS: create public coupons read', `CREATE POLICY "Anyone can read active coupons" ON coupons FOR SELECT TO authenticated USING (is_active = true)`);
}

// ─── PHASE 5: Post-migration verification ───────────────────────────────────
async function verify() {
    head('PHASE 5: POST-MIGRATION VERIFICATION');

    const criticalColumns = [
        ['plans','status'], ['plans','type'], ['plans','is_featured'], ['plans','duration_days'],
        ['notifications','recipient_id'], ['notifications','is_read'], ['notifications','sender_id'],
        ['service_requests','request_id_display'], ['service_requests','type'],
        ['service_requests','assigned_to'], ['service_requests','admin_notes'],
        ['profiles','status'], ['payments','plan_id'], ['payments','payment_method'],
        ['reimbursement_claims','rejection_reason'],
        ['ecard_members','coverage_amount'],
    ];
    let passed = 0, failed = 0;
    for (const [t, c] of criticalColumns) {
        const exists = await colExists(t, c);
        if (exists) { ok(`${t}.${c}`); passed++; }
        else { fail(`${t}.${c} — STILL MISSING`); failed++; }
    }

    const criticalTables = ['withdrawal_requests','request_messages','invoices','wallets','phr_categories'];
    for (const t of criticalTables) {
        const exists = await tableExists(t);
        if (exists) { ok(`table: ${t}`); passed++; }
        else { fail(`table: ${t} — STILL MISSING`); failed++; }
    }

    log(`\n  Result: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// ─── PHASE 6: Verify .env.local credentials ─────────────────────────────────
async function verifyEnv() {
    head('PHASE 6: .env.local CREDENTIALS');
    const fs = (await import('fs')).default;
    const path = (await import('path')).default;

    const envPath = path.join(process.cwd(), '.env.local');
    const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDI3NzcsImV4cCI6MjA4NTE3ODc3N30.gBz3bpYjamUQIOPeVRZ8wkjX2tzJREA3Gf1rZExYQUE';
    const SRK  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWphbXZ0eW5zdGVhbXd2enR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwMjc3NywiZXhwIjoyMDg1MTc4Nzc3fQ.wMEenn29p0vR0T0qvD1z-Gogx8kPsgDQ01YBJnQod18';
    const URL  = 'https://umyjamvtynsteamwvztu.supabase.co';

    const required = {
        NEXT_PUBLIC_SUPABASE_URL: URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON,
        SUPABASE_SERVICE_ROLE_KEY: SRK,
    };

    let content = '';
    try { content = fs.readFileSync(envPath, 'utf-8'); } catch {}

    let updated = content;
    let changed = false;
    for (const [key, val] of Object.entries(required)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(updated)) {
            const current = updated.match(regex)[0].split('=').slice(1).join('=');
            if (current !== val) {
                updated = updated.replace(regex, `${key}=${val}`);
                fail(`${key}: updated`);
                changed = true;
            } else { ok(`${key}: correct`); }
        } else {
            updated += `\n${key}=${val}`;
            fail(`${key}: added`);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(envPath, updated);
        ok('.env.local saved');
    } else { ok('.env.local all correct — no changes needed'); }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    log('\n╔══════════════════════════════════════╗');
    log('║  HealthMitra DB Audit & Migration    ║');
    log('╚══════════════════════════════════════╝');

    await client.connect();
    log('  ✓ Connected to PostgreSQL');

    try {
        const tables = await auditTables();
        const cols   = await auditColumns();
        await auditData();
        await runMigrations(tables, cols);
        const ok2 = await verify();
        await verifyEnv();

        log('\n╔══════════════════════════════════════╗');
        log(ok2
            ? '║  ALL DONE — Database is healthy ✓    ║'
            : '║  DONE with warnings — check output   ║'
        );
        log('╚══════════════════════════════════════╝\n');
    } finally {
        await client.end();
    }
}

main().catch(e => { console.error(e); process.exit(1); });
