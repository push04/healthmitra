-- ============================================================================
-- HealthMitra: Complete Admin CMS & Settings Management
-- Run this in Supabase SQL Editor
-- ============================================================================

-- First, add missing columns to cms_content
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- ============================================================================
-- 1. CMS CONTENT - Enable full CRUD for all static content
-- ============================================================================

-- Insert default FAQ categories and questions if not exist
INSERT INTO public.cms_content (key, value, status, display_order) VALUES
('faq_general_1', '{"q":"What is HealthMitra?","a":"HealthMitra is a comprehensive healthcare platform providing health plans, doctor consultations, medicine delivery, and emergency services.","category":"General"}', 'active', 1),
('faq_general_2', '{"q":"How do I enroll?","a":"Simply choose a plan that suits your needs, add family members, and complete the payment.","category":"General"}', 'active', 2),
('faq_general_3', '{"q":"Is there a waiting period?","a":"No waiting period for OPD services. Hospitalization claims have a 30-day initial waiting period.","category":"General"}', 'active', 3),
('faq_plans_1', '{"q":"What health plans do you offer?","a":"We offer Basic, Family, and Premium plans with different coverage levels.","category":"Health Plans"}', 'active', 1),
('faq_plans_2', '{"q":"Can I add family members?","a":"Yes! Family and Premium plans allow adding up to 4-6 members.","category":"Health Plans"}', 'active', 2),
('faq_payment_1', '{"q":"What payment methods are accepted?","a":"We accept all major credit/debit cards, UPI, net banking, and wallet payments.","category":"Payments"}', 'active', 1)
ON CONFLICT (key) DO NOTHING;

-- Insert default testimonials
INSERT INTO public.cms_content (key, value, status, display_order) VALUES
('testimonial_1', '{"name":"Rajesh Kumar","role":"Delhi","text":"HealthMitra has been a blessing for my family. The emergency support is excellent!","rating":5}', 'active', 1),
('testimonial_2', '{"name":"Priya Sharma","role":"Mumbai","text":"Very convenient doctor consultations from home.","rating":5}', 'active', 2),
('testimonial_3', '{"name":"Anil Gupta","role":"Bangalore","text":"Best healthcare investment for our family.","rating":5}', 'active', 3)
ON CONFLICT (key) DO NOTHING;

