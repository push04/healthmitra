/**
 * HealthMitra — Comprehensive DB Audit & Migration
 * New Supabase project: fbqwsfkpytexbdsfgqbr
 */
import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'db.fbqwsfkpytexbdsfgqbr.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Pushpal2004',
    ssl: { rejectUnauthorized: false }
});

function log(msg)  { process.stdout.write(msg + '\n'); }
function ok(msg)   { log(`  ✓ ${msg}`); }
function fail(msg) { log(`  ✗ ${msg}`); }
function info(msg) { log(`  → ${msg}`); }
function head(msg) { log(`\n══════════════════════════════════════════════\n  ${msg}\n══════════════════════════════════════════════`); }

async function query(sql, params = []) {
    const res = await client.query(sql, params);
    return res.rows;
}
async function scalar(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] ? Object.values(rows[0])[0] : null;
}
async function tableExists(t) {
    return await scalar(`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`, [t]);
}
async function colExists(t, c) {
    return await scalar(`SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2)`, [t, c]);
}
async function constraintExists(name) {
    return await scalar(`SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conname=$1)`, [name]);
}
async function indexExists(name) {
    return await scalar(`SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname=$1)`, [name]);
}
async function run(sql) {
    try {
        await client.query(sql);
        return true;
    } catch(e) {
        return e;
    }
}
async function migrate(name, sql) {
    const res = await run(sql);
    if (res === true) { ok(name); }
    else if (res.message && (res.message.includes('already exists') || res.message.includes('duplicate'))) { ok(`${name} (already done)`); }
    else { fail(`${name}: ${res.message}`); }
}

// ─── PHASE 1: Audit what exists ──────────────────────────────────────────────
async function audit() {
    head('PHASE 1: TABLE & COLUMN AUDIT');

    const tables = [
        'profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','request_timeline',
        'reimbursement_claims','wallet_transactions','wallets',
        'withdrawal_requests','notifications','phr_documents','phr_categories',
        'franchises','franchise_partners','coupons','system_settings',
        'audit_logs','cms_content','cities','appointments','departments',
        'plan_categories','partner_commissions','contact_messages'
    ];

    log('\n  Tables:');
    const tMap = {};
    for (const t of tables) {
        tMap[t] = await tableExists(t);
        (tMap[t] ? ok : fail)(t);
    }

    const colChecks = [
        // plans
        ['plans','status'],['plans','type'],['plans','is_featured'],
        ['plans','duration_days'],['plans','image_url'],
        // notifications
        ['notifications','recipient_id'],['notifications','is_read'],
        ['notifications','read_at'],['notifications','sender_id'],
        ['notifications','action_url'],['notifications','action_label'],
        ['notifications','priority'],['notifications','metadata'],['notifications','updated_at'],
        // service_requests
        ['service_requests','request_id_display'],['service_requests','admin_notes'],
        ['service_requests','subject'],['service_requests','description'],['service_requests','priority'],
        // profiles
        ['profiles','status'],['profiles','dob'],['profiles','blood_group'],
        ['profiles','gender'],['profiles','bank_holder_name'],
        // payments
        ['payments','plan_id'],['payments','payment_method'],['payments','payment_mode'],
        // invoices
        ['invoices','plan_id'],['invoices','plan_name'],
        ['invoices','gst'],['invoices','total'],['invoices','transaction_id'],['invoices','paid_at'],
        // ecard_members
        ['ecard_members','coverage_amount'],['ecard_members','emergency_contact_name'],
        ['ecard_members','emergency_contact_phone'],['ecard_members','allergies'],
        // franchises
        ['franchises','alt_phone'],['franchises','website'],
        ['franchises','modules'],['franchises','total_sales'],
        ['franchises','total_commission'],['franchises','total_members'],
        // audit_logs
        ['audit_logs','user_id'],['audit_logs','entity_type'],['audit_logs','entity_id'],
        // reimbursement_claims
        ['reimbursement_claims','claim_id_display'],['reimbursement_claims','rejection_reason'],
        ['reimbursement_claims','title'],['reimbursement_claims','amount'],
        ['reimbursement_claims','bill_date'],['reimbursement_claims','provider_name'],
        ['reimbursement_claims','customer_comments'],['reimbursement_claims','plan_name'],
        ['reimbursement_claims','admin_notes'],['reimbursement_claims','document_url'],
    ];

    log('\n  Columns:');
    const cMap = {};
    for (const [t, c] of colChecks) {
        cMap[`${t}.${c}`] = await colExists(t, c);
        (cMap[`${t}.${c}`] ? ok : fail)(`${t}.${c}`);
    }

    return { tMap, cMap };
}

