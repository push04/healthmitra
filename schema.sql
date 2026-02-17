-- HealthMitra Database Schema
-- Generated: 2026-02-14

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. USERS & AUTH (Extends Supabase Auth)
-------------------------------------------------------------------------------

-- Public Profiles (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- REFERENCES auth.users(id) ON DELETE CASCADE (Removed to allow Demo Seeding)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'franchise_owner', 'doctor', 'diagnostic_center', 'pharmacy')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Indexes for Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-------------------------------------------------------------------------------
-- 2. PLANS & E-CARDS
-------------------------------------------------------------------------------

-- Plans
CREATE TABLE public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER DEFAULT 365,
    features JSONB, -- Array of strings features
    coverage_amount DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER on_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- E-Card Members (Family members under a plan)
CREATE TABLE public.ecard_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- The main account holder
    plan_id UUID REFERENCES public.plans(id),
    
    member_id_code TEXT UNIQUE, -- e.g., HM-2025-001
    card_unique_id TEXT UNIQUE, -- e.g., HM-XK7P-9W2L
    
    full_name TEXT NOT NULL,
    relation TEXT NOT NULL, -- Self, Spouse, Son, Daughter, Father, Mother
    dob DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
    blood_group TEXT,
    photo_url TEXT,
    
    policy_number TEXT,
    valid_from DATE,
    valid_till DATE,
    
    contact_number TEXT,
    email TEXT,
    aadhaar_last4 TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'suspended')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER on_ecard_members_updated BEFORE UPDATE ON public.ecard_members FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE INDEX idx_ecard_members_user_id ON public.ecard_members(user_id);
CREATE INDEX idx_ecard_members_plan_id ON public.ecard_members(plan_id);
CREATE INDEX idx_ecard_members_status ON public.ecard_members(status);

-- RLS: E-Cards
ALTER TABLE public.ecard_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own members" 
ON public.ecard_members FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all members" 
ON public.ecard_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-------------------------------------------------------------------------------
-- 3. SERVICE REQUESTS
-------------------------------------------------------------------------------

CREATE TYPE request_type_enum AS ENUM ('medical_consultation', 'diagnostic', 'medicine', 'ambulance', 'caretaker', 'nursing', 'other');
CREATE TYPE request_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Service Requests
CREATE TABLE public.service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id_display TEXT UNIQUE NOT NULL, -- SR-2025-001
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.ecard_members(id) ON DELETE SET NULL, -- Who is this for?
    
    type request_type_enum NOT NULL,
    status request_status_enum DEFAULT 'pending',
    
    -- Flexible JSONB for request details (symptoms, test names, medicine lists, etc.)
    details JSONB NOT NULL DEFAULT '{}'::jsonb, 
    
    assigned_to UUID REFERENCES public.profiles(id), -- Admin/Vendor assigned
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER on_service_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE INDEX idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_assigned_to ON public.service_requests(assigned_to);

-- Request Timeline (Audit trail for requests)
CREATE TABLE public.request_timeline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- submitted, under_review, etc.
    label TEXT, -- User friendly text
    completed BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_timeline_request_id ON public.request_timeline(request_id);

-- Request Messages (Chat)
CREATE TABLE public.request_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id), -- User or Admin
    message TEXT NOT NULL,
    attachments JSONB, -- Array of URLs
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_messages_request_id ON public.request_messages(request_id);

-- RLS: Service Requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own requests" ON public.service_requests 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all requests" ON public.service_requests 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-------------------------------------------------------------------------------
-- 4. PHR (Personal Health Records)
-------------------------------------------------------------------------------

CREATE TABLE public.phr_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.ecard_members(id) ON DELETE SET NULL, -- Belongs to specific family member
    
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Prescriptions', 'Bills', 'Test Reports', 'General Records', 'Discharge Summaries', 'Vaccination Records')),
    file_type TEXT, -- pdf, jpg
    file_size TEXT,
    file_url TEXT NOT NULL,
    
    tags TEXT[],
    doctor_name TEXT,
    date_of_record DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_phr_user_id ON public.phr_documents(user_id);
