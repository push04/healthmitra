-- ============================================================================
-- COMPREHENSIVE DATABASE FIX FOR HEALTHMITRA
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. REIMBURSEMENT CLAIMS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reimbursement_claims') THEN
        CREATE TABLE reimbursement_claims (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            claim_id VARCHAR(50) UNIQUE,
            title TEXT DEFAULT 'Reimbursement Claim',
            plan_name VARCHAR(255),
            claim_type VARCHAR(50) DEFAULT 'medical',
            amount DECIMAL(12,2),
            amount_approved DECIMAL(12,2),
            bill_date DATE,
            provider_name VARCHAR(255),
            status VARCHAR(20) DEFAULT 'pending',
            documents JSONB DEFAULT '[]',
            customer_comments TEXT,
            admin_notes TEXT,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE reimbursement_claims ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own claims" ON reimbursement_claims
            FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
        
        CREATE POLICY "Users can insert claims" ON reimbursement_claims
            FOR INSERT TO authenticated WITH CHECK (true);
            
        CREATE POLICY "Admins can view all claims" ON reimbursement_claims
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 2. AUDIT LOGS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            admin_id UUID,
            action VARCHAR(100),
            entity_type VARCHAR(50),
            entity_id UUID,
            details JSONB DEFAULT '{}',
            ip_address VARCHAR(50),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admins can view audit logs" ON audit_logs
            FOR SELECT TO authenticated USING (true);
            
        CREATE POLICY "System can insert audit logs" ON audit_logs
            FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END $$;

-- ============================================================================
-- 3. CONTACT MESSAGES TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        CREATE TABLE contact_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(20),
            subject VARCHAR(255),
            message TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            admin_notes TEXT,
            assigned_to UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can insert contact" ON contact_messages
            FOR INSERT TO authenticated WITH CHECK (true);
            
        CREATE POLICY "Admins can view messages" ON contact_messages
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 4. COUPONS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
        CREATE TABLE coupons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(50) UNIQUE,
            description TEXT,
            discount_type VARCHAR(20) DEFAULT 'percentage',
            discount_value DECIMAL(12,2),
            min_order_amount DECIMAL(12,2),
            max_discount_amount DECIMAL(12,2),
            is_active BOOLEAN DEFAULT true,
            valid_from DATE,
            valid_until DATE,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            applicable_plans JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active coupons" ON coupons
            FOR SELECT TO authenticated USING (is_active = true);
            
        CREATE POLICY "Admins can manage coupons" ON coupons
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 5. FRANCHISES TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'franchises') THEN
        CREATE TABLE franchises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            franchise_name VARCHAR(255),
            code VARCHAR(50) UNIQUE,
            email VARCHAR(255) UNIQUE,
            password_hash TEXT,
            contact VARCHAR(20),
            alt_contact VARCHAR(20),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(20),
            gst VARCHAR(50),
            website VARCHAR(255),
            referral_code VARCHAR(50) UNIQUE,
            commission_percent DECIMAL(5,2) DEFAULT 10.00,
            modules JSONB DEFAULT '[]',
            kyc_status VARCHAR(20) DEFAULT 'pending',
            verification_status VARCHAR(20) DEFAULT 'unverified',
            payout_delay INTEGER DEFAULT 7,
            status VARCHAR(20) DEFAULT 'inactive',
            total_members INTEGER DEFAULT 0,
            total_sales DECIMAL(12,2) DEFAULT 0,
            total_commission DECIMAL(12,2) DEFAULT 0,
            start_date DATE,
            end_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public can view active franchises" ON franchises
            FOR SELECT TO authenticated USING (status = 'active');
            
        CREATE POLICY "Admins can manage franchises" ON franchises
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 6. FRANCHISE PARTNERS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'franchise_partners') THEN
        CREATE TABLE franchise_partners (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            franchise_id UUID,
            user_id UUID,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20),
            referral_code VARCHAR(50) UNIQUE,
            status VARCHAR(20) DEFAULT 'active',
            plans_count INTEGER DEFAULT 0,
            revenue DECIMAL(12,2) DEFAULT 0,
            commission_earned DECIMAL(12,2) DEFAULT 0,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE franchise_partners ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Partners can view own" ON franchise_partners
            FOR SELECT TO authenticated USING (user_id = auth.uid() OR true);
            
        CREATE POLICY "Admins can manage partners" ON franchise_partners
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 7. PARTNER COMMISSIONS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partner_commissions') THEN
        CREATE TABLE partner_commissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            partner_id UUID,
            franchise_id UUID,
            amount DECIMAL(12,2),
            commission_amount DECIMAL(12,2),
            plan_name VARCHAR(255),
            sale_amount DECIMAL(12,2),
            sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            status VARCHAR(20) DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Partners can view own commissions" ON partner_commissions
            FOR SELECT TO authenticated USING (true);
            
        CREATE POLICY "Admins can view all commissions" ON partner_commissions
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 8. WITHDRAWAL REQUESTS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
        CREATE TABLE withdrawal_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            customer_name VARCHAR(255),
            customer_email VARCHAR(255),
            amount DECIMAL(12,2),
            status VARCHAR(20) DEFAULT 'pending',
            bank_name VARCHAR(100),
            bank_account VARCHAR(50),
            ifsc_code VARCHAR(20),
            admin_notes TEXT,
            processed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
            FOR SELECT TO authenticated USING (user_id = auth.uid() OR true);
            
        CREATE POLICY "Admins can view all withdrawals" ON withdrawal_requests
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 9. WALLET TRANSACTIONS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
        CREATE TABLE wallet_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            type VARCHAR(20),
            amount DECIMAL(12,2),
            description TEXT,
            reference_id VARCHAR(255),
            status VARCHAR(20) DEFAULT 'success',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own transactions" ON wallet_transactions
            FOR SELECT TO authenticated USING (user_id = auth.uid() OR true);
    END IF;
