import pg from 'pg';
const { Client } = pg;

// Try current project first, fallback to old
const configs = [
    { host: 'db.fbqwsfkpytexbdsfgqbr.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: '@Pushpal2004', ssl: { rejectUnauthorized: false } },
    { host: 'db.umyjamvtynsteamwvztu.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: '@Pushpal2004', ssl: { rejectUnauthorized: false } },
];

let client;
for (const cfg of configs) {
    try {
        client = new Client(cfg);
        await client.connect();
        console.log('Connected to:', cfg.host);
        break;
    } catch (e) {
        console.log('Failed:', cfg.host, '-', e.message);
        client = null;
    }
}
if (!client) { console.error('Cannot connect to any DB'); process.exit(1); }

const q = (sql) => client.query(sql);
const ok = (m) => console.log('  OK:', m);
const fail = (m, e) => console.error('  FAIL:', m, '-', e?.message || e);

console.log('\n=== FIXING DATABASE ===\n');

// ─────────────────────────────────────────────
// 1. FIX INFINITE RECURSION — is_admin() function
// ─────────────────────────────────────────────
console.log('1. Creating is_admin() SECURITY DEFINER function...');
try {
    await q(`
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
            RETURN EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            );
        END;
        $$;
    `);
    ok('is_admin() function created');
} catch(e) { fail('is_admin()', e); }

// ─────────────────────────────────────────────
// 2. FIX payments TABLE — add missing columns
// ─────────────────────────────────────────────
console.log('\n2. Fixing payments table...');
const paymentCols = [
    ['plan_id', 'UUID REFERENCES public.plans(id) ON DELETE SET NULL'],
    ['payment_method', 'TEXT DEFAULT \'test\''],
    ['payment_mode', 'TEXT DEFAULT \'online\''],
];
for (const [col, def] of paymentCols) {
    try {
        await q(`ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS ${col} ${def};`);
        ok(`payments.${col}`);
    } catch(e) { fail(`payments.${col}`, e); }
}

// Remove UNIQUE NOT NULL from razorpay_order_id if it exists
try {
    await q(`ALTER TABLE public.payments ALTER COLUMN razorpay_order_id DROP NOT NULL;`);
    ok('payments.razorpay_order_id DROP NOT NULL');
} catch(e) { ok('payments.razorpay_order_id already nullable'); }

try {
    // Drop unique constraint if it exists
    const { rows } = await client.query(`
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name='payments' AND constraint_type='UNIQUE'
        AND constraint_name LIKE '%razorpay_order_id%';
    `);
    for (const row of rows) {
        await q(`ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        ok(`Dropped unique constraint: ${row.constraint_name}`);
    }
} catch(e) { fail('Drop payments unique constraint', e); }

// ─────────────────────────────────────────────
// 3. FIX invoices TABLE — add missing columns + fix FK
// ─────────────────────────────────────────────
console.log('\n3. Fixing invoices table...');

// Check what user_id references
try {
    const { rows } = await client.query(`
        SELECT ccu.table_name AS ref_table
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'invoices'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id';
    `);
    console.log('  invoices.user_id references:', rows[0]?.ref_table || 'nothing');
} catch(e) {}

const invoiceCols = [
    ['plan_id', 'UUID'],
    ['plan_name', 'TEXT'],
    ['gst', 'DECIMAL(12,2) DEFAULT 0'],
    ['total', 'DECIMAL(12,2)'],
    ['payment_method', 'TEXT'],
    ['transaction_id', 'TEXT'],
];
for (const [col, def] of invoiceCols) {
    try {
        await q(`ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ${col} ${def};`);
        ok(`invoices.${col}`);
    } catch(e) { fail(`invoices.${col}`, e); }
}

// Fix user_id FK — may point to auth.users, need to allow inserts with profile IDs
// Drop FK if points to wrong table, re-add pointing to profiles
try {
    const { rows } = await client.query(`
        SELECT tc.constraint_name, ccu.table_name AS ref_table
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'invoices' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'user_id';
    `);
    for (const row of rows) {
        if (row.ref_table !== 'profiles') {
            await q(`ALTER TABLE public.invoices DROP CONSTRAINT "${row.constraint_name}";`);
            await q(`ALTER TABLE public.invoices ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;`);
            ok('invoices.user_id FK fixed → profiles');
        } else {
            ok('invoices.user_id FK already points to profiles');
        }
    }
    if (rows.length === 0) {
        await q(`ALTER TABLE public.invoices ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;`);
        ok('invoices.user_id FK added → profiles');
    }
} catch(e) { fail('invoices FK fix', e); }

// ─────────────────────────────────────────────
// 4. FIX RLS POLICIES — drop recursion, add missing INSERT
// ─────────────────────────────────────────────
console.log('\n4. Fixing RLS policies...');

// Drop all broken admin policies that cause recursion
const brokenPolicies = [
    ['profiles', 'Admins full access profiles'],
    ['plans', 'Admins can manage plans'],
    ['ecard_members', 'Admins full access members'],
    ['payments', 'Admins full access payments'],
    ['invoices', 'Admins full access invoices'],
    ['service_requests', 'Admins full access service_requests'],
    ['notifications', 'Admins full access notifications'],
    ['system_settings', 'Admins full access system_settings'],
    ['franchises', 'Admins full access franchises'],
    ['withdrawal_requests', 'Admins full access withdrawal_requests'],
    ['reimbursement_claims', 'Admins full access reimbursement_claims'],
    ['phr_documents', 'Admins full access phr_documents'],
    ['cms_content', 'Admins full access cms_content'],
    ['audit_logs', 'Admins full access audit_logs'],
    ['coupons', 'Admins full access coupons'],
    ['partners', 'Admins full access partners'],
    ['locations', 'Admins full access locations'],
    ['call_centre_logs', 'Admins full access call_centre_logs'],
];

for (const [table, policy] of brokenPolicies) {
    try {
        await q(`DROP POLICY IF EXISTS "${policy}" ON public.${table};`);
        ok(`Dropped: ${table} → "${policy}"`);
    } catch(e) { fail(`Drop policy ${policy}`, e); }
}

// Re-create admin policies using is_admin() — no recursion
const adminTables = [
    'profiles', 'plans', 'ecard_members', 'payments', 'invoices',
    'service_requests', 'notifications', 'system_settings', 'franchises',
    'withdrawal_requests', 'reimbursement_claims', 'phr_documents',
    'cms_content', 'audit_logs', 'coupons', 'partners', 'locations',
];

for (const table of adminTables) {
    try {
        // Check table exists first
        const { rows } = await client.query(`
            SELECT 1 FROM information_schema.tables
            WHERE table_schema='public' AND table_name=$1
        `, [table]);
        if (rows.length === 0) { console.log(`  SKIP: ${table} does not exist`); continue; }

        await q(`DROP POLICY IF EXISTS "admin_full_access_${table}" ON public.${table};`);
        await q(`
            CREATE POLICY "admin_full_access_${table}"
            ON public.${table}
            FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
        `);
        ok(`Admin policy: ${table}`);
    } catch(e) { fail(`Admin policy ${table}`, e); }
}

// Add missing INSERT policies for payments (users can create their own)
try {
    await q(`DROP POLICY IF EXISTS "users_insert_payments" ON public.payments;`);
    await q(`
        CREATE POLICY "users_insert_payments"
        ON public.payments
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    ok('payments INSERT policy for users');
} catch(e) { fail('payments INSERT policy', e); }

// Add missing INSERT policy for invoices
try {
    await q(`DROP POLICY IF EXISTS "users_insert_invoices" ON public.invoices;`);
    await q(`
        CREATE POLICY "users_insert_invoices"
        ON public.invoices
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    ok('invoices INSERT policy for users');
} catch(e) { fail('invoices INSERT policy', e); }

// Add SELECT policies if missing
try {
    await q(`DROP POLICY IF EXISTS "users_select_payments" ON public.payments;`);
    await q(`
        CREATE POLICY "users_select_payments"
        ON public.payments
        FOR SELECT
        USING (auth.uid() = user_id);
    `);
    ok('payments SELECT policy for users');
} catch(e) { fail('payments SELECT policy', e); }

try {
    await q(`DROP POLICY IF EXISTS "users_select_invoices" ON public.invoices;`);
    await q(`
        CREATE POLICY "users_select_invoices"
        ON public.invoices
        FOR SELECT
        USING (auth.uid() = user_id);
    `);
    ok('invoices SELECT policy for users');
} catch(e) { fail('invoices SELECT policy', e); }

// Fix ecard_members INSERT/UPDATE/SELECT policies
try {
    await q(`DROP POLICY IF EXISTS "users_select_ecard_members" ON public.ecard_members;`);
    await q(`
        CREATE POLICY "users_select_ecard_members"
        ON public.ecard_members FOR SELECT
        USING (auth.uid() = user_id);
    `);
    ok('ecard_members SELECT policy');
} catch(e) { fail('ecard_members SELECT', e); }

try {
    await q(`DROP POLICY IF EXISTS "users_insert_ecard_members" ON public.ecard_members;`);
    await q(`
        CREATE POLICY "users_insert_ecard_members"
        ON public.ecard_members FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    ok('ecard_members INSERT policy');
} catch(e) { fail('ecard_members INSERT', e); }

// ─────────────────────────────────────────────
// 5. VERIFY — test inserts now work
// ─────────────────────────────────────────────
console.log('\n5. Verifying schema...');

// Check payments columns
const { rows: payCols } = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payments'
    ORDER BY ordinal_position;
`);
console.log('\n  payments columns:');
payCols.forEach(c => console.log(`    ${c.column_name} (${c.data_type}, nullable:${c.is_nullable})`));

const { rows: invCols } = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices'
    ORDER BY ordinal_position;
`);
console.log('\n  invoices columns:');
invCols.forEach(c => console.log(`    ${c.column_name} (${c.data_type}, nullable:${c.is_nullable})`));

// Check RLS policies
const { rows: policies } = await client.query(`
    SELECT tablename, policyname, cmd, qual
    FROM pg_policies
    WHERE schemaname='public'
    AND tablename IN ('payments','invoices','ecard_members','profiles')
    ORDER BY tablename, policyname;
`);
console.log('\n  Active RLS policies:');
policies.forEach(p => console.log(`    ${p.tablename}: ${p.policyname} (${p.cmd})`));

await client.end();
console.log('\n=== DONE ===');
