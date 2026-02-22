-- Admin Dashboard Database Fix
-- Comprehensive fix for missing tables and columns

BEGIN;

-- 1. Add status column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Add status column to plans if not exists  
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Fix notifications table - add is_read column (code uses is_read, schema has read)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 4. Create wallets table (for user wallet balances)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    minimum_balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create invoices table (for tracking payments/revenue)
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

-- 6. Create contact_messages table
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

-- 7. Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    head_id UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create phr_categories table
CREATE TABLE IF NOT EXISTS public.phr_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create partner_commissions table
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

-- 10. Create call_centre_agents table
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

-- 11. Create withdrawal_requests table
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

-- 12. Create admin_settings table (for various admin configurations)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Add missing columns to service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 14. Add missing columns to ecard_members  
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12, 2);
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.ecard_members ADD COLUMN IF NOT EXISTS emergency_phone TEXT;

-- 15. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON public.partner_commissions(partner_id);

-- 16. Insert default departments if not exists
INSERT INTO public.departments (id, name, description, is_active) 
SELECT uuid_generate_v4(), 'Customer Support', 'Handle customer queries and issues', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Customer Support');

INSERT INTO public.departments (id, name, description, is_active)
SELECT uuid_generate_v4(), 'Sales', 'Handle sales and inquiries', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Sales');

INSERT INTO public.departments (id, name, description, is_active)
SELECT uuid_generate_v4(), 'Claims', 'Handle reimbursement claims', true
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Claims');

-- 17. Insert default PHR categories if not exists
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

-- 18. Add read_at column to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

COMMIT;
