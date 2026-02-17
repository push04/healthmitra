-- ============================================================================
-- HealthMitra: Comprehensive Database Fix
-- Run this ONCE in Supabase SQL Editor to fix all CRUD operations
-- Generated: 2026-02-17
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO profiles
-- (Used by ProfileView: address, bank, KYC, health fields)
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Address fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS landmark TEXT;

-- Bank details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_holder_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'savings';

-- KYC fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pan_number TEXT;

-- Security
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';


-- ============================================================================
-- 2. FIX notifications TABLE (code uses is_read, schema has read)
-- ============================================================================

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
-- Copy existing data from 'read' to 'is_read' if 'read' column exists:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
        UPDATE public.notifications SET is_read = "read" WHERE is_read IS NULL OR is_read = false;
    END IF;
END $$;


-- ============================================================================
-- 3. ADD MISSING COLUMNS TO service_requests
-- (admin_notes used by admin actions)
-- ============================================================================

ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';


-- ============================================================================
-- 4. ADD MISSING COLUMNS TO reimbursement_claims
-- (title, amount, bill_date, provider_name, customer_comments, plan_name)
-- ============================================================================

ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2);
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS bill_date DATE;
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS customer_comments TEXT;
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS admin_notes TEXT;


-- ============================================================================
-- 5. ADD MISSING COLUMNS TO plans
-- (status, type, is_featured, duration_months, image_url)
-- ============================================================================

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'individual';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 12;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS image_url TEXT;


-- ============================================================================
-- 6. CREATE wallets TABLE (referenced by dashboard but doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS for wallets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Users view own wallet') THEN
        CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Users update own wallet') THEN
        CREATE POLICY "Users update own wallet" ON public.wallets FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;


-- ============================================================================
-- 7. CREATE members VIEW (code references 'members', schema has 'ecard_members')
-- ============================================================================

CREATE OR REPLACE VIEW public.members AS
SELECT
    id,
    user_id,
    plan_id,
    member_id_code,
    card_unique_id,
    full_name,
    relation,
    dob,
    gender,
    blood_group,
    photo_url,
    policy_number,
    valid_from,
    valid_till,
    contact_number,
    email,
    aadhaar_last4,
    status,
    created_at,
    updated_at
FROM public.ecard_members;


-- ============================================================================
-- 8. CREATE invoices TABLE (referenced by user.ts getUserInvoices)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    payment_method TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users view own invoices') THEN
        CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);


