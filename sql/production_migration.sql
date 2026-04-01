-- ============================================================================
-- HEALTHMITRA — PRODUCTION MIGRATION
-- Run this ONCE in Supabase SQL Editor before deploying.
-- Safe to re-run (all statements use IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- =====================
-- 1. PLANS TABLE — add missing columns
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='status') THEN
        ALTER TABLE plans ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE plans SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='type') THEN
        ALTER TABLE plans ADD COLUMN type VARCHAR(50) DEFAULT 'health';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='is_featured') THEN
        ALTER TABLE plans ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='coverage_amount') THEN
        ALTER TABLE plans ADD COLUMN coverage_amount DECIMAL(15,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='image_url') THEN
        ALTER TABLE plans ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- =====================
-- 2. NOTIFICATIONS TABLE — reconcile old user_id vs new recipient_id
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='recipient_id') THEN
        ALTER TABLE notifications ADD COLUMN recipient_id UUID;
        -- Copy existing user_id → recipient_id if user_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
            UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL;
        END IF;
        ALTER TABLE notifications ALTER COLUMN recipient_id SET NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='sender_id') THEN
        ALTER TABLE notifications ADD COLUMN sender_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='is_read') THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='action_label') THEN
        ALTER TABLE notifications ADD COLUMN action_label TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='priority') THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Users can update own read status" ON notifications;
CREATE POLICY "Users can update own read status" ON notifications
    FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications" ON notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- =====================
-- 3. SERVICE_REQUESTS TABLE — add missing columns
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='request_id_display') THEN
        ALTER TABLE service_requests ADD COLUMN request_id_display TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='type') THEN
        ALTER TABLE service_requests ADD COLUMN type VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='assigned_to') THEN
        ALTER TABLE service_requests ADD COLUMN assigned_to UUID REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='admin_notes') THEN
        ALTER TABLE service_requests ADD COLUMN admin_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='details') THEN
        ALTER TABLE service_requests ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================
-- 4. REQUEST_MESSAGES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS request_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_messages_request_id ON request_messages(request_id);
ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages for own requests" ON request_messages;
CREATE POLICY "Users can view messages for own requests" ON request_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM service_requests WHERE id = request_messages.request_id AND user_id = auth.uid())
        OR sender_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
DROP POLICY IF EXISTS "Authenticated users can post messages" ON request_messages;
CREATE POLICY "Authenticated users can post messages" ON request_messages
    FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- =====================
-- 5. WITHDRAWAL_REQUESTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
    bank_name VARCHAR(255),
    bank_account VARCHAR(100),
    ifsc_code VARCHAR(20),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- 6. REIMBURSEMENT_CLAIMS — add missing columns & admin policy
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reimbursement_claims' AND column_name='claim_id_display') THEN
        ALTER TABLE reimbursement_claims ADD COLUMN claim_id_display TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reimbursement_claims' AND column_name='amount_approved') THEN
        ALTER TABLE reimbursement_claims ADD COLUMN amount_approved DECIMAL(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reimbursement_claims' AND column_name='rejection_reason') THEN
        ALTER TABLE reimbursement_claims ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;
DROP POLICY IF EXISTS "Admins can manage all claims" ON reimbursement_claims;
CREATE POLICY "Admins can manage all claims" ON reimbursement_claims
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- 7. INVOICES TABLE — ensure all columns exist
-- =====================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID,
    invoice_number TEXT UNIQUE,
    plan_name TEXT,
    amount DECIMAL(12,2),
    gst DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2),
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
CREATE POLICY "Admins can manage all invoices" ON invoices
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Service can insert invoices" ON invoices;
CREATE POLICY "Service can insert invoices" ON invoices
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================
-- 8. WALLETS TABLE — ensure it exists
-- =====================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
CREATE POLICY "Users can update own wallet" ON wallets
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all wallets" ON wallets;
CREATE POLICY "Admins can manage all wallets" ON wallets
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- 9. PAYMENTS TABLE — ensure it exists
-- =====================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID,
    amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Service can insert payments" ON payments;
CREATE POLICY "Service can insert payments" ON payments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================
-- 10. PHR_DOCUMENTS — add missing columns
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='phr_documents' AND column_name='member_id') THEN
        ALTER TABLE phr_documents ADD COLUMN member_id UUID REFERENCES ecard_members(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='phr_documents' AND column_name='doctor_name') THEN
        ALTER TABLE phr_documents ADD COLUMN doctor_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='phr_documents' AND column_name='tags') THEN
        ALTER TABLE phr_documents ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='phr_documents' AND column_name='file_type') THEN
        ALTER TABLE phr_documents ADD COLUMN file_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='phr_documents' AND column_name='file_size') THEN
        ALTER TABLE phr_documents ADD COLUMN file_size TEXT;
    END IF;
END $$;

-- =====================
-- 11. AUDIT_LOGS — ensure columns match usage
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_type') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='target_resource') THEN
        ALTER TABLE audit_logs ADD COLUMN target_resource TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='admin_id') THEN
        ALTER TABLE audit_logs ADD COLUMN admin_id UUID REFERENCES profiles(id);
    END IF;
END $$;

-- =====================
-- 12. COUPONS TABLE — ensure all columns exist
-- =====================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
    discount_value DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
CREATE POLICY "Anyone can read active coupons" ON coupons
    FOR SELECT TO authenticated USING (is_active = true);

-- =====================
-- 13. SYSTEM_SETTINGS TABLE — ensure it exists
-- =====================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;
CREATE POLICY "Admins can manage settings" ON system_settings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Anyone can read settings" ON system_settings;
CREATE POLICY "Anyone can read settings" ON system_settings
    FOR SELECT TO authenticated USING (true);

-- Insert default Razorpay setting if not exists
INSERT INTO system_settings (key, value) VALUES ('razorpay_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

SELECT 'Production migration completed successfully' AS result;