-- Insert default homepage sections
INSERT INTO public.cms_content (key, value, status, display_order) VALUES
('homepage_hero_title', '{"en":"Complete Healthcare for Your Family"}', 'active', 1),
('homepage_hero_subtitle', '{"en":"Comprehensive health plans with doctor consultations, medicine delivery, and personalized care."}', 'active', 2),
('homepage_cta_text', '{"en":"Get Started"}', 'active', 3)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. SYSTEM SETTINGS - Add all settings keys
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, is_secure) VALUES
('site_name', 'HealthMitra', 'Website name', false),
('site_tagline', 'Your Trusted Healthcare Partner', 'Website tagline', false),
('support_email', 'support@healthmitra.com', 'Support email address', false),
('support_phone', '1800-123-4567', 'Toll-free support number', false),
('contact_address', '123 Healthcare Ave, Mumbai, India', 'Company address', false),
('facebook_url', 'https://facebook.com/healthmitra', 'Facebook page URL', false),
('twitter_url', 'https://twitter.com/healthmitra', 'Twitter page URL', false),
('instagram_url', 'https://instagram.com/healthmitra', 'Instagram page URL', false),
('youtube_url', 'https://youtube.com/healthmitra', 'YouTube channel URL', false),
('smtp_host', '', 'SMTP host for emails', false),
('smtp_port', '587', 'SMTP port', false),
('smtp_user', '', 'SMTP username', false),
('smtp_password', '', 'SMTP password', true),
('email_from_name', 'HealthMitra', 'Email sender name', false),
('email_from_address', 'noreply@healthmitra.com', 'Email sender address', false),
('timezone', 'Asia/Kolkata', 'Website timezone', false),
('date_format', 'DD/MM/YYYY', 'Date display format', false),
('currency_symbol', '₹', 'Currency symbol', false),
('currency_code', 'INR', 'Currency code', false),
('min_withdrawal_amount', '500', 'Minimum wallet withdrawal amount', false),
('max_withdrawal_amount', '50000', 'Maximum wallet withdrawal amount', false),
('referral_bonus', '500', 'Referral bonus amount', false),
('referral_discount', '10', 'Referral discount percentage', false),
('default_plan_validity', '365', 'Default plan validity in days', false),
('max_family_members_basic', '2', 'Max family members for Basic plan', false),
('max_family_members_family', '4', 'Max family members for Family plan', false),
('max_family_members_premium', '6', 'Max family members for Premium plan', false),
('opd_consultation_limit_basic', '12', 'OPD consultations for Basic plan', false),
('opd_consultation_limit_family', '24', 'OPD consultations for Family plan', false),
('opd_consultation_limit_premium', 'Unlimited', 'OPD consultations for Premium plan', false),
('medicine_discount_basic', '10', 'Medicine discount for Basic plan %', false),
('medicine_discount_family', '15', 'Medicine discount for Family plan %', false),
('medicine_discount_premium', '20', 'Medicine discount for Premium plan %', false),
('emergency_hotline', '102', 'Emergency ambulance number', false),
('whatsapp_number', '919876543210', 'WhatsApp contact number', false),
('enable_registration', 'true', 'Allow new user registration', false),
('enable_referral', 'true', 'Enable referral system', false),
('maintenance_mode', 'false', 'Put site in maintenance mode', false),
('maintenance_message', 'We are under maintenance. Will be back soon.', 'Maintenance mode message', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 3. RAZORPAY SETTINGS
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, is_secure) VALUES
('razorpay_enabled', 'false', 'Enable Razorpay payments', false),
('razorpay_key_id', '', 'Razorpay Key ID', false),
('razorpay_key_secret', '', 'Razorpay Secret Key', true),
('razorpay_webhook_secret', '', 'Razorpay Webhook Secret', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 4. SERVICE REQUEST TYPES
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, is_secure) VALUES
('service_types', 'medical_consultation,diagnostic,medicine,ambulance,caretaker,nursing,other', 'Available service request types', false),
('claim_types', 'Medicine,Diagnostic Test,OPD Consultation,Hospitalization', 'Available claim types', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 5. AUDIT LOGS - Ensure table exists with proper structure
-- ============================================================================

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

-- Create policies for audit_logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins view audit logs') THEN
        CREATE POLICY "Admins view audit logs" ON public.audit_logs
        FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users view own audit logs') THEN
        CREATE POLICY "Users view own audit logs" ON public.audit_logs
        FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Authenticated users can log') THEN
        CREATE POLICY "Authenticated users can log" ON public.audit_logs
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- ============================================================================
-- 6. NOTIFICATIONS - Ensure table has all required columns
-- ============================================================================

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- ============================================================================
-- 7. PLAN CATEGORIES - Create table if not exists and add default categories
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

ALTER TABLE public.plan_categories ENABLE ROW LEVEL SECURITY;

INSERT INTO public.plan_categories (name, description, icon, status, display_order) VALUES
('Health Insurance', 'Comprehensive health insurance plans', 'shield', 'active', 1),
('Family Plans', 'Family health coverage', 'users', 'active', 2),
('Senior Care', 'Specialized senior citizen plans', 'heart', 'active', 3),
('Critical Illness', 'Critical illness coverage', 'alert-triangle', 'active', 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. CITIES - Add sample cities if empty (without display_order)
-- ============================================================================

INSERT INTO public.cities (name, state, is_serviceable, status) VALUES
('Mumbai', 'Maharashtra', true, 'active'),
('Delhi', 'Delhi', true, 'active'),
('Bangalore', 'Karnataka', true, 'active'),
('Chennai', 'Tamil Nadu', true, 'active'),
('Hyderabad', 'Telangana', true, 'active'),
('Kolkata', 'West Bengal', true, 'active'),
('Pune', 'Maharashtra', true, 'active'),
('Ahmedabad', 'Gujarat', true, 'active'),
('Jaipur', 'Rajasthan', true, 'active'),
('Chandigarh', 'Punjab', true, 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. WALLETS - Ensure table exists
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
-- 10. PAYMENTS - Add payment_mode column
-- ============================================================================

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'razorpay';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Admin CMS & Settings SQL completed successfully!' as result;
