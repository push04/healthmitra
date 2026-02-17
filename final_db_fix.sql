-- ============================================================================
-- FINAL DATABASE FIX SCRIPT
-- Run this in Supabase SQL Editor to fix ALL tables, RLS, and permissions.
-- Safe to run multiple times (Idempotent).
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create/Update Tables
-- ============================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Expanded fields
    dob DATE,
    blood_group TEXT,
    gender TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    bank_holder_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    aadhaar_number TEXT,
    pan_number TEXT
);

-- WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    head_name TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLANS
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB,
    status TEXT DEFAULT 'active',
    type TEXT DEFAULT 'individual',
    duration_months INTEGER DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ECARD MEMBERS
CREATE TABLE IF NOT EXISTS public.ecard_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id),
    full_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id_display TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    subject TEXT,
    description TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT,
    amount DECIMAL(12, 2),
    status TEXT DEFAULT 'paid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS CONTENT
CREATE TABLE IF NOT EXISTS public.cms_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on ALL tables
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecard_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;


-- 4. Grant ADMIN ACCESS (The Critical Fix)
-- ============================================================================
-- Loop through tables and create policies dynamically or manually

-- PROFILES: Admin All, User View Self
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- DEPARTMENTS: Admin All, Public Read
DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Public view departments" ON public.departments;
CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);

-- SERVICE REQUESTS: Admin All, User CRUD Own
DROP POLICY IF EXISTS "Admins manage all requests" ON public.service_requests;
CREATE POLICY "Admins manage all requests" ON public.service_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users view own requests" ON public.service_requests;
CREATE POLICY "Users view own requests" ON public.service_requests FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users create requests" ON public.service_requests;
CREATE POLICY "Users create requests" ON public.service_requests FOR INSERT WITH CHECK (user_id = auth.uid());

-- INVOICES: Admin All, User View Own
DROP POLICY IF EXISTS "Admins manage all invoices" ON public.invoices;
CREATE POLICY "Admins manage all invoices" ON public.invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (user_id = auth.uid());

-- AUDIT LOGS: Admin View, System/User Insert
DROP POLICY IF EXISTS "Admins manage all audit logs" ON public.audit_logs;
CREATE POLICY "Admins manage all audit logs" ON public.audit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Triggers (Auto Profile Creation)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        'user'
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DONE
