-- Database Fix for Admin Dashboard Issues
-- Run this file to fix missing tables and columns

BEGIN;

-- 1. Ensure invoices table exists with all required columns
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id),
    member_id UUID REFERENCES public.ecard_members(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- 3. Ensure payments table has required columns (may already exist)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'razorpay';

-- 4. Fix reimbursement_claims - ensure status column exists (for querying)
ALTER TABLE public.reimbursement_claims ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';

-- 5. Add is_active to plans if missing
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 6. Add status to ecard_members
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 7. Create audit_logs table if missing (referenced by dashboard)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);

-- 8. Ensure wallets table exists
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    minimum_balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- 9. Ensure contact_messages table exists
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'closed')),
    replied_by UUID REFERENCES public.profiles(id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- 10. Ensure call_centre_agents table exists
CREATE TABLE IF NOT EXISTS public.call_centre_agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    agent_code TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
    shift_start TIME,
    shift_end TIME,
    total_calls INTEGER DEFAULT 0,
    today_calls INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Ensure withdrawal_requests table exists
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed', 'failed')),
    payment_method TEXT,
    upi_id TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    admin_notes TEXT,
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- 12. Ensure partner_commissions table exists
CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.ecard_members(id),
    plan_id UUID REFERENCES public.plans(id),
    sale_amount DECIMAL(12, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    payment_date TIMESTAMPTZ,
    notes TEXT,
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Ensure departments table exists
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    head_id UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Ensure phr_categories table exists
CREATE TABLE IF NOT EXISTS public.phr_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Ensure notifications table has is_read column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 16. Add profile columns if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 17. Add plan columns if missing
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 18. Add service_requests columns if missing
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 19. Add ecard_members columns if missing
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12, 2);
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS emergency_phone TEXT;

-- 20. Insert default departments if not exists
INSERT INTO public.departments (id, name, description, is_active) 
SELECT uuid_generate_v4(), 'Customer Support', 'Handle customer queries and issues', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Customer Support');

INSERT INTO public.departments (id, name, description, is_active)
SELECT uuid_generate_v4(), 'Sales', 'Handle sales and inquiries', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Sales');

INSERT INTO public.departments (id, name, description, is_active)
SELECT uuid_generate_v4(), 'Claims', 'Handle reimbursement claims', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Claims');

-- 21. Insert default PHR categories if not exists
INSERT INTO public.phr_categories (id, name, description, icon, is_active, sort_order)
SELECT uuid_generate_v4(), 'Prescriptions', 'Doctor prescriptions and medicines', 'pill', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Prescriptions');

INSERT INTO public.phr_categories (id, name, description, icon, is_active, sort_order)
SELECT uuid_generate_v4(), 'Test Reports', 'Lab reports and diagnostic results', 'file-text', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Test Reports');

INSERT INTO public.phr_categories (id, name, description, icon, is_active, sort_order)
SELECT uuid_generate_v4(), 'Bills', 'Medical bills and invoices', 'receipt', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Bills');

INSERT INTO public.phr_categories (id, name, description, icon, is_active, sort_order)
SELECT uuid_generate_v4(), 'Vaccination Records', 'Vaccination certificates and records', 'shield', true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.phr_categories WHERE name = 'Vaccination Records');

COMMIT;
