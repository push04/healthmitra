/**
 * HealthMitra — Full Schema Apply + Migration
 * Applies complete schema to empty Supabase database
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
const { Client } = pg;

const client = new Client({
    host: 'db.umyjamvtynsteamwvztu.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Pushpal2004',
    ssl: { rejectUnauthorized: false }
});

const CWD = process.cwd();

function log(m)  { process.stdout.write(m + '\n'); }
function ok(m)   { log(`  ✓ ${m}`); }
function fail(m) { log(`  ✗ ${m}`); }
function head(m) { log(`\n══════════════════════════════════════\n  ${m}\n══════════════════════════════════════`); }

async function run(sql, label) {
    try {
        await client.query(sql);
        if (label) ok(label);
        return true;
    } catch(e) {
        if (label) {
            const msg = e.message;
            if (msg.includes('already exists') || msg.includes('duplicate')) {
                ok(`${label} (already exists)`);
                return true;
            }
            fail(`${label}: ${msg.substring(0, 120)}`);
        }
        return false;
    }
}

async function q(sql, params = []) {
    const res = await client.query(sql, params);
    return res.rows;
}

async function tableExists(t) {
    const r = await client.query(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)::boolean as e`,
        [t]
    );
    return r.rows[0].e;
}

// ── STEP 1: Core extensions & functions ──────────────────────────────────────
async function step1_extensions() {
    head('STEP 1: Extensions & Functions');
    await run(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, 'uuid-ossp extension');
    await run(`CREATE EXTENSION IF NOT EXISTS pgcrypto`, 'pgcrypto extension');

    await run(`
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
        $$ LANGUAGE plpgsql
    `, 'handle_updated_at function');
}

// ── STEP 2: Profiles ─────────────────────────────────────────────────────────
async function step2_profiles() {
    head('STEP 2: Profiles');
    if (await tableExists('profiles')) { ok('profiles: already exists'); return; }

    await run(`
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE,
            full_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'customer',
            status TEXT DEFAULT 'active',
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create profiles table');

    await run(`CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`, 'profiles updated_at trigger');
    await run(`CREATE INDEX idx_profiles_email ON public.profiles(email)`, 'profiles email index');
    await run(`CREATE INDEX idx_profiles_role ON public.profiles(role)`, 'profiles role index');
    await run(`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`, 'profiles RLS');
    await run(`CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true)`, 'profiles select policy');
    await run(`CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)`, 'profiles insert policy');
    await run(`CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)`, 'profiles update policy');
    await run(`CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))`, 'profiles admin policy');
}

// ── STEP 3: Plans ────────────────────────────────────────────────────────────
async function step3_plans() {
    head('STEP 3: Plans');
    if (await tableExists('plans')) { ok('plans: already exists'); return; }

    await run(`
        CREATE TABLE public.plans (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            duration_days INTEGER DEFAULT 365,
            features JSONB DEFAULT '[]',
            coverage_amount DECIMAL(12,2),
            status TEXT DEFAULT 'active',
            is_active BOOLEAN DEFAULT true,
            type TEXT DEFAULT 'health',
            is_featured BOOLEAN DEFAULT false,
            image_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create plans table');

    await run(`CREATE TRIGGER on_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`, 'plans updated_at trigger');
    await run(`ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY`, 'plans RLS');
    await run(`CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (status = 'active' OR status = 'published' OR is_active = true)`, 'plans select policy');
    await run(`CREATE POLICY "Admins manage plans" ON public.plans FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'plans admin policy');
}

// ── STEP 4: E-Card Members ───────────────────────────────────────────────────
async function step4_ecards() {
    head('STEP 4: E-Card Members');
    if (await tableExists('ecard_members')) { ok('ecard_members: already exists'); return; }

    await run(`
        CREATE TABLE public.ecard_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            plan_id UUID REFERENCES public.plans(id),
            member_id_code TEXT UNIQUE,
            card_unique_id TEXT UNIQUE,
            full_name TEXT NOT NULL,
            relation TEXT NOT NULL DEFAULT 'Self',
            dob DATE,
            gender TEXT CHECK (gender IN ('M','F','Other')),
            blood_group TEXT,
            photo_url TEXT,
            policy_number TEXT,
            valid_from DATE,
            valid_till DATE,
            contact_number TEXT,
            email TEXT,
            aadhaar_last4 TEXT,
            coverage_amount DECIMAL(12,2),
            status TEXT DEFAULT 'pending' CHECK (status IN ('active','pending','expired','suspended')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create ecard_members table');

    await run(`CREATE TRIGGER on_ecard_updated BEFORE UPDATE ON public.ecard_members FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`, 'ecard_members trigger');
    await run(`CREATE INDEX idx_ecard_user_id ON public.ecard_members(user_id)`, 'ecard_members user_id index');
    await run(`CREATE INDEX idx_ecard_plan_id ON public.ecard_members(plan_id)`, 'ecard_members plan_id index');
    await run(`CREATE INDEX idx_ecard_status ON public.ecard_members(status)`, 'ecard_members status index');
    await run(`ALTER TABLE public.ecard_members ENABLE ROW LEVEL SECURITY`, 'ecard_members RLS');
    await run(`CREATE POLICY "Users view own members" ON public.ecard_members FOR SELECT USING (auth.uid() = user_id)`, 'ecard_members user select');
    await run(`CREATE POLICY "Users insert own members" ON public.ecard_members FOR INSERT WITH CHECK (auth.uid() = user_id)`, 'ecard_members user insert');
    await run(`CREATE POLICY "Admins manage all members" ON public.ecard_members FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'ecard_members admin');
}

// ── STEP 5: Service Requests ─────────────────────────────────────────────────
async function step5_service_requests() {
    head('STEP 5: Service Requests');
    if (await tableExists('service_requests')) { ok('service_requests: already exists'); return; }

    await run(`
        CREATE TABLE public.service_requests (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            request_id_display TEXT UNIQUE,
            user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            member_id UUID REFERENCES public.ecard_members(id) ON DELETE SET NULL,
            type TEXT,
            status TEXT DEFAULT 'pending',
            details JSONB DEFAULT '{}',
            assigned_to UUID REFERENCES public.profiles(id),
            admin_notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create service_requests table');

    await run(`CREATE TRIGGER on_sr_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`, 'service_requests trigger');
    await run(`CREATE INDEX idx_sr_user_id ON public.service_requests(user_id)`, 'service_requests user_id index');
    await run(`CREATE INDEX idx_sr_status ON public.service_requests(status)`, 'service_requests status index');
    await run(`CREATE INDEX idx_sr_assigned ON public.service_requests(assigned_to)`, 'service_requests assigned_to index');
    await run(`ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY`, 'service_requests RLS');
    await run(`CREATE POLICY "Users view own requests" ON public.service_requests FOR SELECT USING (user_id = auth.uid())`, 'service_requests user select');
    await run(`CREATE POLICY "Users insert own requests" ON public.service_requests FOR INSERT WITH CHECK (user_id = auth.uid())`, 'service_requests user insert');
    await run(`CREATE POLICY "Admins manage all requests" ON public.service_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'service_requests admin');
}

// ── STEP 6: Request Messages ─────────────────────────────────────────────────
async function step6_messages() {
    head('STEP 6: Request Messages');
    if (await tableExists('request_messages')) { ok('request_messages: already exists'); return; }

    await run(`
        CREATE TABLE public.request_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
            sender_id UUID REFERENCES public.profiles(id),
            message TEXT NOT NULL,
            attachments JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create request_messages table');

    await run(`CREATE INDEX idx_rm_request_id ON public.request_messages(request_id)`, 'request_messages index');
    await run(`ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY`, 'request_messages RLS');
    await run(`CREATE POLICY "View messages" ON public.request_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_messages.request_id AND user_id = auth.uid()) OR sender_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'request_messages select');
    await run(`CREATE POLICY "Post messages" ON public.request_messages FOR INSERT WITH CHECK (sender_id = auth.uid())`, 'request_messages insert');
}

// ── STEP 7: PHR ──────────────────────────────────────────────────────────────
async function step7_phr() {
    head('STEP 7: PHR Documents & Categories');

    if (!(await tableExists('phr_categories'))) {
        await run(`
            CREATE TABLE public.phr_categories (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create phr_categories');
        await run(`
            INSERT INTO public.phr_categories (name, icon, display_order) VALUES
            ('Prescriptions','pill',1),('Bills','receipt',2),
            ('Test Reports','flask',3),('General Records','folder',4),
            ('Discharge Summaries','file-text',5),('Vaccination Records','syringe',6)
        `, 'Seed phr_categories');
    } else { ok('phr_categories: already exists'); }

    if (!(await tableExists('phr_documents'))) {
        await run(`
            CREATE TABLE public.phr_documents (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                member_id UUID REFERENCES public.ecard_members(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                file_type TEXT,
                file_size TEXT,
                file_url TEXT NOT NULL DEFAULT '#',
                tags TEXT[],
                doctor_name TEXT,
                date_of_record DATE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create phr_documents');
        await run(`CREATE INDEX idx_phr_user_id ON public.phr_documents(user_id)`, 'phr_documents index');
        await run(`ALTER TABLE public.phr_documents ENABLE ROW LEVEL SECURITY`, 'phr_documents RLS');
        await run(`CREATE POLICY "Users manage own PHR" ON public.phr_documents FOR ALL USING (user_id = auth.uid())`, 'phr_documents user policy');
        await run(`CREATE POLICY "Admins manage all PHR" ON public.phr_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'phr_documents admin policy');
    } else { ok('phr_documents: already exists'); }
}

// ── STEP 8: Wallet & Reimbursements ─────────────────────────────────────────
async function step8_wallet() {
    head('STEP 8: Wallets & Reimbursements');

    if (!(await tableExists('wallets'))) {
        await run(`
            CREATE TABLE public.wallets (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
                balance DECIMAL(12,2) DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create wallets');
        await run(`ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY`, 'wallets RLS');
        await run(`CREATE POLICY "Users manage own wallet" ON public.wallets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`, 'wallets policy');
    } else { ok('wallets: already exists'); }

    if (!(await tableExists('wallet_transactions'))) {
        await run(`
            CREATE TABLE public.wallet_transactions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                type TEXT CHECK (type IN ('credit','debit')),
                amount DECIMAL(12,2) NOT NULL,
                description TEXT,
                reference_id TEXT,
                status TEXT DEFAULT 'success' CHECK (status IN ('success','pending','failed')),
                transaction_date TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create wallet_transactions');
        await run(`CREATE INDEX idx_wallet_tx_user ON public.wallet_transactions(user_id)`, 'wallet_transactions index');
        await run(`ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY`, 'wallet_transactions RLS');
        await run(`CREATE POLICY "Users view own wallet txns" ON public.wallet_transactions FOR SELECT USING (user_id = auth.uid())`, 'wallet_transactions policy');
    } else { ok('wallet_transactions: already exists'); }

    if (!(await tableExists('withdrawal_requests'))) {
        await run(`
            CREATE TABLE public.withdrawal_requests (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                customer_name TEXT,
                customer_email TEXT,
                amount DECIMAL(12,2) NOT NULL,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
                bank_name TEXT,
                bank_account TEXT,
                ifsc_code TEXT,
                admin_notes TEXT,
                processed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create withdrawal_requests');
        await run(`CREATE INDEX idx_wr_user_id ON public.withdrawal_requests(user_id)`, 'withdrawal_requests index');
        await run(`ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY`, 'withdrawal_requests RLS');
        await run(`CREATE POLICY "Users view own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id)`, 'withdrawal_requests user select');
        await run(`CREATE POLICY "Users insert own withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id)`, 'withdrawal_requests user insert');
        await run(`CREATE POLICY "Admins manage withdrawals" ON public.withdrawal_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'withdrawal_requests admin');
    } else { ok('withdrawal_requests: already exists'); }

    if (!(await tableExists('reimbursement_claims'))) {
        await run(`
            CREATE TABLE public.reimbursement_claims (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                claim_id_display TEXT UNIQUE,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                patient_member_id UUID REFERENCES public.ecard_members(id),
                claim_type TEXT CHECK (claim_type IN ('medicine','diagnostic','opd','hospitalization')),
                amount_requested DECIMAL(12,2) NOT NULL DEFAULT 0,
                amount_approved DECIMAL(12,2),
                hospital_name TEXT,
                treatment_date DATE,
                diagnosis TEXT,
                status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','processing','approved','rejected','under-review')),
                documents JSONB,
                admin_comments TEXT,
                rejection_reason TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create reimbursement_claims');
        await run(`CREATE TRIGGER on_claims_updated BEFORE UPDATE ON public.reimbursement_claims FOR EACH ROW EXECUTE PROCEDURE handle_updated_at()`, 'claims trigger');
        await run(`CREATE INDEX idx_claims_user_id ON public.reimbursement_claims(user_id)`, 'claims user index');
        await run(`CREATE INDEX idx_claims_status ON public.reimbursement_claims(status)`, 'claims status index');
        await run(`ALTER TABLE public.reimbursement_claims ENABLE ROW LEVEL SECURITY`, 'claims RLS');
        await run(`CREATE POLICY "Users view own claims" ON public.reimbursement_claims FOR SELECT USING (user_id = auth.uid())`, 'claims user select');
        await run(`CREATE POLICY "Users insert own claims" ON public.reimbursement_claims FOR INSERT WITH CHECK (user_id = auth.uid())`, 'claims user insert');
        await run(`CREATE POLICY "Admins manage all claims" ON public.reimbursement_claims FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'claims admin');
    } else { ok('reimbursement_claims: already exists'); }
}

// ── STEP 9: Payments & Invoices ──────────────────────────────────────────────
async function step9_payments() {
    head('STEP 9: Payments & Invoices');

    if (!(await tableExists('payments'))) {
        await run(`
            CREATE TABLE public.payments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id),
                plan_id UUID REFERENCES public.plans(id),
                amount DECIMAL(12,2) NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending',
                razorpay_order_id TEXT,
                razorpay_payment_id TEXT,
                razorpay_signature TEXT,
                payment_method TEXT,
                purpose TEXT,
                metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create payments');
        await run(`CREATE INDEX idx_payments_user_id ON public.payments(user_id)`, 'payments index');
        await run(`ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY`, 'payments RLS');
        await run(`CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (user_id = auth.uid())`, 'payments user select');
        await run(`CREATE POLICY "Admins manage all payments" ON public.payments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'payments admin');
    } else { ok('payments: already exists'); }

    if (!(await tableExists('invoices'))) {
        await run(`
            CREATE TABLE public.invoices (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                plan_id UUID REFERENCES public.plans(id),
                invoice_number TEXT UNIQUE,
                plan_name TEXT,
                amount DECIMAL(12,2),
                gst DECIMAL(12,2) DEFAULT 0,
                total DECIMAL(12,2),
                payment_method TEXT,
                transaction_id TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create invoices');
        await run(`ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY`, 'invoices RLS');
        await run(`CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id)`, 'invoices user select');
        await run(`CREATE POLICY "Admins manage all invoices" ON public.invoices FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'invoices admin');
    } else { ok('invoices: already exists'); }
}

// ── STEP 10: Notifications ───────────────────────────────────────────────────
async function step10_notifications() {
    head('STEP 10: Notifications');
    if (await tableExists('notifications')) { ok('notifications: already exists'); return; }

    await run(`
        CREATE TABLE public.notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sender_id UUID,
            recipient_id UUID NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'general' CHECK (type IN ('general','reimbursement','withdrawal','plan','service','system','promotional')),
            is_read BOOLEAN DEFAULT false,
            read_at TIMESTAMPTZ,
            action_url TEXT,
            action_label TEXT,
            priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `, 'Create notifications');
    await run(`CREATE INDEX idx_notif_recipient ON public.notifications(recipient_id)`, 'notifications recipient index');
    await run(`CREATE INDEX idx_notif_unread ON public.notifications(recipient_id, is_read) WHERE is_read = false`, 'notifications unread index');
    await run(`ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY`, 'notifications RLS');
    await run(`CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id)`, 'notifications user select');
    await run(`CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id)`, 'notifications user update');
    await run(`CREATE POLICY "Admins manage all notifications" ON public.notifications FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'notifications admin');
}

// ── STEP 11: Franchises & Partners ──────────────────────────────────────────
async function step11_franchises() {
    head('STEP 11: Franchises & Partners');

    if (!(await tableExists('franchises'))) {
        await run(`
            CREATE TABLE public.franchises (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                owner_user_id UUID REFERENCES public.profiles(id),
                franchise_name TEXT NOT NULL,
                code TEXT UNIQUE,
                contact_email TEXT,
                contact_phone TEXT,
                gst_number TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                commission_percentage DECIMAL(5,2) DEFAULT 10.00,
                status TEXT DEFAULT 'active',
                verification_status TEXT DEFAULT 'unverified',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create franchises');
        await run(`CREATE INDEX idx_franchises_code ON public.franchises(code)`, 'franchises index');
        await run(`ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY`, 'franchises RLS');
        await run(`CREATE POLICY "Admins manage franchises" ON public.franchises FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'franchises admin');
    } else { ok('franchises: already exists'); }

    if (!(await tableExists('franchise_partners'))) {
        await run(`
            CREATE TABLE public.franchise_partners (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
                partner_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                status TEXT DEFAULT 'active',
                joined_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create franchise_partners');
        await run(`CREATE INDEX idx_fp_franchise_id ON public.franchise_partners(franchise_id)`, 'franchise_partners index');
        await run(`ALTER TABLE public.franchise_partners ENABLE ROW LEVEL SECURITY`, 'franchise_partners RLS');
        await run(`CREATE POLICY "Admins manage franchise partners" ON public.franchise_partners FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'franchise_partners admin');
    } else { ok('franchise_partners: already exists'); }
}

// ── STEP 12: CMS, Settings, System ──────────────────────────────────────────
async function step12_system() {
    head('STEP 12: System, CMS, Coupons, Audit');

    if (!(await tableExists('system_settings'))) {
        await run(`
            CREATE TABLE public.system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL DEFAULT '',
                description TEXT,
                is_secure BOOLEAN DEFAULT false,
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                updated_by UUID REFERENCES public.profiles(id)
            )
        `, 'Create system_settings');
        await run(`ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY`, 'system_settings RLS');
        await run(`CREATE POLICY "Public view non-secure settings" ON public.system_settings FOR SELECT USING (is_secure = false)`, 'system_settings public select');
        await run(`CREATE POLICY "Admins full access settings" ON public.system_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'system_settings admin');
        // Seed default settings
        await run(`
            INSERT INTO public.system_settings (key, value, description) VALUES
            ('razorpay_enabled','false','Enable Razorpay payment gateway'),
            ('razorpay_key_id','','Razorpay Key ID'),
            ('razorpay_key_secret','','Razorpay Key Secret'),
            ('company_name','HealthMitra','Company name'),
            ('company_tagline','Your Trusted Healthcare Partner','Company tagline'),
            ('india_phone','+91 9818823106','India contact number'),
            ('usa_phone','716-579-0346','USA contact number'),
            ('support_email','support@healthmitra.com','Support email'),
            ('facebook_url','','Facebook URL'),
            ('twitter_url','','Twitter URL'),
            ('instagram_url','','Instagram URL'),
            ('linkedin_url','','LinkedIn URL')
            ON CONFLICT (key) DO NOTHING
        `, 'Seed system_settings');
    } else { ok('system_settings: already exists'); }

    if (!(await tableExists('audit_logs'))) {
        await run(`
            CREATE TABLE public.audit_logs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                admin_id UUID REFERENCES public.profiles(id),
                action TEXT NOT NULL,
                target_resource TEXT,
                entity_type TEXT,
                details JSONB,
                ip_address TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create audit_logs');
        await run(`CREATE INDEX idx_audit_admin ON public.audit_logs(admin_id)`, 'audit_logs index');
        await run(`ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY`, 'audit_logs RLS');
        await run(`CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'audit_logs admin');
    } else { ok('audit_logs: already exists'); }

    if (!(await tableExists('cms_content'))) {
        await run(`
            CREATE TABLE public.cms_content (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value JSONB NOT NULL DEFAULT '{}',
                updated_by UUID REFERENCES public.profiles(id),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create cms_content');
        await run(`ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY`, 'cms_content RLS');
        await run(`CREATE POLICY "Anyone can read CMS" ON public.cms_content FOR SELECT USING (true)`, 'cms_content public select');
        await run(`CREATE POLICY "Admins manage CMS" ON public.cms_content FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'cms_content admin');
    } else { ok('cms_content: already exists'); }

    if (!(await tableExists('coupons'))) {
        await run(`
            CREATE TABLE public.coupons (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                discount_type TEXT CHECK (discount_type IN ('percentage','flat','fixed')),
                discount_value DECIMAL(10,2) NOT NULL,
                valid_from TIMESTAMPTZ,
                valid_until TIMESTAMPTZ,
                usage_limit INTEGER,
                used_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create coupons');
        await run(`ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY`, 'coupons RLS');
        await run(`CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT USING (is_active = true)`, 'coupons public select');
        await run(`CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))`, 'coupons admin');
    } else { ok('coupons: already exists'); }
}

// ── STEP 13: Locations, Appointments, Departments ───────────────────────────
async function step13_misc() {
    head('STEP 13: Cities, Appointments, Departments');

    if (!(await tableExists('cities'))) {
        await run(`
            CREATE TABLE public.cities (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                region TEXT,
                pincodes TEXT[],
                is_serviceable BOOLEAN DEFAULT true,
                status TEXT DEFAULT 'active',
                service_centers JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create cities');
        await run(`ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY`, 'cities RLS');
        await run(`CREATE POLICY "Public view cities" ON public.cities FOR SELECT USING (true)`, 'cities public select');
    } else { ok('cities: already exists'); }

    if (!(await tableExists('appointments'))) {
        await run(`
            CREATE TABLE public.appointments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
                doctor_name TEXT,
                specialization TEXT,
                appointment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
                meeting_link TEXT,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create appointments');
        await run(`CREATE INDEX idx_appointments_user ON public.appointments(user_id)`, 'appointments index');
        await run(`ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY`, 'appointments RLS');
        await run(`CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (user_id = auth.uid())`, 'appointments user select');
    } else { ok('appointments: already exists'); }

    if (!(await tableExists('departments'))) {
        await run(`
            CREATE TABLE public.departments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `, 'Create departments');
        await run(`ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY`, 'departments RLS');
        await run(`CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true)`, 'departments public select');
    } else { ok('departments: already exists'); }
}

// ── STEP 14: Final verification ──────────────────────────────────────────────
async function step14_verify() {
    head('STEP 14: FINAL VERIFICATION');

    const allTables = [
        'profiles','plans','ecard_members','payments','invoices',
        'service_requests','request_messages','reimbursement_claims',
        'wallet_transactions','wallets','withdrawal_requests',
        'notifications','phr_documents','phr_categories',
        'franchises','franchise_partners','coupons',
        'system_settings','audit_logs','cms_content',
        'cities','appointments','departments'
    ];

    let passed = 0, failed = 0;
    for (const t of allTables) {
        const exists = await tableExists(t);
        exists ? (ok(t), passed++) : (fail(t + ' — MISSING'), failed++);
    }

    log(`\n  Tables: ${passed} ✓  ${failed} ✗`);

    // Count settings
    const settings = await q(`SELECT COUNT(*) as c FROM public.system_settings`);
    ok(`system_settings: ${settings[0].c} rows`);

    const cats = await q(`SELECT COUNT(*) as c FROM public.phr_categories`);
    ok(`phr_categories: ${cats[0].c} rows`);

    return failed === 0;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    log('\n╔══════════════════════════════════════════╗');
    log('║  HealthMitra — Full Schema Apply         ║');
    log('╚══════════════════════════════════════════╝');

    await client.connect();
    ok('Connected to PostgreSQL');

    try {
        await step1_extensions();
        await step2_profiles();
        await step3_plans();
        await step4_ecards();
        await step5_service_requests();
        await step6_messages();
        await step7_phr();
        await step8_wallet();
        await step9_payments();
        await step10_notifications();
        await step11_franchises();
        await step12_system();
        await step13_misc();
        const success = await step14_verify();

        log('\n╔══════════════════════════════════════════╗');
        log(success
            ? '║  ✓ ALL DONE — Schema fully applied!      ║'
            : '║  ⚠ Done with warnings — check output     ║');
        log('╚══════════════════════════════════════════╝\n');
    } finally {
        await client.end();
    }
}

main().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
