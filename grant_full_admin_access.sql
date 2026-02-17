-- ============================================================================
-- Grant Full Admin Access & Ensure Tables Exist
-- FIXES: "relation public.departments does not exist" error
-- ============================================================================

-- 1. Create Departments Table (Missing)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    head_name TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Admins manage departments') THEN
        CREATE POLICY "Admins manage departments" ON public.departments
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Public view departments') THEN
        CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);
    END IF;
END $$;


-- 2. Create Invoices Table (If Missing)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'paid',
    payment_method TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Admins manage all invoices') THEN
        CREATE POLICY "Admins manage all invoices" ON public.invoices
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users view own invoices') THEN
        CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;


-- 3. Profiles (Ensure Policy Exists)
DO $$
BEGIN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins manage all profiles') THEN
        CREATE POLICY "Admins manage all profiles" ON public.profiles
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;


-- 4. Audit Logs (Create If Missing)
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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins manage all audit logs') THEN
        CREATE POLICY "Admins manage all audit logs" ON public.audit_logs
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;