// ─── PHASE 2: Row counts ──────────────────────────────────────────────────────
async function rowCounts() {
    head('PHASE 2: ROW COUNTS');
    const tables = ['profiles','plans','ecard_members','payments','invoices',
                    'service_requests','reimbursement_claims','notifications',
                    'coupons','wallets','system_settings','plan_categories','cities','franchises'];
    for (const t of tables) {
        try {
            const count = await scalar(`SELECT COUNT(*) FROM ${t}`);
            info(`${t}: ${count} rows`);
        } catch(e) { fail(`${t}: ${e.message}`); }
    }

    const roles = await query(`SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY COUNT(*) DESC`);
    if (roles.length > 0) info(`Profile roles: ${roles.map(r => `${r.role}=${r.count}`).join(', ')}`);
}

// ─── PHASE 3: Migrations ──────────────────────────────────────────────────────
async function runMigrations(tMap, cMap) {
    head('PHASE 3: APPLYING MIGRATIONS');

    // ── 1. profiles: add 'customer' to role CHECK & add missing columns ──
    await migrate('profiles: allow customer role',
        `ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check`);
    await migrate('profiles: re-add role check with customer',
        `ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user','admin','franchise_owner','doctor','diagnostic_center','pharmacy','customer'))`);
    if (!cMap['profiles.status'])
        await migrate('profiles: add status', `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
    if (!cMap['profiles.dob'])
        await migrate('profiles: add dob', `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE`);
    if (!cMap['profiles.blood_group'])
        await migrate('profiles: add blood_group', `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_group TEXT`);
    if (!cMap['profiles.gender'])
        await migrate('profiles: add gender', `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT`);
    if (!cMap['profiles.bank_holder_name'])
        await migrate('profiles: add bank fields', `
            ALTER TABLE profiles
              ADD COLUMN IF NOT EXISTS bank_holder_name TEXT,
              ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
              ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
              ADD COLUMN IF NOT EXISTS bank_name TEXT,
              ADD COLUMN IF NOT EXISTS bank_branch TEXT,
              ADD COLUMN IF NOT EXISTS account_type TEXT`);

    // ── 2. plans: add missing columns ──
    if (!cMap['plans.status'])
        await migrate('plans: add status', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
    await migrate('plans: set status from is_active',
        `UPDATE plans SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL`);
    if (!cMap['plans.type'])
        await migrate('plans: add type', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'B2C'`);
    if (!cMap['plans.is_featured'])
        await migrate('plans: add is_featured', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`);
    if (!cMap['plans.image_url'])
        await migrate('plans: add image_url', `ALTER TABLE plans ADD COLUMN IF NOT EXISTS image_url TEXT`);

    // ── 3. payments: add plan_id, payment_method; make razorpay_order_id nullable ──
    if (!cMap['payments.plan_id'])
        await migrate('payments: add plan_id', `ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id UUID`);
    if (!cMap['payments.payment_method'])
        await migrate('payments: add payment_method', `ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT`);
    // Sync payment_mode <-> payment_method
    await migrate('payments: sync payment_mode->payment_method',
        `UPDATE payments SET payment_method = payment_mode WHERE payment_method IS NULL AND payment_mode IS NOT NULL`);
    await migrate('payments: make razorpay_order_id nullable',
        `ALTER TABLE payments ALTER COLUMN razorpay_order_id DROP NOT NULL`);
    await migrate('payments: drop unique on razorpay_order_id to allow nulls',
        `ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_razorpay_order_id_key`);
    await migrate('payments: re-add unique partial index for non-null order_id',
        `CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_order_id_unique ON payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL`);

    // ── 4. invoices: add ALL missing columns ──
    if (!cMap['invoices.plan_id'])
        await migrate('invoices: add plan_id', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_id UUID`);
    if (!cMap['invoices.plan_name'])
        await migrate('invoices: add plan_name', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_name TEXT`);
    if (!cMap['invoices.gst'])
        await migrate('invoices: add gst', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gst DECIMAL(12,2) DEFAULT 0`);
    if (!cMap['invoices.total'])
        await migrate('invoices: add total', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12,2)`);
    if (!cMap['invoices.transaction_id'])
        await migrate('invoices: add transaction_id', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transaction_id TEXT`);
    if (!cMap['invoices.paid_at'])
        await migrate('invoices: add paid_at', `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`);
    // Ensure invoices has correct RLS
    await migrate('invoices: enable RLS', `ALTER TABLE invoices ENABLE ROW LEVEL SECURITY`);
    await migrate('invoices: drop old policies', `
        DROP POLICY IF EXISTS "Users view own invoices" ON invoices;
        DROP POLICY IF EXISTS "Admins manage all invoices" ON invoices`);
    await migrate('invoices: user select policy', `CREATE POLICY "Users view own invoices" ON invoices FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
    await migrate('invoices: admin all policy', `CREATE POLICY "Admins manage all invoices" ON invoices FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 5. notifications: ensure new schema columns exist ──
    if (!cMap['notifications.recipient_id']) {
        await migrate('notifications: add recipient_id', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id UUID`);
        await migrate('notifications: copy user_id->recipient_id', `UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL`);
    }
    if (!cMap['notifications.sender_id'])
        await migrate('notifications: add sender_id', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID`);
    if (!cMap['notifications.is_read']) {
        await migrate('notifications: add is_read', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`);
        await migrate('notifications: copy read->is_read', `UPDATE notifications SET is_read = read WHERE is_read IS NULL AND read IS NOT NULL`);
    }
    if (!cMap['notifications.read_at'])
        await migrate('notifications: add read_at', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`);
    if (!cMap['notifications.action_url']) {
        await migrate('notifications: add action_url', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`);
        await migrate('notifications: copy action_link->action_url', `UPDATE notifications SET action_url = action_link WHERE action_url IS NULL AND action_link IS NOT NULL`);
    }
    if (!cMap['notifications.action_label'])
        await migrate('notifications: add action_label', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT`);
    if (!cMap['notifications.priority'])
        await migrate('notifications: add priority', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'`);
    if (!cMap['notifications.metadata'])
        await migrate('notifications: add metadata', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`);
    if (!cMap['notifications.updated_at'])
        await migrate('notifications: add updated_at', `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
    // Remove type CHECK constraint so any string type is accepted
    await migrate('notifications: drop type check constraint', `ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check`);
    // Fix RLS to use recipient_id
    await migrate('notifications: drop old user_id policy', `DROP POLICY IF EXISTS "Users view own notifications" ON notifications`);
    await migrate('notifications: add recipient_id select policy',
        `CREATE POLICY "Users view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id OR auth.uid() = user_id)`);
    await migrate('notifications: drop old update policy', `DROP POLICY IF EXISTS "Users can update own read status" ON notifications`);
    await migrate('notifications: add update policy',
        `CREATE POLICY "Users can update own read status" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id OR auth.uid() = user_id)`);
    await migrate('notifications: admin insert policy', `DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications`);
    await migrate('notifications: admin all policy',
        `CREATE POLICY "Admins manage all notifications" ON notifications FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('notifications: authenticated insert',
        `DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications`);
    await migrate('notifications: allow authenticated insert',
        `CREATE POLICY "Authenticated users can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true)`);

    // ── 6. service_requests: add missing columns, auto-generate request_id_display ──
    if (!cMap['service_requests.admin_notes'])
        await migrate('service_requests: add admin_notes', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
    if (!cMap['service_requests.subject'])
        await migrate('service_requests: add subject', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS subject TEXT`);
    if (!cMap['service_requests.description'])
        await migrate('service_requests: add description', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS description TEXT`);
    if (!cMap['service_requests.priority'])
        await migrate('service_requests: add priority', `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'`);
    // Make request_id_display nullable so insert without it works, then add trigger
    await migrate('service_requests: drop NOT NULL on request_id_display',
        `ALTER TABLE service_requests ALTER COLUMN request_id_display DROP NOT NULL`);
    // Create sequence and trigger for auto-generating request_id_display
    await migrate('service_requests: create sequence',
        `CREATE SEQUENCE IF NOT EXISTS sr_seq START 1000`);
    await migrate('service_requests: set sequence to max existing',
        `SELECT setval('sr_seq', GREATEST((SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(request_id_display, '[^0-9]', '', 'g') AS BIGINT)) , 999) FROM service_requests WHERE request_id_display ~ '^SR-'), 999))`);
    await migrate('service_requests: create auto-id trigger fn', `
        CREATE OR REPLACE FUNCTION generate_request_id()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.request_id_display IS NULL THEN
                NEW.request_id_display := 'SR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('sr_seq')::TEXT, 4, '0');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`);
    await migrate('service_requests: drop old trigger', `DROP TRIGGER IF EXISTS tr_auto_request_id ON service_requests`);
    await migrate('service_requests: create trigger',
        `CREATE TRIGGER tr_auto_request_id BEFORE INSERT ON service_requests FOR EACH ROW EXECUTE FUNCTION generate_request_id()`);
    // Allow users to insert service requests
    await migrate('service_requests: user insert policy', `DROP POLICY IF EXISTS "Users can create service requests" ON service_requests`);
    await migrate('service_requests: add user insert policy',
        `CREATE POLICY "Users can create service requests" ON service_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);

    // ── 7. reimbursement_claims: add missing columns ──
    if (!cMap['reimbursement_claims.title'])
        await migrate('reimbursement_claims: add title', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS title TEXT`);
    if (!cMap['reimbursement_claims.amount'])
        await migrate('reimbursement_claims: add amount', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2)`);
    if (!cMap['reimbursement_claims.bill_date'])
        await migrate('reimbursement_claims: add bill_date', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS bill_date DATE`);
    if (!cMap['reimbursement_claims.provider_name'])
        await migrate('reimbursement_claims: add provider_name', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS provider_name TEXT`);
    if (!cMap['reimbursement_claims.customer_comments'])
        await migrate('reimbursement_claims: add customer_comments', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS customer_comments TEXT`);
    if (!cMap['reimbursement_claims.plan_name'])
        await migrate('reimbursement_claims: add plan_name', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS plan_name TEXT`);
    if (!cMap['reimbursement_claims.admin_notes'])
        await migrate('reimbursement_claims: add admin_notes', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
    if (!cMap['reimbursement_claims.document_url'])
        await migrate('reimbursement_claims: add document_url', `ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS document_url TEXT`);
    // Sync amount from amount_requested
    await migrate('reimbursement_claims: sync amount',
        `UPDATE reimbursement_claims SET amount = amount_requested WHERE amount IS NULL AND amount_requested IS NOT NULL`);
    // Make claim_id_display auto-generate
    await migrate('reimbursement_claims: make claim_id_display nullable',
        `ALTER TABLE reimbursement_claims ALTER COLUMN claim_id_display DROP NOT NULL`);
    await migrate('reimbursement_claims: create sequence',
        `CREATE SEQUENCE IF NOT EXISTS claim_seq START 100`);
    await migrate('reimbursement_claims: create auto-id trigger fn', `
        CREATE OR REPLACE FUNCTION generate_claim_id()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.claim_id_display IS NULL THEN
                NEW.claim_id_display := 'CLM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('claim_seq')::TEXT, 4, '0');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`);
    await migrate('reimbursement_claims: drop old trigger', `DROP TRIGGER IF EXISTS tr_auto_claim_id ON reimbursement_claims`);
    await migrate('reimbursement_claims: create trigger',
        `CREATE TRIGGER tr_auto_claim_id BEFORE INSERT ON reimbursement_claims FOR EACH ROW EXECUTE FUNCTION generate_claim_id()`);
    // RLS: allow user insert
    await migrate('reimbursement_claims: user insert policy', `DROP POLICY IF EXISTS "Users can create claims" ON reimbursement_claims`);
    await migrate('reimbursement_claims: add user insert policy',
        `CREATE POLICY "Users can create claims" ON reimbursement_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
    await migrate('reimbursement_claims: user update policy', `DROP POLICY IF EXISTS "Users can update own claims" ON reimbursement_claims`);
    await migrate('reimbursement_claims: add user update policy',
        `CREATE POLICY "Users can update own claims" ON reimbursement_claims FOR UPDATE TO authenticated USING (auth.uid() = user_id)`);

    // ── 8. franchises: add missing columns ──
    if (!cMap['franchises.alt_phone'])
        await migrate('franchises: add alt_phone', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS alt_phone TEXT`);
    if (!cMap['franchises.website'])
        await migrate('franchises: add website', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS website TEXT`);
    if (!cMap['franchises.modules'])
        await migrate('franchises: add modules', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '[]'`);
    if (!cMap['franchises.total_sales'])
        await migrate('franchises: add total_sales', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0`);
    if (!cMap['franchises.total_commission'])
        await migrate('franchises: add total_commission', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_commission DECIMAL(12,2) DEFAULT 0`);
    if (!cMap['franchises.total_members'])
        await migrate('franchises: add total_members', `ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0`);
    // Franchise RLS
    await migrate('franchises: enable RLS', `ALTER TABLE franchises ENABLE ROW LEVEL SECURITY`);
    await migrate('franchises: drop old policies', `
        DROP POLICY IF EXISTS "Admins manage all franchises" ON franchises;
        DROP POLICY IF EXISTS "Franchise owners view own" ON franchises`);
    await migrate('franchises: admin all policy',
        `CREATE POLICY "Admins manage all franchises" ON franchises FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('franchises: owner view own',
        `CREATE POLICY "Franchise owners view own" ON franchises FOR SELECT TO authenticated USING (owner_user_id = auth.uid())`);

    // ── 9. audit_logs: add entity_type, entity_id ──
    if (!cMap['audit_logs.user_id'])
        await migrate('audit_logs: add user_id', `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id UUID`);
    if (!cMap['audit_logs.entity_type'])
        await migrate('audit_logs: add entity_type', `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT`);
    if (!cMap['audit_logs.entity_id'])
        await migrate('audit_logs: add entity_id', `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID`);
    // Make audit_logs insert accessible to authenticated
    await migrate('audit_logs: enable RLS', `ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`);
    await migrate('audit_logs: drop old policies', `
        DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;
        DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON audit_logs`);
    await migrate('audit_logs: admin select policy',
        `CREATE POLICY "Admins view audit logs" ON audit_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('audit_logs: authenticated insert policy',
        `CREATE POLICY "Authenticated can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true)`);

    // ── 10. ecard_members: add missing columns ──
    if (!cMap['ecard_members.emergency_contact_name'])
        await migrate('ecard_members: add emergency_contact_name', `ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT`);
    if (!cMap['ecard_members.emergency_contact_phone'])
        await migrate('ecard_members: add emergency_contact_phone', `ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT`);
    if (!cMap['ecard_members.allergies'])
        await migrate('ecard_members: add allergies', `ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS allergies TEXT`);
    // Fix gender CHECK (allow 'Male','Female','Other' in addition to 'M','F','Other')
    await migrate('ecard_members: drop gender check', `ALTER TABLE ecard_members DROP CONSTRAINT IF EXISTS ecard_members_gender_check`);
    await migrate('ecard_members: re-add gender check',
        `ALTER TABLE ecard_members ADD CONSTRAINT ecard_members_gender_check CHECK (gender IN ('M','F','Other','Male','Female','Unknown'))`);
    // Allow user insert into ecard_members
    await migrate('ecard_members: user insert policy', `DROP POLICY IF EXISTS "Users can insert their own members" ON ecard_members`);
    await migrate('ecard_members: add user insert policy',
        `CREATE POLICY "Users can insert their own members" ON ecard_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
    await migrate('ecard_members: user update policy', `DROP POLICY IF EXISTS "Users can update their own members" ON ecard_members`);
    await migrate('ecard_members: add user update policy',
        `CREATE POLICY "Users can update their own members" ON ecard_members FOR UPDATE TO authenticated USING (auth.uid() = user_id)`);
    await migrate('ecard_members: admin all policy', `DROP POLICY IF EXISTS "Admins manage all members" ON ecard_members`);
    await migrate('ecard_members: add admin all policy',
        `CREATE POLICY "Admins manage all members" ON ecard_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 11. wallets: ensure user auto-insert on profile creation ──
    await migrate('wallets: enable RLS', `ALTER TABLE wallets ENABLE ROW LEVEL SECURITY`);
    await migrate('wallets: drop old policies', `
        DROP POLICY IF EXISTS "Users manage own wallet" ON wallets;
        DROP POLICY IF EXISTS "Admins manage all wallets" ON wallets`);
    await migrate('wallets: user all policy',
        `CREATE POLICY "Users manage own wallet" ON wallets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`);
    await migrate('wallets: admin all policy',
        `CREATE POLICY "Admins manage all wallets" ON wallets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 12. wallet_transactions: add RLS ──
    await migrate('wallet_transactions: enable RLS', `ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY`);
    await migrate('wallet_transactions: drop old policies', `
        DROP POLICY IF EXISTS "Users view own wallet txns" ON wallet_transactions;
        DROP POLICY IF EXISTS "Admins manage all wallet txns" ON wallet_transactions`);
    await migrate('wallet_transactions: user select policy',
        `CREATE POLICY "Users view own wallet txns" ON wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
    await migrate('wallet_transactions: user insert policy',
        `DROP POLICY IF EXISTS "Users can insert wallet txns" ON wallet_transactions`);
    await migrate('wallet_transactions: add user insert policy',
        `CREATE POLICY "Users can insert wallet txns" ON wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
    await migrate('wallet_transactions: admin all policy',
        `CREATE POLICY "Admins manage all wallet txns" ON wallet_transactions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 13. withdrawal_requests: fix schema ──
    await migrate('withdrawal_requests: enable RLS', `ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY`);
    await migrate('withdrawal_requests: drop old policies', `
        DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawal_requests;
        DROP POLICY IF EXISTS "Users insert own withdrawals" ON withdrawal_requests;
        DROP POLICY IF EXISTS "Admins manage all withdrawals" ON withdrawal_requests`);
    await migrate('withdrawal_requests: user select',
        `CREATE POLICY "Users view own withdrawals" ON withdrawal_requests FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
    await migrate('withdrawal_requests: user insert',
        `CREATE POLICY "Users insert own withdrawals" ON withdrawal_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
    await migrate('withdrawal_requests: admin all',
        `CREATE POLICY "Admins manage all withdrawals" ON withdrawal_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 14. payments: RLS ──
    await migrate('payments: enable RLS', `ALTER TABLE payments ENABLE ROW LEVEL SECURITY`);
    await migrate('payments: drop old policies', `
        DROP POLICY IF EXISTS "Users view own payments" ON payments;
        DROP POLICY IF EXISTS "Admins view all payments" ON payments`);
    await migrate('payments: user insert policy', `DROP POLICY IF EXISTS "Users can insert payments" ON payments`);
    await migrate('payments: user insert',
        `CREATE POLICY "Users can insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`);
    await migrate('payments: user select',
        `CREATE POLICY "Users view own payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id)`);
    await migrate('payments: admin all',
        `CREATE POLICY "Admins view all payments" ON payments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 15. profiles: admin management ──
    await migrate('profiles: drop old admin policy', `DROP POLICY IF EXISTS "Admins view all profiles" ON profiles`);
    await migrate('profiles: admin all policy',
        `CREATE POLICY "Admins view all profiles" ON profiles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))`);
    await migrate('profiles: user insert own',
        `DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles`);
    await migrate('profiles: re-add user insert own',
        `CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`);

    // ── 16. phr_documents: RLS ──
    await migrate('phr_documents: enable RLS', `ALTER TABLE phr_documents ENABLE ROW LEVEL SECURITY`);
    await migrate('phr_documents: drop old policies', `
        DROP POLICY IF EXISTS "Users view own PHR" ON phr_documents;
        DROP POLICY IF EXISTS "Admins manage all PHR" ON phr_documents`);
    await migrate('phr_documents: user all policy',
        `CREATE POLICY "Users view own PHR" ON phr_documents FOR ALL TO authenticated USING (auth.uid() = user_id)`);
    await migrate('phr_documents: admin all policy',
        `CREATE POLICY "Admins manage all PHR" ON phr_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 17. plan_categories: RLS ──
    await migrate('plan_categories: enable RLS', `ALTER TABLE plan_categories ENABLE ROW LEVEL SECURITY`);
    await migrate('plan_categories: drop old policies', `
        DROP POLICY IF EXISTS "Public read plan_categories" ON plan_categories;
        DROP POLICY IF EXISTS "Admins manage plan_categories" ON plan_categories`);
    await migrate('plan_categories: public read',
        `CREATE POLICY "Public read plan_categories" ON plan_categories FOR SELECT USING (true)`);
    await migrate('plan_categories: admin all',
        `CREATE POLICY "Admins manage plan_categories" ON plan_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 18. plans: RLS ──
    await migrate('plans: enable RLS', `ALTER TABLE plans ENABLE ROW LEVEL SECURITY`);
    await migrate('plans: drop old policies', `
        DROP POLICY IF EXISTS "Public read plans" ON plans;
        DROP POLICY IF EXISTS "Admins manage plans" ON plans`);
    await migrate('plans: public read',
        `CREATE POLICY "Public read plans" ON plans FOR SELECT USING (true)`);
    await migrate('plans: admin all',
        `CREATE POLICY "Admins manage plans" ON plans FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 19. coupons: RLS ──
    await migrate('coupons: enable RLS', `ALTER TABLE coupons ENABLE ROW LEVEL SECURITY`);
    await migrate('coupons: drop old policies', `
        DROP POLICY IF EXISTS "Admins manage coupons" ON coupons;
        DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons`);
    await migrate('coupons: admin all',
        `CREATE POLICY "Admins manage coupons" ON coupons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('coupons: public read active',
        `CREATE POLICY "Anyone can read active coupons" ON coupons FOR SELECT TO authenticated USING (is_active = true)`);

    // ── 20. system_settings: update existing keys ──
    await migrate('system_settings: upsert razorpay_key_id placeholder',
        `INSERT INTO system_settings (key, value, description, is_secure) VALUES ('razorpay_key_id', 'rzp_test_placeholder_key', 'Razorpay Key ID', false) ON CONFLICT (key) DO NOTHING`);

    // ── 21. request_messages: RLS ──
    await migrate('request_messages: enable RLS', `ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY`);
    await migrate('request_messages: drop old policies', `
        DROP POLICY IF EXISTS "View messages for own requests" ON request_messages;
        DROP POLICY IF EXISTS "Post messages" ON request_messages;
        DROP POLICY IF EXISTS "Admins view all messages" ON request_messages`);
    await migrate('request_messages: user select',
        `CREATE POLICY "View messages for own requests" ON request_messages FOR SELECT TO authenticated
         USING (EXISTS (SELECT 1 FROM service_requests sr WHERE sr.id = request_messages.request_id AND sr.user_id = auth.uid())
                OR sender_id = auth.uid()
                OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
    await migrate('request_messages: user insert',
        `CREATE POLICY "Post messages" ON request_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid())`);

    // ── 22. cms_content: RLS ──
    await migrate('cms_content: enable RLS', `ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY`);
    await migrate('cms_content: drop old policies', `
        DROP POLICY IF EXISTS "Public read cms" ON cms_content;
        DROP POLICY IF EXISTS "Admins manage cms" ON cms_content`);
    await migrate('cms_content: public read',
        `CREATE POLICY "Public read cms" ON cms_content FOR SELECT USING (true)`);
    await migrate('cms_content: admin all',
        `CREATE POLICY "Admins manage cms" ON cms_content FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);

    // ── 23. departments: RLS ──
    await migrate('departments: enable RLS', `ALTER TABLE departments ENABLE ROW LEVEL SECURITY`);
    await migrate('departments: drop old policies', `
        DROP POLICY IF EXISTS "Public read departments" ON departments;
        DROP POLICY IF EXISTS "Admins manage departments" ON departments`);
    await migrate('departments: public read',
        `CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true)`);
    await migrate('departments: admin all',
        `CREATE POLICY "Admins manage departments" ON departments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`);
}

// ─── PHASE 4: Data integrity fixes ───────────────────────────────────────────
async function dataFixes() {
    head('PHASE 4: DATA INTEGRITY FIXES');

    // Ensure all existing profiles with old customer data get proper status
    await migrate('profiles: set active status for profiles without status',
        `UPDATE profiles SET status = 'active' WHERE status IS NULL`);

    // Fix notifications: ensure all have recipient_id set
    await migrate('notifications: backfill recipient_id from user_id',
        `UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL AND user_id IS NOT NULL`);

    // Fix plans: ensure all have status
    await migrate('plans: backfill status',
        `UPDATE plans SET status = 'active' WHERE status IS NULL AND is_active = true`);
    await migrate('plans: backfill inactive status',
        `UPDATE plans SET status = 'inactive' WHERE status IS NULL AND is_active = false`);

    // Ensure admin profile has correct role
    const adminCheck = await scalar(`SELECT COUNT(*) FROM profiles WHERE role = 'admin'`);
    info(`Admin profiles: ${adminCheck}`);

    // Ensure existing wallets for all profiles
    const profilesWithoutWallets = await scalar(`
        SELECT COUNT(*) FROM profiles p
        WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id)
    `);
    info(`Profiles without wallets: ${profilesWithoutWallets}`);

    if (parseInt(profilesWithoutWallets) > 0) {
        await migrate('wallets: create missing wallets for all profiles',
            `INSERT INTO wallets (user_id, balance, currency)
             SELECT p.id, 0, 'INR' FROM profiles p
             WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id)
             ON CONFLICT DO NOTHING`);
    }
}

// ─── PHASE 5: Final verification ─────────────────────────────────────────────
async function verify() {
    head('PHASE 5: FINAL VERIFICATION');

    const criticalCols = [
        ['plans','status'],['plans','type'],['plans','is_featured'],['plans','image_url'],
        ['notifications','recipient_id'],['notifications','is_read'],['notifications','sender_id'],
        ['notifications','priority'],['notifications','metadata'],
        ['service_requests','admin_notes'],['service_requests','priority'],
        ['profiles','status'],
        ['payments','plan_id'],['payments','payment_method'],
        ['invoices','plan_id'],['invoices','plan_name'],['invoices','gst'],['invoices','total'],['invoices','transaction_id'],
        ['franchises','alt_phone'],['franchises','website'],['franchises','modules'],
        ['audit_logs','entity_type'],['audit_logs','entity_id'],['audit_logs','user_id'],
        ['ecard_members','emergency_contact_name'],['ecard_members','allergies'],
        ['reimbursement_claims','title'],['reimbursement_claims','amount'],
        ['reimbursement_claims','provider_name'],['reimbursement_claims','admin_notes'],
    ];

    let passed = 0, failed = 0;
    for (const [t, c] of criticalCols) {
        const exists = await colExists(t, c);
        if (exists) { ok(`${t}.${c}`); passed++; }
        else { fail(`${t}.${c} — STILL MISSING`); failed++; }
    }

    // Check row counts
    log('\n  Final row counts:');
    for (const t of ['profiles','plans','ecard_members','wallets','notifications','coupons','system_settings']) {
        try {
            const count = await scalar(`SELECT COUNT(*) FROM ${t}`);
            ok(`${t}: ${count} rows`);
        } catch(e) { fail(`${t}: ${e.message}`); }
    }

    // Check triggers
    const srTrigger = await scalar(`SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name='tr_auto_request_id' AND event_object_table='service_requests'`);
    const claimTrigger = await scalar(`SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name='tr_auto_claim_id' AND event_object_table='reimbursement_claims'`);
    (parseInt(srTrigger) > 0 ? ok : fail)(`trigger: tr_auto_request_id on service_requests`);
    (parseInt(claimTrigger) > 0 ? ok : fail)(`trigger: tr_auto_claim_id on reimbursement_claims`);

    log(`\n  Result: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    log('\n╔════════════════════════════════════════════╗');
    log('║  HealthMitra — Comprehensive DB Migration  ║');
    log('║  Project: fbqwsfkpytexbdsfgqbr             ║');
    log('╚════════════════════════════════════════════╝');

    await client.connect();
    ok('Connected to PostgreSQL @ fbqwsfkpytexbdsfgqbr');

    try {
        const { tMap, cMap } = await audit();
        await rowCounts();
        await runMigrations(tMap, cMap);
        await dataFixes();
        const allOk = await verify();

        log('\n╔════════════════════════════════════════════╗');
        log(allOk
            ? '║  ALL DONE — Database fully synchronized ✓  ║'
            : '║  DONE with some warnings — check output    ║');
        log('╚════════════════════════════════════════════╝\n');
    } finally {
        await client.end();
    }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