CREATE INDEX idx_phr_category ON public.phr_documents(category);

-- RLS: PHR
ALTER TABLE public.phr_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own PHR" ON public.phr_documents FOR ALL USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 5. WALLET & REIMBURSEMENTS
-------------------------------------------------------------------------------

-- Wallet Transactions
CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    type TEXT CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    reference_id TEXT, -- Bank ref or Claim ID
    status TEXT CHECK (status IN ('success', 'pending', 'failed')),
    
    transaction_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_user_id ON public.wallet_transactions(user_id);

-- Reimbursement Claims
CREATE TABLE public.reimbursement_claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id_display TEXT UNIQUE NOT NULL, -- CLM-2025-001
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_member_id UUID REFERENCES public.ecard_members(id),
    
    claim_type TEXT CHECK (claim_type IN ('medicine', 'diagnostic', 'opd', 'hospitalization')),
    amount_requested DECIMAL(12, 2) NOT NULL,
    amount_approved DECIMAL(12, 2),
    
    hospital_name TEXT,
    treatment_date DATE,
    diagnosis TEXT,
    
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'approved', 'rejected', 'under-review')),
    
    documents JSONB, -- Array of file objects
    
    admin_comments TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER on_claims_updated BEFORE UPDATE ON public.reimbursement_claims FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE INDEX idx_claims_user_id ON public.reimbursement_claims(user_id);
CREATE INDEX idx_claims_status ON public.reimbursement_claims(status);

-- RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursement_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.wallet_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view own claims" ON public.reimbursement_claims FOR SELECT USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 6. FRANCHISES & PARTNERS
-------------------------------------------------------------------------------

CREATE TABLE public.franchises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_user_id UUID REFERENCES public.profiles(id), -- Link to a login
    
    franchise_name TEXT NOT NULL,
    code TEXT UNIQUE, -- REF-CODE
    
    contact_email TEXT,
    contact_phone TEXT,
    
    gst_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    
    commission_percentage DECIMAL(5, 2) DEFAULT 10.00,
    status TEXT DEFAULT 'active',
    verification_status TEXT DEFAULT 'unverified',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_franchises_code ON public.franchises(code);

CREATE TABLE public.franchise_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    
    partner_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    
    status TEXT DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_franchise_partners_franchise_id ON public.franchise_partners(franchise_id);

-------------------------------------------------------------------------------
-- 7. CMS & ADMIN
-------------------------------------------------------------------------------

CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_resource TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cms_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g., 'home_banner', 'faq_list'
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 8. LOCATIONS & COMMON
-------------------------------------------------------------------------------

CREATE TABLE public.cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    region TEXT, -- North, South, etc.
    pincodes TEXT[], -- Array of strings
    is_serviceable BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    service_centers JSONB, -- Array of objects {name, address, contact}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Public view cities" ON public.cities FOR SELECT USING (true);


-------------------------------------------------------------------------------
-- 9. NOTIFICATIONS & APPOINTMENTS (NEW)
-------------------------------------------------------------------------------

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    
    doctor_name TEXT,
    specialization TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    
    meeting_link TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER on_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 10. SYSTEM SETTINGS & PAYMENTS
-------------------------------------------------------------------------------

-- System Settings (Key-Value store for config)
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    is_secure BOOLEAN DEFAULT false, -- If true, value should not be sent to client freely
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- RLS: Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view all, update all
CREATE POLICY "Admins full access settings" ON public.system_settings 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Public can view non-secure settings
CREATE POLICY "Public view non-secure settings" ON public.system_settings 
FOR SELECT USING (is_secure = false);


-- Payments (Razorpay Integration)
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    purpose TEXT, -- plan_purchase, wallet_topup
    metadata JSONB, -- { plan_id: ..., details: ... }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON public.payments 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all payments" ON public.payments 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

