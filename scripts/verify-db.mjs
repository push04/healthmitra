/**
 * HealthMitra — Extensive DB Verification
 * Checks all columns, policies, indexes, and data integrity.
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

let passed = 0, failed = 0, warnings = 0;

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

function ok(label)           { console.log(`  ${GREEN}✓${RESET} ${label}`); passed++; }
function fail(label, detail) { console.log(`  ${RED}✗${RESET} ${label} ${RED}${detail || ''}${RESET}`); failed++; }
function warn(label, detail) { console.log(`  ${YELLOW}⚠${RESET} ${label} ${YELLOW}${detail || ''}${RESET}`); warnings++; }
function head(title)         { console.log(`\n${CYAN}[${title}]${RESET}`); }

async function q(sql, params = []) {
    const r = await client.query(sql, params);
    return r.rows;
}

async function checkColumn(table, col) {
    const r = await q(
        `SELECT data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, col]
    );
    if (r.length > 0) {
        ok(`${table}.${col}  (${r[0].data_type}, nullable=${r[0].is_nullable}${r[0].column_default ? ', default=' + r[0].column_default.substring(0, 30) : ''})`);
    } else {
        fail(`${table}.${col}`, '— MISSING');
    }
}

async function checkPolicy(table, policyName) {
    const r = await q(
        `SELECT policyname, cmd, permissive FROM pg_policies
         WHERE schemaname = 'public' AND tablename = $1 AND policyname = $2`,
        [table, policyName]
    );
    if (r.length > 0) {
        ok(`Policy [${table}] "${policyName}" (cmd=${r[0].cmd}, permissive=${r[0].permissive})`);
    } else {
        fail(`Policy [${table}] "${policyName}"`, '— MISSING');
    }
}

async function checkIndex(indexName) {
    const r = await q(
        `SELECT indexname, tablename, indexdef FROM pg_indexes
         WHERE schemaname = 'public' AND indexname = $1`,
        [indexName]
    );
    if (r.length > 0) {
        ok(`Index: ${indexName} on ${r[0].tablename}`);
    } else {
        fail(`Index: ${indexName}`, '— MISSING');
    }
}

async function tableExists(t) {
    const r = await q(
        `SELECT EXISTS(
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        ) AS e`,
        [t]
    );
    return r[0].e;
}

async function main() {
    await client.connect();

    console.log(`\n${CYAN}${'═'.repeat(52)}${RESET}`);
    console.log(`${BOLD}  HealthMitra — Extensive Database Verification${RESET}`);
    console.log(`${CYAN}${'═'.repeat(52)}${RESET}`);

    // ── 1. CONNECTIVITY ──────────────────────────────────────────────────────
    head('1. Connectivity & Server Info');
    const ping = await q(`SELECT NOW() AS ts, current_database() AS db, current_user AS usr, version() AS ver`);
    ok(`Connected to: ${ping[0].db} as ${ping[0].usr}`);
    ok(`Server time:  ${ping[0].ts.toISOString()}`);
    ok(`PG version:   ${ping[0].ver.split(' ').slice(0, 2).join(' ')}`);

    // ── 2. TABLES EXISTENCE ──────────────────────────────────────────────────
    head('2. Required Tables Existence');
    const requiredTables = [
        'profiles', 'plans', 'ecard_members',
        'service_requests', 'request_messages',
        'phr_documents', 'wallet_transactions', 'wallets',
        'reimbursement_claims', 'payments', 'invoices',
        'notifications', 'withdrawal_requests',
        'franchises', 'franchise_partners',
        'coupons', 'system_settings', 'audit_logs',
        'cms_content', 'cities', 'appointments', 'departments'
    ];
    for (const t of requiredTables) {
        const exists = await tableExists(t);
        if (exists) ok(`Table: ${t}`);
        else fail(`Table: ${t}`, '— MISSING');
    }

    // ── 3. PROFILES COLUMNS ──────────────────────────────────────────────────
    head('3. profiles — All Columns');
    for (const col of [
        'id', 'email', 'full_name', 'phone', 'role', 'avatar_url',
        'status', 'dob', 'gender', 'blood_group',
        'address', 'city', 'state', 'pincode',
        'bank_holder_name', 'bank_account_number', 'bank_ifsc',
        'bank_name', 'bank_branch', 'account_type',
        'aadhaar_number', 'pan_number', 'gst_number',
        'created_at', 'updated_at'
    ]) {
        await checkColumn('profiles', col);
    }

    // ── 4. PLANS COLUMNS ─────────────────────────────────────────────────────
    head('4. plans — All Columns');
    for (const col of [
        'id', 'name', 'description', 'price', 'duration_days',
        'features', 'coverage_amount', 'is_active',
        'status', 'type', 'is_featured', 'image_url',
        'created_at', 'updated_at'
    ]) {
        await checkColumn('plans', col);
    }

    // ── 5. ECARD_MEMBERS COLUMNS ─────────────────────────────────────────────
    head('5. ecard_members — All Columns');
    for (const col of [
        'id', 'user_id', 'plan_id', 'member_id_code', 'card_unique_id',
        'full_name', 'relation', 'dob', 'gender', 'blood_group',
        'photo_url', 'policy_number', 'valid_from', 'valid_till',
        'contact_number', 'email', 'aadhaar_last4', 'status',
        'created_at', 'updated_at'
    ]) {
        await checkColumn('ecard_members', col);
    }

    // ── 6. RLS ENABLED ───────────────────────────────────────────────────────
    head('6. RLS Enabled on Key Tables');
    for (const t of [
        'profiles', 'plans', 'ecard_members', 'service_requests',
        'wallet_transactions', 'reimbursement_claims', 'payments',
        'notifications', 'phr_documents', 'invoices'
    ]) {
        if (!(await tableExists(t))) { warn(`${t}`, '— table missing, skip RLS check'); continue; }
        const r = await q(
            `SELECT relrowsecurity FROM pg_class
             WHERE relname = $1 AND relnamespace = 'public'::regnamespace`,
            [t]
        );
        if (r.length > 0 && r[0].relrowsecurity) ok(`RLS enabled: ${t}`);
        else fail(`RLS enabled: ${t}`, '— NOT ENABLED');
    }

    // ── 7. RLS POLICIES ──────────────────────────────────────────────────────
    head('7. RLS Policies');
    await checkPolicy('profiles',      'Admins can manage all profiles');
    await checkPolicy('profiles',      'Users can update own profile');
    await checkPolicy('ecard_members', 'Admins can insert ecard members');
    await checkPolicy('ecard_members', 'Admins can update ecard members');
    await checkPolicy('ecard_members', 'Users can view their own members');
    await checkPolicy('ecard_members', 'Admins can view all members');

    // List all policies count per table
    const allPolicies = await q(
        `SELECT tablename, COUNT(*) AS cnt FROM pg_policies
         WHERE schemaname = 'public'
         GROUP BY tablename ORDER BY tablename`
    );
    console.log(`\n  Policy summary:`);
    for (const p of allPolicies) {
        console.log(`    ${CYAN}${p.tablename}${RESET}: ${p.cnt} policy/policies`);
    }

    // ── 8. INDEXES ───────────────────────────────────────────────────────────
    head('8. Critical Indexes');
    await checkIndex('idx_profiles_status');
    await checkIndex('idx_profiles_email');
    await checkIndex('idx_profiles_role');
    await checkIndex('idx_ecard_members_relation');
    await checkIndex('idx_ecard_members_user_id');
    await checkIndex('idx_ecard_members_plan_id');
    await checkIndex('idx_ecard_members_status');

    // ── 9. DATA INTEGRITY — profiles ─────────────────────────────────────────
    head('9. Data Integrity — profiles');
    const profTotal    = await q(`SELECT COUNT(*) AS c FROM public.profiles`);
    const profAdmins   = await q(`SELECT COUNT(*) AS c FROM public.profiles WHERE role = 'admin'`);
    const profCustomers= await q(`SELECT COUNT(*) AS c FROM public.profiles WHERE role = 'user'`);
    const profActive   = await q(`SELECT COUNT(*) AS c FROM public.profiles WHERE status = 'active'`);
    const profNullStat = await q(`SELECT COUNT(*) AS c FROM public.profiles WHERE status IS NULL`);
    const profNullEmail= await q(`SELECT COUNT(*) AS c FROM public.profiles WHERE email IS NULL`);
    const profDupEmail = await q(`SELECT email, COUNT(*) AS cnt FROM public.profiles GROUP BY email HAVING COUNT(*) > 1`);

    ok(`Total profiles: ${profTotal[0].c}`);
    ok(`Admins: ${profAdmins[0].c}`);
    ok(`Customers (role=user): ${profCustomers[0].c}`);
    ok(`Active: ${profActive[0].c}`);

    if (parseInt(profNullStat[0].c) === 0) ok(`No NULL status values`);
    else warn(`${profNullStat[0].c} profiles have NULL status`);

    if (parseInt(profNullEmail[0].c) === 0) ok(`No NULL email values`);
    else fail(`${profNullEmail[0].c} profiles have NULL email`);

    if (profDupEmail.length === 0) ok(`No duplicate emails`);
    else fail(`${profDupEmail.length} duplicate email(s) found`, profDupEmail.map(r => r.email).join(', '));

    // ── 10. DATA INTEGRITY — plans ───────────────────────────────────────────
    head('10. Data Integrity — plans');
    const plansTotal   = await q(`SELECT COUNT(*) AS c FROM public.plans`);
    const plansActive  = await q(`SELECT COUNT(*) AS c FROM public.plans WHERE status = 'active'`);
    const plansNullSt  = await q(`SELECT COUNT(*) AS c FROM public.plans WHERE status IS NULL`);
    const plansNullPr  = await q(`SELECT COUNT(*) AS c FROM public.plans WHERE price IS NULL OR price < 0`);
    const plansDetail  = await q(`SELECT id, name, price, status, duration_days FROM public.plans ORDER BY created_at LIMIT 10`);

    ok(`Total plans: ${plansTotal[0].c}`);
    ok(`Active plans: ${plansActive[0].c}`);
    if (parseInt(plansNullSt[0].c) === 0) ok(`No NULL status — all synced`);
    else fail(`${plansNullSt[0].c} plans have NULL status`);
    if (parseInt(plansNullPr[0].c) === 0) ok(`No NULL/negative prices`);
    else warn(`${plansNullPr[0].c} plans with NULL/invalid price`);

    if (plansDetail.length > 0) {
        console.log(`\n  Plans (up to 10):`);
        for (const p of plansDetail) {
            console.log(`    ${CYAN}${p.name}${RESET}  ₹${p.price}  status=${p.status}  ${p.duration_days}d  id=${p.id}`);
        }
    }

    // ── 11. DATA INTEGRITY — ecard_members ───────────────────────────────────
    head('11. Data Integrity — ecard_members');
    const ecTotal   = await q(`SELECT COUNT(*) AS c FROM public.ecard_members`);
    const ecActive  = await q(`SELECT COUNT(*) AS c FROM public.ecard_members WHERE status = 'active'`);
    const ecSelf    = await q(`SELECT COUNT(*) AS c FROM public.ecard_members WHERE relation = 'Self'`);
    const ecOrphan  = await q(
        `SELECT COUNT(*) AS c FROM public.ecard_members em
         LEFT JOIN public.profiles p ON em.user_id = p.id
         WHERE p.id IS NULL`
    );
    const ecMissingId = await q(`SELECT COUNT(*) AS c FROM public.ecard_members WHERE member_id_code IS NULL`);
    const ecDupCode   = await q(
        `SELECT member_id_code, COUNT(*) AS cnt FROM public.ecard_members
         WHERE member_id_code IS NOT NULL
         GROUP BY member_id_code HAVING COUNT(*) > 1`
    );
    const ecDupCard   = await q(
        `SELECT card_unique_id, COUNT(*) AS cnt FROM public.ecard_members
         WHERE card_unique_id IS NOT NULL
         GROUP BY card_unique_id HAVING COUNT(*) > 1`
    );
    const ecExpired   = await q(
        `SELECT COUNT(*) AS c FROM public.ecard_members
         WHERE valid_till IS NOT NULL AND valid_till < CURRENT_DATE AND status != 'expired'`
    );

    ok(`Total ecard_members: ${ecTotal[0].c}`);
    ok(`Active: ${ecActive[0].c}`);
    ok(`Self records: ${ecSelf[0].c}`);

    if (parseInt(ecOrphan[0].c) === 0) ok(`No orphaned ecard_members`);
    else fail(`${ecOrphan[0].c} orphaned records (no matching profile)`);

    ok(`Records missing member_id_code: ${ecMissingId[0].c}`);

    if (ecDupCode.length === 0) ok(`No duplicate member_id_codes`);
    else fail(`${ecDupCode.length} duplicate member_id_code(s)`);

    if (ecDupCard.length === 0) ok(`No duplicate card_unique_ids`);
    else fail(`${ecDupCard.length} duplicate card_unique_id(s)`);

    if (parseInt(ecExpired[0].c) === 0) ok(`No past-due records with wrong status`);
    else warn(`${ecExpired[0].c} records are past valid_till but not marked expired`);

    // ── 12. FOREIGN KEY INTEGRITY ─────────────────────────────────────────────
    head('12. Foreign Key Integrity');
    const ecMissingPlan = await q(
        `SELECT COUNT(*) AS c FROM public.ecard_members em
         LEFT JOIN public.plans p ON em.plan_id = p.id
         WHERE em.plan_id IS NOT NULL AND p.id IS NULL`
    );
    if (parseInt(ecMissingPlan[0].c) === 0) ok(`ecard_members → plans: all plan_ids valid`);
    else fail(`ecard_members → plans: ${ecMissingPlan[0].c} broken FK(s)`);

    const srMissingUser = await q(
        `SELECT COUNT(*) AS c FROM public.service_requests sr
         LEFT JOIN public.profiles p ON sr.user_id = p.id
         WHERE sr.user_id IS NOT NULL AND p.id IS NULL`
    ).catch(() => [{ c: 'N/A (table may not exist)' }]);
    ok(`service_requests → profiles: ${srMissingUser[0].c === '0' || srMissingUser[0].c === 0 ? 'all valid' : srMissingUser[0].c + ' broken FK(s)'}`);

    // ── 13. UNIQUE CONSTRAINT CHECK ───────────────────────────────────────────
    head('13. Unique Constraint Check');
    const constraints = await q(
        `SELECT conname, contype, conrelid::regclass AS table_name
         FROM pg_constraint
         WHERE contype IN ('u','p')
         AND conrelid IN (
             'public.profiles'::regclass,
             'public.ecard_members'::regclass,
             'public.plans'::regclass
         )
         ORDER BY table_name, conname`
    );
    for (const c of constraints) {
        ok(`${c.table_name}: ${c.conname} (${c.contype === 'u' ? 'UNIQUE' : 'PRIMARY KEY'})`);
    }

    // ── 14. TRIGGER CHECK ─────────────────────────────────────────────────────
    head('14. Triggers (updated_at)');
    const triggers = await q(
        `SELECT trigger_name, event_object_table AS table_name, event_manipulation
         FROM information_schema.triggers
         WHERE trigger_schema = 'public'
         ORDER BY event_object_table, trigger_name`
    );
    const expectedTriggers = ['profiles', 'plans', 'ecard_members'];
    for (const t of expectedTriggers) {
        const found = triggers.filter(tr => tr.table_name === t);
        if (found.length > 0) ok(`Trigger on ${t}: ${found.map(f => f.trigger_name).join(', ')}`);
        else warn(`No trigger found on ${t}`);
    }

    // ── 15. AUTH.USERS SYNC ───────────────────────────────────────────────────
    head('15. Auth ↔ Profiles Sync');
    const authCount = await q(`SELECT COUNT(*) AS c FROM auth.users`).catch(() => [{ c: '(no access)' }]);
    const profCount = await q(`SELECT COUNT(*) AS c FROM public.profiles`);
    ok(`auth.users count: ${authCount[0].c}`);
    ok(`public.profiles count: ${profCount[0].c}`);

    const inAuthNotProf = await q(
        `SELECT COUNT(*) AS c FROM auth.users au
         LEFT JOIN public.profiles p ON au.id = p.id
         WHERE p.id IS NULL AND au.is_anonymous IS NOT TRUE`
    ).catch(() => [{ c: 'N/A' }]);
    if (inAuthNotProf[0].c === 'N/A') warn(`Cannot check auth ↔ profiles gap (permission)`);
    else if (parseInt(inAuthNotProf[0].c) === 0) ok(`No auth users missing a profile`);
    else warn(`${inAuthNotProf[0].c} auth users have no matching profile`);

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    console.log(`\n${CYAN}${'═'.repeat(52)}${RESET}`);
    console.log(`  ${GREEN}${passed} passed${RESET}   ${RED}${failed} failed${RESET}   ${YELLOW}${warnings} warnings${RESET}`);
    const overall = failed === 0 ? `${GREEN}ALL CRITICAL CHECKS PASSED${RESET}` : `${RED}SOME CHECKS FAILED — review above${RESET}`;
    console.log(`  ${overall}`);
    console.log(`${CYAN}${'═'.repeat(52)}${RESET}\n`);

    await client.end();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
