/**
 * HealthMitra — Exhaustive Database Verification
 * Checks every table, column, constraint, index, RLS policy,
 * function compatibility, and data integrity.
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

let PASS = 0, FAIL = 0, WARN = 0, FIXED = 0;
const issues = [];

function ok(m)    { process.stdout.write(`  ✓ ${m}\n`); PASS++; }
function fail(m)  { process.stdout.write(`  ✗ ${m}\n`); FAIL++; issues.push(m); }
function warn(m)  { process.stdout.write(`  ⚠ ${m}\n`); WARN++; }
function fixed(m) { process.stdout.write(`  ⚡ FIXED: ${m}\n`); FIXED++; }
function head(m)  { process.stdout.write(`\n${'═'.repeat(56)}\n  ${m}\n${'═'.repeat(56)}\n`); }
function sub(m)   { process.stdout.write(`\n  ── ${m} ──\n`); }

async function q(sql, p = []) { const r = await client.query(sql, p); return r.rows; }
async function one(sql, p = []) { const r = await q(sql, p); return r[0] || null; }
async function scalar(sql, p = []) { const r = await one(sql, p); return r ? Object.values(r)[0] : null; }

async function colExists(t, c) {
    return !!(await one(`SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [t, c]));
}
async function tableExists(t) {
    return !!(await one(`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`, [t]));
}
async function indexExists(n) {
    return !!(await one(`SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname=$1`, [n]));
}
async function policyExists(t, n) {
    return !!(await one(`SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=$1 AND policyname=$2`, [t, n]));
}
async function rlsEnabled(t) {
    const r = await one(`SELECT relrowsecurity FROM pg_class WHERE relname=$1 AND relnamespace='public'::regnamespace`, [t]);
    return r?.relrowsecurity === true;
}
async function constraintExists(n) {
    return !!(await one(`SELECT 1 FROM pg_constraint WHERE conname=$1`, [n]));
}
async function triggerExists(t, n) {
    return !!(await one(`SELECT 1 FROM information_schema.triggers WHERE event_object_table=$1 AND trigger_name=$2`, [t, n]));
}
async function getColDef(t, c) {
    return await one(`SELECT data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [t, c]);
}
async function runFix(sql, label) {
    try { await client.query(sql); fixed(label); FIXED++; return true; }
    catch(e) { fail(`FIX FAILED — ${label}: ${e.message.substring(0,100)}`); return false; }
}

// ── Check column with auto-fix ────────────────────────────────────────────────
async function checkCol(table, col, fixSql, label) {
    if (await colExists(table, col)) { ok(label || `${table}.${col}`); return true; }
    if (fixSql) { await runFix(fixSql, `Add ${table}.${col}`); return false; }
    fail(`MISSING COLUMN: ${table}.${col}`); return false;
}

// ═══════════════════════════════════════════════════════════
//  SECTION 1 — TABLE EXISTENCE
// ═══════════════════════════════════════════════════════════
async function checkTables() {
    head('1. TABLE EXISTENCE (23 expected)');
    const expected = [
        'profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','reimbursement_claims',
        'wallet_transactions','wallets','withdrawal_requests',
        'notifications','phr_documents','phr_categories',
        'franchises','franchise_partners','coupons',
        'system_settings','audit_logs','cms_content',
        'cities','appointments','departments'
    ];
    for (const t of expected) {
        if (await tableExists(t)) ok(t);
        else fail(`TABLE MISSING: ${t}`);
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 2 — COLUMN-BY-COLUMN VERIFICATION
// ═══════════════════════════════════════════════════════════
async function checkColumns() {
    head('2. COLUMN STRUCTURES');

    // ── PROFILES ──
    sub('profiles');
    await checkCol('profiles','id',null,'profiles.id (UUID PK)');
    await checkCol('profiles','email',null,'profiles.email');
    await checkCol('profiles','full_name',null,'profiles.full_name');
    await checkCol('profiles','phone',null,'profiles.phone');
    await checkCol('profiles','role',null,'profiles.role');
    await checkCol('profiles','status',`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,'profiles.status');
    await checkCol('profiles','avatar_url',null,'profiles.avatar_url');
    await checkCol('profiles','created_at',null,'profiles.created_at');
    await checkCol('profiles','updated_at',null,'profiles.updated_at');

    // ── PLANS ──
    sub('plans');
    await checkCol('plans','id',null,'plans.id');
    await checkCol('plans','name',null,'plans.name');
    await checkCol('plans','description',null,'plans.description');
    await checkCol('plans','price',null,'plans.price');
    await checkCol('plans','duration_days',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 365`,'plans.duration_days');
    await checkCol('plans','features',null,'plans.features');
    await checkCol('plans','coverage_amount',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12,2)`,'plans.coverage_amount');
    await checkCol('plans','status',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,'plans.status');
    await checkCol('plans','is_active',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,'plans.is_active');
    await checkCol('plans','type',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'health'`,'plans.type');
    await checkCol('plans','is_featured',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,'plans.is_featured');
    await checkCol('plans','image_url',`ALTER TABLE plans ADD COLUMN IF NOT EXISTS image_url TEXT`,'plans.image_url');

    // Verify no duration_months (wrong column)
    if (await colExists('plans','duration_months')) warn('plans.duration_months exists — code now uses duration_days instead');

    // ── ECARD_MEMBERS ──
    sub('ecard_members');
    const ecardCols = ['id','user_id','plan_id','member_id_code','card_unique_id','full_name',
        'relation','dob','gender','blood_group','photo_url','policy_number',
        'valid_from','valid_till','contact_number','email','aadhaar_last4',
        'coverage_amount','status','created_at','updated_at'];
    for (const c of ecardCols) {
        if (await colExists('ecard_members',c)) ok(`ecard_members.${c}`);
        else { await runFix(`ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS ${c} TEXT`, `Add ecard_members.${c}`); }
    }

    // ── SERVICE_REQUESTS ──
    sub('service_requests');
    await checkCol('service_requests','id',null,'service_requests.id');
    await checkCol('service_requests','request_id_display',`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS request_id_display TEXT`,'service_requests.request_id_display');
    await checkCol('service_requests','user_id',null,'service_requests.user_id');
    await checkCol('service_requests','member_id',null,'service_requests.member_id');
    await checkCol('service_requests','type',`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS type TEXT`,'service_requests.type');
    await checkCol('service_requests','status',null,'service_requests.status');
    await checkCol('service_requests','details',null,'service_requests.details');
    await checkCol('service_requests','assigned_to',`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID`,'service_requests.assigned_to');
    await checkCol('service_requests','admin_notes',`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`,'service_requests.admin_notes');

    // ── NOTIFICATIONS ──
    sub('notifications');
    await checkCol('notifications','id',null,'notifications.id');
    await checkCol('notifications','recipient_id',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id UUID`,'notifications.recipient_id');
    await checkCol('notifications','sender_id',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID`,'notifications.sender_id');
    await checkCol('notifications','title',null,'notifications.title');
    await checkCol('notifications','message',null,'notifications.message');
    await checkCol('notifications','type',null,'notifications.type');
    await checkCol('notifications','is_read',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`,'notifications.is_read');
    await checkCol('notifications','read_at',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`,'notifications.read_at');
    await checkCol('notifications','action_url',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`,'notifications.action_url');
    await checkCol('notifications','action_label',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT`,'notifications.action_label');
    await checkCol('notifications','priority',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'`,'notifications.priority');
    await checkCol('notifications','metadata',`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`,'notifications.metadata');
    await checkCol('notifications','created_at',null,'notifications.created_at');

    // ── PAYMENTS ──
    sub('payments');
    await checkCol('payments','id',null,'payments.id');
    await checkCol('payments','user_id',null,'payments.user_id');
    await checkCol('payments','plan_id',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id UUID`,'payments.plan_id');
    await checkCol('payments','amount',null,'payments.amount');
    await checkCol('payments','currency',null,'payments.currency');
    await checkCol('payments','status',null,'payments.status');
    await checkCol('payments','razorpay_order_id',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT`,'payments.razorpay_order_id');
    await checkCol('payments','razorpay_payment_id',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT`,'payments.razorpay_payment_id');
    await checkCol('payments','payment_method',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT`,'payments.payment_method');
    await checkCol('payments','purpose',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS purpose TEXT`,'payments.purpose');
    await checkCol('payments','metadata',`ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB`,'payments.metadata');

    // Verify razorpay_order_id is nullable (not NOT NULL)
    const rozDef = await getColDef('payments','razorpay_order_id');
    if (rozDef) {
        if (rozDef.is_nullable === 'YES') ok('payments.razorpay_order_id is nullable ✓');
        else {
            await runFix(`ALTER TABLE payments ALTER COLUMN razorpay_order_id DROP NOT NULL`, 'Make razorpay_order_id nullable');
        }
    }

    // ── INVOICES ──
    sub('invoices');
    const invoiceCols = ['id','user_id','plan_id','invoice_number','plan_name','amount','gst','total','payment_method','transaction_id','status','created_at'];
    for (const c of invoiceCols) {
        if (await colExists('invoices',c)) ok(`invoices.${c}`);
        else fail(`MISSING: invoices.${c}`);
    }

    // ── REIMBURSEMENT_CLAIMS ──
    sub('reimbursement_claims');
    await checkCol('reimbursement_claims','id',null,'reimbursement_claims.id');
    await checkCol('reimbursement_claims','claim_id_display',`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS claim_id_display TEXT`,'reimbursement_claims.claim_id_display');
    await checkCol('reimbursement_claims','user_id',null,'reimbursement_claims.user_id');
    await checkCol('reimbursement_claims','patient_member_id',null,'reimbursement_claims.patient_member_id');
    await checkCol('reimbursement_claims','claim_type',null,'reimbursement_claims.claim_type');
    await checkCol('reimbursement_claims','amount_requested',null,'reimbursement_claims.amount_requested');
    await checkCol('reimbursement_claims','amount_approved',null,'reimbursement_claims.amount_approved');
    await checkCol('reimbursement_claims','status',null,'reimbursement_claims.status');
    await checkCol('reimbursement_claims','rejection_reason',`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,'reimbursement_claims.rejection_reason');
    await checkCol('reimbursement_claims','admin_comments',null,'reimbursement_claims.admin_comments');
    await checkCol('reimbursement_claims','documents',null,'reimbursement_claims.documents');

    // ── WITHDRAWAL_REQUESTS ──
    sub('withdrawal_requests');
    const wrCols = ['id','user_id','customer_name','customer_email','amount','status','bank_name','bank_account','ifsc_code','admin_notes','processed_at','created_at'];
    for (const c of wrCols) {
        if (await colExists('withdrawal_requests',c)) ok(`withdrawal_requests.${c}`);
        else fail(`MISSING: withdrawal_requests.${c}`);
    }

    // ── WALLETS ──
    sub('wallets');
    const walletCols = ['id','user_id','balance','created_at','updated_at'];
    for (const c of walletCols) {
        if (await colExists('wallets',c)) ok(`wallets.${c}`);
        else fail(`MISSING: wallets.${c}`);
    }

    // ── WALLET_TRANSACTIONS ──
    sub('wallet_transactions');
    const wtCols = ['id','user_id','type','amount','description','reference_id','status','transaction_date'];
    for (const c of wtCols) {
        if (await colExists('wallet_transactions',c)) ok(`wallet_transactions.${c}`);
        else fail(`MISSING: wallet_transactions.${c}`);
    }

    // ── PHR_DOCUMENTS ──
    sub('phr_documents');
    const phrCols = ['id','user_id','member_id','name','category','file_type','file_size','file_url','tags','doctor_name','date_of_record','created_at'];
    for (const c of phrCols) {
        if (await colExists('phr_documents',c)) ok(`phr_documents.${c}`);
        else fail(`MISSING: phr_documents.${c}`);
    }

    // ── COUPONS ──
    sub('coupons');
    const couponCols = ['id','code','discount_type','discount_value','valid_from','valid_until','usage_limit','used_count','is_active','created_at'];
    for (const c of couponCols) {
        if (await colExists('coupons',c)) ok(`coupons.${c}`);
        else fail(`MISSING: coupons.${c}`);
    }

    // ── SYSTEM_SETTINGS ──
    sub('system_settings');
    const ssCols = ['key','value','description','is_secure','updated_at','updated_by'];
    for (const c of ssCols) {
        if (await colExists('system_settings',c)) ok(`system_settings.${c}`);
        else fail(`MISSING: system_settings.${c}`);
    }

    // ── AUDIT_LOGS ──
    sub('audit_logs');
    const alCols = ['id','admin_id','action','target_resource','entity_type','details','ip_address','created_at'];
    for (const c of alCols) {
        if (await colExists('audit_logs',c)) ok(`audit_logs.${c}`);
        else {
            const fixMap = { entity_type: `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT` };
            if (fixMap[c]) await runFix(fixMap[c], `Add audit_logs.${c}`);
            else fail(`MISSING: audit_logs.${c}`);
        }
    }

    // ── FRANCHISES ──
    sub('franchises');
    const frCols = ['id','owner_user_id','franchise_name','code','contact_email','contact_phone','gst_number','address','city','state','commission_percentage','status','verification_status','created_at'];
    for (const c of frCols) {
        if (await colExists('franchises',c)) ok(`franchises.${c}`);
        else fail(`MISSING: franchises.${c}`);
    }

    // ── APPOINTMENTS ──
    sub('appointments');
    const appCols = ['id','user_id','request_id','doctor_name','specialization','appointment_date','status','meeting_link','notes','created_at','updated_at'];
    for (const c of appCols) {
        if (await colExists('appointments',c)) ok(`appointments.${c}`);
        else fail(`MISSING: appointments.${c}`);
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 3 — PRIMARY KEYS & DATA TYPES
// ═══════════════════════════════════════════════════════════
async function checkDataTypes() {
    head('3. DATA TYPES & PRIMARY KEYS');

    const uuidPKTables = ['profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','reimbursement_claims',
        'wallet_transactions','wallets','withdrawal_requests','notifications',
        'phr_documents','phr_categories','franchises','franchise_partners',
        'coupons','audit_logs','cms_content','cities','appointments','departments'];

    for (const t of uuidPKTables) {
        const pk = await one(`
            SELECT c.column_name, c.data_type
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
            JOIN information_schema.columns c ON c.table_name=tc.table_name AND c.column_name=ccu.column_name
            WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public' AND tc.table_name=$1
        `, [t]);
        if (!pk) fail(`${t}: no PRIMARY KEY`);
        else if (pk.data_type !== 'uuid') fail(`${t}.${pk.column_name}: PK type is ${pk.data_type}, expected uuid`);
        else ok(`${t}.id UUID PK`);
    }

    // system_settings has TEXT PK
    const ssPK = await one(`
        SELECT c.column_name, c.data_type FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
        JOIN information_schema.columns c ON c.table_name=tc.table_name AND c.column_name=ccu.column_name
        WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public' AND tc.table_name='system_settings'
    `);
    if (ssPK?.column_name === 'key') ok('system_settings.key TEXT PK');
    else fail('system_settings: wrong or missing PK');

    // Verify critical decimal precision
    sub('Decimal precision');
    const decChecks = [
        ['plans','price'], ['payments','amount'], ['invoices','amount'],
        ['reimbursement_claims','amount_requested'], ['wallets','balance'],
        ['withdrawal_requests','amount']
    ];
    for (const [t, c] of decChecks) {
        const def = await getColDef(t, c);
        if (def && (def.data_type === 'numeric' || def.data_type === 'decimal')) ok(`${t}.${c} is DECIMAL`);
        else if (def) warn(`${t}.${c} is ${def.data_type} (expected DECIMAL)`);
        else fail(`${t}.${c}: column not found`);
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 4 — INDEXES
// ═══════════════════════════════════════════════════════════
async function checkIndexes() {
    head('4. INDEXES');

    const expectedIndexes = [
        // profiles
        ['idx_profiles_email','profiles'],
        ['idx_profiles_role','profiles'],
        // ecard_members
        ['idx_ecard_user_id','ecard_members'],
        ['idx_ecard_plan_id','ecard_members'],
        ['idx_ecard_status','ecard_members'],
        // service_requests
        ['idx_sr_user_id','service_requests'],
        ['idx_sr_status','service_requests'],
        ['idx_sr_assigned','service_requests'],
        // notifications
        ['idx_notif_recipient','notifications'],
        ['idx_notif_unread','notifications'],
        // payments
        ['idx_payments_user_id','payments'],
        // wallet transactions
        ['idx_wallet_tx_user','wallet_transactions'],
        // phr
        ['idx_phr_user_id','phr_documents'],
        // franchises
        ['idx_franchises_code','franchises'],
        // appointments
        ['idx_appointments_user','appointments'],
        // request_messages
        ['idx_rm_request_id','request_messages'],
        // claims
        ['idx_claims_user_id','reimbursement_claims'],
        ['idx_claims_status','reimbursement_claims'],
        // withdrawals
        ['idx_wr_user_id','withdrawal_requests'],
    ];

    for (const [name, table] of expectedIndexes) {
        if (await indexExists(name)) ok(`${name} on ${table}`);
        else {
            // Try auto-fix common indexes
            const fixMap = {
                'idx_profiles_email': `CREATE INDEX idx_profiles_email ON profiles(email)`,
                'idx_profiles_role': `CREATE INDEX idx_profiles_role ON profiles(role)`,
                'idx_ecard_user_id': `CREATE INDEX idx_ecard_user_id ON ecard_members(user_id)`,
                'idx_ecard_plan_id': `CREATE INDEX idx_ecard_plan_id ON ecard_members(plan_id)`,
                'idx_sr_user_id': `CREATE INDEX idx_sr_user_id ON service_requests(user_id)`,
                'idx_sr_status': `CREATE INDEX idx_sr_status ON service_requests(status)`,
                'idx_notif_recipient': `CREATE INDEX idx_notif_recipient ON notifications(recipient_id)`,
                'idx_payments_user_id': `CREATE INDEX idx_payments_user_id ON payments(user_id)`,
                'idx_phr_user_id': `CREATE INDEX idx_phr_user_id ON phr_documents(user_id)`,
                'idx_wallet_tx_user': `CREATE INDEX idx_wallet_tx_user ON wallet_transactions(user_id)`,
                'idx_claims_user_id': `CREATE INDEX idx_claims_user_id ON reimbursement_claims(user_id)`,
                'idx_wr_user_id': `CREATE INDEX idx_wr_user_id ON withdrawal_requests(user_id)`,
            };
            if (fixMap[name]) await runFix(fixMap[name], `Create index ${name}`);
            else fail(`MISSING INDEX: ${name} on ${table}`);
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 5 — RLS POLICIES
// ═══════════════════════════════════════════════════════════
async function checkRLS() {
    head('5. ROW LEVEL SECURITY');

    const tables = [
        'profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','reimbursement_claims',
        'wallet_transactions','wallets','withdrawal_requests',
        'notifications','phr_documents','coupons','system_settings',
        'audit_logs','cms_content','franchises','franchise_partners',
        'cities','appointments','departments'
    ];

    sub('RLS enabled check');
    for (const t of tables) {
        if (await rlsEnabled(t)) ok(`RLS enabled: ${t}`);
        else {
            await runFix(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`, `Enable RLS on ${t}`);
        }
    }

    sub('Policy count per table');
    for (const t of tables) {
        const policies = await q(`SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename=$1`, [t]);
        if (policies.length === 0) warn(`${t}: 0 policies — table may be inaccessible to users`);
        else ok(`${t}: ${policies.length} polic${policies.length===1?'y':'ies'} (${policies.map(p=>p.cmd).join(',')})`);
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 6 — TRIGGERS
// ═══════════════════════════════════════════════════════════
async function checkTriggers() {
    head('6. TRIGGERS (updated_at)');

    const triggerTables = [
        ['profiles','on_profiles_updated'],
        ['plans','on_plans_updated'],
        ['ecard_members','on_ecard_updated'],
        ['service_requests','on_sr_updated'],
        ['reimbursement_claims','on_claims_updated'],
        ['appointments','on_appointments_updated'],
    ];

    for (const [t, n] of triggerTables) {
        if (await triggerExists(t, n)) ok(`Trigger ${n} on ${t}`);
        else {
            await runFix(
                `CREATE TRIGGER ${n} BEFORE UPDATE ON ${t} FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`,
                `Create trigger ${n}`
            );
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 7 — FOREIGN KEY CONSTRAINTS
// ═══════════════════════════════════════════════════════════
async function checkForeignKeys() {
    head('7. FOREIGN KEY CONSTRAINTS');

    const allFKs = await q(`
        SELECT
            tc.table_name as tbl,
            kcu.column_name as col,
            ccu.table_name as ref_tbl,
            ccu.column_name as ref_col,
            rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
        JOIN information_schema.referential_constraints rc ON tc.constraint_name=rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name=ccu.constraint_name
        WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
        ORDER BY tc.table_name, kcu.column_name
    `);

    if (allFKs.length === 0) warn('No foreign keys found');
    else {
        for (const fk of allFKs) {
            ok(`${fk.tbl}.${fk.col} → ${fk.ref_tbl}.${fk.ref_col} (ON DELETE ${fk.delete_rule})`);
        }
    }

    // Verify profiles.id references auth.users
    const profFK = await one(`
        SELECT ccu.table_schema, ccu.table_name FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
        JOIN information_schema.referential_constraints rc ON tc.constraint_name=rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name=ccu.constraint_name
        WHERE tc.table_schema='public' AND tc.table_name='profiles' AND kcu.column_name='id' AND tc.constraint_type='FOREIGN KEY'
    `);
    if (profFK?.table_name === 'users') ok('profiles.id → auth.users.id (critical FK) ✓');
    else warn('profiles.id does NOT reference auth.users — new user registrations may not auto-create profiles');
}

// ═══════════════════════════════════════════════════════════
//  SECTION 8 — UNIQUE CONSTRAINTS
// ═══════════════════════════════════════════════════════════
async function checkUniqueConstraints() {
    head('8. UNIQUE CONSTRAINTS');

    const expectedUniques = [
        ['profiles','email'],
        ['plans',null],           // no unique other than PK
        ['ecard_members','member_id_code'],
        ['ecard_members','card_unique_id'],
        ['coupons','code'],
        ['system_settings','key'],  // PK
        ['invoices','invoice_number'],
        ['reimbursement_claims','claim_id_display'],
        ['franchises','code'],
    ];

    const allUniques = await q(`
        SELECT tc.table_name as tbl, kcu.column_name as col
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
        WHERE tc.constraint_type IN ('UNIQUE','PRIMARY KEY') AND tc.table_schema='public'
        ORDER BY tc.table_name, kcu.column_name
    `);

    const uniqueSet = new Set(allUniques.map(r => `${r.tbl}.${r.col}`));

    for (const [t, c] of expectedUniques) {
        if (!c) continue;
        if (uniqueSet.has(`${t}.${c}`)) ok(`UNIQUE: ${t}.${c}`);
        else warn(`No unique constraint on ${t}.${c} — duplicates possible`);
    }

    // Check service_requests.request_id_display uniqueness
    const srUniq = await one(`
        SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='service_requests'
        AND indexname='service_requests_request_id_display_key'
    `);
    if (srUniq) ok('UNIQUE: service_requests.request_id_display (index)');
    else {
        // Check constraint
        const srCon = await one(`SELECT 1 FROM pg_constraint WHERE conname='service_requests_request_id_display_key'`);
        if (srCon) ok('UNIQUE constraint: service_requests.request_id_display');
        else warn('service_requests.request_id_display has no unique constraint — could cause duplicate key errors');
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 9 — FUNCTIONS / STORED PROCEDURES
// ═══════════════════════════════════════════════════════════
async function checkFunctions() {
    head('9. DATABASE FUNCTIONS');

    const fns = await q(`
        SELECT routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_schema='public'
        ORDER BY routine_name
    `);

    if (fns.length === 0) warn('No custom functions in public schema');
    else fns.forEach(f => ok(`${f.routine_type}: ${f.routine_name}`));

    // Check handle_updated_at
    const hut = await one(`SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND p.proname='handle_updated_at'`);
    if (hut) ok('handle_updated_at() exists');
    else {
        await runFix(`
            CREATE OR REPLACE FUNCTION handle_updated_at()
            RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql
        `, 'Create handle_updated_at()');
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 10 — SEEDED DATA VERIFICATION
// ═══════════════════════════════════════════════════════════
async function checkSeedData() {
    head('10. SEEDED / DEFAULT DATA');

    // System settings
    const settings = await q(`SELECT key, value FROM system_settings ORDER BY key`);
    const requiredSettings = ['razorpay_enabled','razorpay_key_id','razorpay_key_secret',
        'company_name','support_email','india_phone'];
    const settingKeys = new Set(settings.map(s => s.key));
    for (const key of requiredSettings) {
        if (settingKeys.has(key)) ok(`system_settings['${key}'] = '${settings.find(s=>s.key===key)?.value?.substring(0,30)}'`);
        else {
            await runFix(`INSERT INTO system_settings(key,value) VALUES('${key}','') ON CONFLICT(key) DO NOTHING`, `Seed ${key}`);
        }
    }

    // PHR categories
    const cats = await q(`SELECT name, display_order FROM phr_categories ORDER BY display_order`);
    const requiredCats = ['Prescriptions','Bills','Test Reports','General Records','Discharge Summaries','Vaccination Records'];
    for (const cat of requiredCats) {
        if (cats.find(c => c.name === cat)) ok(`phr_category: ${cat}`);
        else {
            await runFix(`INSERT INTO phr_categories(name) VALUES('${cat}') ON CONFLICT(name) DO NOTHING`, `Seed phr_category: ${cat}`);
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 11 — DATA INTEGRITY & LIVE STATS
// ═══════════════════════════════════════════════════════════
async function checkDataIntegrity() {
    head('11. DATA INTEGRITY & ROW COUNTS');

    const tables = ['profiles','plans','ecard_members','payments','invoices',
        'service_requests','reimbursement_claims','notifications',
        'coupons','wallets','wallet_transactions','withdrawal_requests',
        'phr_documents','phr_categories','system_settings','audit_logs'];

    for (const t of tables) {
        const count = await scalar(`SELECT COUNT(*) FROM ${t}`);
        ok(`${t}: ${count} rows`);
    }

    // Check for duplicate card_unique_id in ecard_members
    sub('Duplicate checks');
    const dupCards = await scalar(`SELECT COUNT(*) FROM (SELECT card_unique_id FROM ecard_members WHERE card_unique_id IS NOT NULL GROUP BY card_unique_id HAVING COUNT(*)>1) x`);
    dupCards > 0 ? fail(`ecard_members: ${dupCards} duplicate card_unique_id values`) : ok('ecard_members: no duplicate card_unique_id');

    const dupSR = await scalar(`SELECT COUNT(*) FROM (SELECT request_id_display FROM service_requests WHERE request_id_display IS NOT NULL GROUP BY request_id_display HAVING COUNT(*)>1) x`);
    dupSR > 0 ? fail(`service_requests: ${dupSR} duplicate request_id_display values`) : ok('service_requests: no duplicate request_id_display');

    const dupCoupons = await scalar(`SELECT COUNT(*) FROM (SELECT code FROM coupons WHERE code IS NOT NULL GROUP BY code HAVING COUNT(*)>1) x`);
    dupCoupons > 0 ? fail(`coupons: ${dupCoupons} duplicate codes`) : ok('coupons: no duplicate codes');

    const dupInvoice = await scalar(`SELECT COUNT(*) FROM (SELECT invoice_number FROM invoices WHERE invoice_number IS NOT NULL GROUP BY invoice_number HAVING COUNT(*)>1) x`);
    dupInvoice > 0 ? fail(`invoices: ${dupInvoice} duplicate invoice_numbers`) : ok('invoices: no duplicate invoice_numbers');

    // Check for orphaned ecard_members (user_id not in profiles)
    sub('Orphan checks');
    const orphanCards = await scalar(`SELECT COUNT(*) FROM ecard_members e LEFT JOIN profiles p ON e.user_id=p.id WHERE e.user_id IS NOT NULL AND p.id IS NULL`);
    orphanCards > 0 ? warn(`ecard_members: ${orphanCards} rows with user_id not in profiles`) : ok('ecard_members: no orphaned user references');

    // Payment status distribution
    sub('Payment statuses');
    const payStatuses = await q(`SELECT status, COUNT(*) as cnt FROM payments GROUP BY status ORDER BY cnt DESC`);
    if (payStatuses.length === 0) ok('payments: no records yet');
    else payStatuses.forEach(p => ok(`payments.status='${p.status}': ${p.cnt} rows`));
}

// ═══════════════════════════════════════════════════════════
//  SECTION 12 — CODE↔DB COMPATIBILITY CHECKS
// ═══════════════════════════════════════════════════════════
async function checkCodeCompatibility() {
    head('12. CODE ↔ DATABASE COMPATIBILITY');

    sub('plans.ts: duration_days (not duration_months)');
    const hasDays   = await colExists('plans','duration_days');
    const hasMonths = await colExists('plans','duration_months');
    hasDays   ? ok('plans.duration_days exists — plans.ts reads this correctly') : fail('plans.duration_days missing');
    hasMonths ? warn('plans.duration_months also exists — ensure code uses duration_days') : ok('plans.duration_months absent — no confusion');

    sub('notifications.ts: recipient_id (not user_id for filtering)');
    const hasRecip = await colExists('notifications','recipient_id');
    const hasUID   = await colExists('notifications','user_id');
    hasRecip ? ok('notifications.recipient_id exists — code queries this column') : fail('notifications.recipient_id MISSING — getNotifications() will fail');
    if (hasUID) warn('notifications.user_id also exists (old schema column) — OK if code ignores it');

    sub('purchase route: payments.plan_id, payment_method');
    (await colExists('payments','plan_id'))       ? ok('payments.plan_id exists') : fail('payments.plan_id MISSING — purchase route will fail');
    (await colExists('payments','payment_method')) ? ok('payments.payment_method exists') : fail('payments.payment_method MISSING');

    sub('checkout: ecard_members.coverage_amount');
    (await colExists('ecard_members','coverage_amount')) ? ok('ecard_members.coverage_amount exists') : fail('MISSING — checkout will fail');

    sub('support.ts: service_requests.request_id_display');
    (await colExists('service_requests','request_id_display')) ? ok('service_requests.request_id_display exists') : fail('MISSING — service request creation will fail');

    sub('service_requests.type (not ENUM — code passes plain text)');
    const typeCol = await getColDef('service_requests','type');
    if (!typeCol) fail('service_requests.type missing');
    else if (typeCol.data_type === 'text' || typeCol.data_type === 'character varying') ok(`service_requests.type is ${typeCol.data_type} — code can pass any string ✓`);
    else if (typeCol.data_type === 'USER-DEFINED') warn(`service_requests.type is ENUM — code must pass only valid enum values`);
    else ok(`service_requests.type: ${typeCol.data_type}`);

    sub('analytics.ts: profiles.role values');
    const roles = await q(`SELECT role, COUNT(*) as cnt FROM profiles GROUP BY role ORDER BY cnt DESC`);
    if (roles.length === 0) ok('profiles: empty — no role mismatch yet');
    else {
        roles.forEach(r => {
            if (['admin','customer','user','franchise_owner','doctor','diagnostic_center','pharmacy'].includes(r.role))
                ok(`profiles.role='${r.role}': ${r.cnt} rows`);
            else warn(`Unknown role: '${r.role}' (${r.cnt} rows)`);
        });
    }

    sub('coupons: discount_type values');
    const dtypes = await q(`SELECT DISTINCT discount_type FROM coupons WHERE discount_type IS NOT NULL`);
    if (dtypes.length === 0) ok('coupons: no data yet');
    else dtypes.forEach(d => {
        ['percentage','flat','fixed'].includes(d.discount_type)
            ? ok(`coupons.discount_type='${d.discount_type}'`)
            : warn(`Unexpected discount_type: '${d.discount_type}'`);
    });

    sub('withdrawals.ts: withdrawal_requests table + columns');
    const wrOk = await tableExists('withdrawal_requests');
    wrOk ? ok('withdrawal_requests table exists') : fail('withdrawal_requests table MISSING — withdrawals will fail');

    sub('phr.ts: phr_categories table');
    const catCount = await scalar(`SELECT COUNT(*) FROM phr_categories`);
    catCount > 0 ? ok(`phr_categories seeded: ${catCount} entries`) : warn('phr_categories empty — PHR category dropdown will be empty');

    sub('settings.ts: system_settings defaults');
    const razEnabled = await one(`SELECT value FROM system_settings WHERE key='razorpay_enabled'`);
    razEnabled ? ok(`razorpay_enabled = '${razEnabled.value}'`) : fail('system_settings missing razorpay_enabled');
}

// ═══════════════════════════════════════════════════════════
//  SECTION 13 — STORAGE BUCKETS
// ═══════════════════════════════════════════════════════════
async function checkStorage() {
    head('13. STORAGE BUCKETS');
    const buckets = await q(`SELECT id, name, public FROM storage.buckets ORDER BY name`);
    if (buckets.length === 0) {
        warn('No storage buckets found — file uploads will fail');
        // Create required buckets
        const needed = [
            ['avatars', true],
            ['phr-documents', false],
            ['claim-documents', false],
            ['plan-images', true],
        ];
        for (const [name, isPublic] of needed) {
            await runFix(
                `INSERT INTO storage.buckets(id,name,public) VALUES('${name}','${name}',${isPublic}) ON CONFLICT(id) DO NOTHING`,
                `Create storage bucket: ${name}`
            );
        }
    } else {
        for (const b of buckets) {
            ok(`Bucket: ${b.name} (public=${b.public})`);
        }
        // Check for recommended buckets
        const bucketNames = new Set(buckets.map(b => b.name));
        const recommended = ['avatars','phr-documents','claim-documents','plan-images'];
        for (const r of recommended) {
            if (!bucketNames.has(r)) {
                const isPublic = ['avatars','plan-images'].includes(r);
                await runFix(
                    `INSERT INTO storage.buckets(id,name,public) VALUES('${r}','${r}',${isPublic}) ON CONFLICT(id) DO NOTHING`,
                    `Create missing bucket: ${r}`
                );
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION 14 — AUTH CONFIGURATION CHECK
// ═══════════════════════════════════════════════════════════
async function checkAuth() {
    head('14. AUTH USERS & TRIGGERS');

    const userCount = await scalar(`SELECT COUNT(*) FROM auth.users`);
    ok(`auth.users: ${userCount} registered users`);

    // Check if there's a trigger to auto-create profiles on signup
    const authTrigger = await one(`
        SELECT trigger_name FROM information_schema.triggers
        WHERE event_object_schema='auth' AND event_object_table='users'
        AND trigger_name ILIKE '%profile%'
    `);
    if (authTrigger) ok(`Auth trigger exists: ${authTrigger.trigger_name}`);
    else {
        warn('No auto-create profile trigger on auth.users — profiles must be created manually after signup');
        // Create the trigger
        await runFix(`
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO public.profiles (id, email, full_name, role, status)
                VALUES (
                    NEW.id,
                    NEW.email,
                    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
                    'customer',
                    'active'
                )
                ON CONFLICT (id) DO NOTHING;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER
        `, 'Create handle_new_user() function');
        await runFix(`
            CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()
        `, 'Create auth user trigger → auto-create profile');
    }
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
    process.stdout.write('\n╔══════════════════════════════════════════════════════╗\n');
    process.stdout.write('║  HealthMitra — Exhaustive Database Verification      ║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════╝\n');
    process.stdout.write(`  URL: db.umyjamvtynsteamwvztu.supabase.co\n`);

    await client.connect();
    ok('Connected to PostgreSQL');

    try {
        await checkTables();
        await checkColumns();
        await checkDataTypes();
        await checkIndexes();
        await checkRLS();
        await checkTriggers();
        await checkForeignKeys();
        await checkUniqueConstraints();
        await checkFunctions();
        await checkSeedData();
        await checkDataIntegrity();
        await checkCodeCompatibility();
        await checkStorage();
        await checkAuth();
    } finally {
        await client.end();
    }

    // ── FINAL REPORT ──────────────────────────────────────
    process.stdout.write(`\n${'═'.repeat(56)}\n`);
    process.stdout.write(`  FINAL REPORT\n`);
    process.stdout.write(`${'═'.repeat(56)}\n`);
    process.stdout.write(`  ✓ PASSED : ${PASS}\n`);
    process.stdout.write(`  ✗ FAILED : ${FAIL}\n`);
    process.stdout.write(`  ⚠ WARNINGS: ${WARN}\n`);
    process.stdout.write(`  ⚡ AUTO-FIXED: ${FIXED}\n`);
    if (issues.length > 0) {
        process.stdout.write(`\n  Issues requiring attention:\n`);
        issues.forEach((i,n) => process.stdout.write(`  ${n+1}. ${i}\n`));
    }
    process.stdout.write(`\n${FAIL === 0 ? '  ✓ DATABASE IS HEALTHY\n' : '  ⚠ DATABASE HAS ISSUES — see above\n'}`);
    process.stdout.write(`${'═'.repeat(56)}\n\n`);
}

main().catch(e => { console.error('\nFATAL:', e.message, e.stack); process.exit(1); });