-- ============================================================================
-- 9. CREATE plan_categories TABLE (referenced by plans.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 10. FIX RLS POLICIES — Add missing INSERT/UPDATE/DELETE policies
-- Without these, users cannot create or update ANY data
-- ============================================================================

-- 10a. profiles: Users can insert and update their own profile
-- (INSERT and UPDATE policies already exist in schema, but let's ensure)

-- 10b. service_requests: Users need INSERT for creating requests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Users can create requests') THEN
        CREATE POLICY "Users can create requests" ON public.service_requests
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Users can update own requests') THEN
        CREATE POLICY "Users can update own requests" ON public.service_requests
        FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- 10c. reimbursement_claims: Users need INSERT and UPDATE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reimbursement_claims' AND policyname = 'Users can create claims') THEN
        CREATE POLICY "Users can create claims" ON public.reimbursement_claims
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reimbursement_claims' AND policyname = 'Admins manage all claims') THEN
        CREATE POLICY "Admins manage all claims" ON public.reimbursement_claims
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10d. phr_documents: Users need INSERT for uploading
DO $$
BEGIN
    -- The existing policy uses FOR ALL which covers INSERT, but let's make sure
    -- If it's only SELECT, we need INSERT too
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phr_documents' AND policyname = 'Users can insert PHR') THEN
        CREATE POLICY "Users can insert PHR" ON public.phr_documents
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- 10e. notifications: Users need UPDATE (to mark as read)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users update own notifications') THEN
        CREATE POLICY "Users update own notifications" ON public.notifications
        FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- 10f. wallet_transactions: Users need INSERT (for creating transactions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'Users can insert wallet transactions') THEN
        CREATE POLICY "Users can insert wallet transactions" ON public.wallet_transactions
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- 10g. request_timeline: Allow SELECT for users who own the parent request
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'request_timeline' AND policyname = 'Users view own request timeline') THEN
        CREATE POLICY "Users view own request timeline" ON public.request_timeline
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.service_requests WHERE service_requests.id = request_timeline.request_id AND service_requests.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'request_timeline' AND policyname = 'Admins manage timeline') THEN
        CREATE POLICY "Admins manage timeline" ON public.request_timeline
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10h. request_messages: Allow SELECT/INSERT for users who own the parent request
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'request_messages' AND policyname = 'Users view own request messages') THEN
        CREATE POLICY "Users view own request messages" ON public.request_messages
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.service_requests WHERE service_requests.id = request_messages.request_id AND service_requests.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'request_messages' AND policyname = 'Users can send messages') THEN
        CREATE POLICY "Users can send messages" ON public.request_messages
        FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.service_requests WHERE service_requests.id = request_messages.request_id AND service_requests.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'request_messages' AND policyname = 'Admins manage messages') THEN
        CREATE POLICY "Admins manage messages" ON public.request_messages
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10i. plans: Admin full access for CRUD
DO $$
BEGIN
    ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Public view active plans') THEN
        CREATE POLICY "Public view active plans" ON public.plans FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Admins manage plans') THEN
        CREATE POLICY "Admins manage plans" ON public.plans
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10j. plan_categories: Admin CRUD
DO $$
BEGIN
    ALTER TABLE public.plan_categories ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_categories' AND policyname = 'Public view categories') THEN
        CREATE POLICY "Public view categories" ON public.plan_categories FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_categories' AND policyname = 'Admins manage categories') THEN
        CREATE POLICY "Admins manage categories" ON public.plan_categories
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10k. ecard_members: Users need INSERT (to add family members)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecard_members' AND policyname = 'Users can add members') THEN
        CREATE POLICY "Users can add members" ON public.ecard_members
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecard_members' AND policyname = 'Users can update own members') THEN
        CREATE POLICY "Users can update own members" ON public.ecard_members
        FOR UPDATE USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecard_members' AND policyname = 'Admins manage all members') THEN
        CREATE POLICY "Admins manage all members" ON public.ecard_members
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10l. audit_logs: Admin read, any authenticated insert
-- Create table if not exists (code references it from dashboard)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id if table existed without it
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins view audit logs') THEN
        CREATE POLICY "Admins view audit logs" ON public.audit_logs
        FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    -- Users can view their own audit logs (for dashboard activity feed)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users view own audit logs') THEN
        CREATE POLICY "Users view own audit logs" ON public.audit_logs
        FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Authenticated users can log') THEN
        CREATE POLICY "Authenticated users can log" ON public.audit_logs
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 10m. cms_content: Admin CRUD, public read
DO $$
BEGIN
    ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_content' AND policyname = 'Public view cms') THEN
        CREATE POLICY "Public view cms" ON public.cms_content FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_content' AND policyname = 'Admins manage cms') THEN
        CREATE POLICY "Admins manage cms" ON public.cms_content
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10n. coupons: Admin CRUD
DO $$
BEGIN
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Public view active coupons') THEN
        CREATE POLICY "Public view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Admins manage coupons') THEN
        CREATE POLICY "Admins manage coupons" ON public.coupons
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10o. franchises + franchise_partners: Admin + franchise owner access
DO $$
BEGIN
    ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.franchise_partners ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchises' AND policyname = 'Franchise owners view own') THEN
        CREATE POLICY "Franchise owners view own" ON public.franchises
        FOR SELECT USING (owner_user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchises' AND policyname = 'Admins manage franchises') THEN
        CREATE POLICY "Admins manage franchises" ON public.franchises
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchise_partners' AND policyname = 'Franchise owners view partners') THEN
        CREATE POLICY "Franchise owners view partners" ON public.franchise_partners
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.franchises WHERE franchises.id = franchise_partners.franchise_id AND franchises.owner_user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchise_partners' AND policyname = 'Admins manage franchise partners') THEN
        CREATE POLICY "Admins manage franchise partners" ON public.franchise_partners
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 10p. cities: already has SELECT, add admin management
DO $$
BEGIN
    ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cities' AND policyname = 'Admins manage cities') THEN
        CREATE POLICY "Admins manage cities" ON public.cities
        FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;


-- ============================================================================
-- 11. CREATE HELPER FUNCTION: Generate display IDs for service requests
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_request_id()
RETURNS TRIGGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(request_id_display, '-', 3) AS INTEGER)), 0) + 1
    INTO next_val
    FROM public.service_requests
    WHERE request_id_display LIKE 'SR-%';

    IF NEW.request_id_display IS NULL OR NEW.request_id_display = '' THEN
        NEW.request_id_display := 'SR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_val::TEXT, 4, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_service_request_id ON public.service_requests;
CREATE TRIGGER on_service_request_id
    BEFORE INSERT ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION generate_request_id();


-- ============================================================================
-- 12. AUTO-CREATE PROFILE ON SIGNUP (trigger on auth.users)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        'user'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Also create a wallet for the user
    INSERT INTO public.wallets (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 13. FIX ecard_members coverage_amount (referenced by dashboard)
-- ============================================================================

ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12, 2);


-- ============================================================================
-- DONE! All schema fixes applied.
-- ============================================================================