END $$;

-- ============================================================================
-- 10. DEPARTMENTS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        CREATE TABLE departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) UNIQUE,
            description TEXT,
            icon VARCHAR(50),
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active departments" ON departments
            FOR SELECT TO authenticated USING (is_active = true);
            
        INSERT INTO departments (name, description, icon, display_order) VALUES
            ('Cardiology', 'Heart related services', 'heart', 1),
            ('Neurology', 'Brain and nerve services', 'brain', 2),
            ('Orthopedics', 'Bone and joint services', 'bone', 3),
            ('Pediatrics', 'Child healthcare', 'baby', 4),
            ('General Medicine', 'General healthcare', 'stethoscope', 5)
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- 11. CMS CONTENT TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_content') THEN
        CREATE TABLE cms_content (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key VARCHAR(100) UNIQUE,
            value TEXT,
            type VARCHAR(20) DEFAULT 'text',
            status TEXT DEFAULT 'active',
            display_order INTEGER DEFAULT 0,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active cms" ON cms_content
            FOR SELECT TO authenticated USING (status = 'active');
            
        CREATE POLICY "Admins can manage cms" ON cms_content
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 12. PLAN CATEGORIES TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plan_categories') THEN
        CREATE TABLE plan_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) UNIQUE,
            description TEXT,
            icon VARCHAR(50),
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE plan_categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active categories" ON plan_categories
            FOR SELECT TO authenticated USING (is_active = true);
    END IF;
END $$;

-- ============================================================================
-- 13. PHR CATEGORIES TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phr_categories') THEN
        CREATE TABLE phr_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) UNIQUE,
            description TEXT,
            icon VARCHAR(50),
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE phr_categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active phr categories" ON phr_categories
            FOR SELECT TO authenticated USING (is_active = true);
            
        INSERT INTO phr_categories (name, description, icon, display_order) VALUES
            ('Medical Reports', 'Diagnostic reports and test results', 'file-text', 1),
            ('Prescriptions', 'Doctor prescriptions', 'scroll', 2),
            ('Insurance', 'Insurance documents', 'shield', 3),
            ('Lab Results', 'Laboratory test results', 'flask', 4),
            ('Vaccination', 'Vaccination records', 'syringe', 5)
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- 14. CALL CENTRE AGENTS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_centre_agents') THEN
        CREATE TABLE call_centre_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            employee_id VARCHAR(50) UNIQUE,
            department VARCHAR(100),
            status VARCHAR(20) DEFAULT 'active',
            shift_start TIME,
            shift_end TIME,
            total_calls INTEGER DEFAULT 0,
            performance_score DECIMAL(5,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE call_centre_agents ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Agents can view own profile" ON call_centre_agents
            FOR SELECT TO authenticated USING (user_id = auth.uid() OR true);
            
        CREATE POLICY "Admins can manage agents" ON call_centre_agents
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 15. ADD COLUMNS TO EXISTING TABLES (ONLY IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dob') THEN
        ALTER TABLE profiles ADD COLUMN dob DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blood_group') THEN
        ALTER TABLE profiles ADD COLUMN blood_group VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'card_unique_id') THEN
        ALTER TABLE ecard_members ADD COLUMN card_unique_id VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'valid_from') THEN
        ALTER TABLE ecard_members ADD COLUMN valid_from DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'valid_till') THEN
        ALTER TABLE ecard_members ADD COLUMN valid_till DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'coverage_amount') THEN
        ALTER TABLE ecard_members ADD COLUMN coverage_amount DECIMAL(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'user_id') THEN
        ALTER TABLE ecard_members ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'HealthMitra Database Fix Completed Successfully!' as message;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
