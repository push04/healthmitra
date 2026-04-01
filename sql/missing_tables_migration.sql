-- ============================================================================
-- MISSING TABLES MIGRATION
-- Run this in your Supabase SQL Editor to add tables referenced in code
-- but not yet present in the database.
-- ============================================================================

-- =====================
-- 1. WITHDRAWAL REQUESTS TABLE
-- (Used by app/actions/withdrawals.ts)
-- =====================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
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
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin')));

-- =====================
-- 2. NOTIFICATIONS TABLE RECONCILIATION
-- The old schema.sql created notifications with user_id + old type values.
-- The new notifications.sql uses recipient_id + new type values.
-- This migration upgrades the table to the new structure if needed.
-- =====================

-- Add recipient_id column if missing (maps from user_id)
DO $$
BEGIN
    -- Add recipient_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN recipient_id UUID;
        -- Copy existing user_id values to recipient_id
        UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL;
        ALTER TABLE notifications ALTER COLUMN recipient_id SET NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
    END IF;

    -- Add sender_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'sender_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN sender_id UUID;
    END IF;

    -- Add is_read column if missing (old schema used 'read')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT false;
        -- Migrate old 'read' column data if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'notifications' AND column_name = 'read'
        ) THEN
            UPDATE notifications SET is_read = read WHERE is_read IS NULL;
        END IF;
    END IF;

    -- Add read_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add action_url if missing (old schema used action_link)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'action_url'
    ) THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'notifications' AND column_name = 'action_link'
        ) THEN
            UPDATE notifications SET action_url = action_link WHERE action_url IS NULL;
        END IF;
    END IF;

    -- Add action_label if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'action_label'
    ) THEN
        ALTER TABLE notifications ADD COLUMN action_label TEXT;
    END IF;

    -- Add priority if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'priority'
    ) THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;

    -- Add metadata if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update RLS policies for notifications to use recipient_id
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can update own read status" ON notifications;
CREATE POLICY "Users can update own read status" ON notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = recipient_id);

-- =====================
-- 3. ADD MISSING COLUMNS TO PLANS TABLE
-- (plans.ts expects status, type, is_featured — old schema.sql only has is_active)
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'status'
    ) THEN
        ALTER TABLE plans ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        -- Migrate is_active -> status
        UPDATE plans SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END
        WHERE status IS NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'type'
    ) THEN
        ALTER TABLE plans ADD COLUMN type VARCHAR(50) DEFAULT 'health';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE plans ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================
-- 4. ADD MISSING COLUMNS TO SERVICE_REQUESTS TABLE
-- (support.ts expects request_id_display column)
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_requests' AND column_name = 'request_id_display'
    ) THEN
        ALTER TABLE service_requests ADD COLUMN request_id_display TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_requests' AND column_name = 'type'
    ) THEN
        ALTER TABLE service_requests ADD COLUMN type VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_requests' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE service_requests ADD COLUMN assigned_to UUID REFERENCES profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_requests' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE service_requests ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- =====================
-- 5. REQUEST_MESSAGES TABLE
-- (Used by support.ts getRequestThread / postReply)
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
        EXISTS (
            SELECT 1 FROM service_requests
            WHERE id = request_messages.request_id AND user_id = auth.uid()
        )
        OR sender_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin'))
    );

DROP POLICY IF EXISTS "Authenticated users can post messages" ON request_messages;
CREATE POLICY "Authenticated users can post messages" ON request_messages
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- =====================
-- 6. REIMBURSEMENT CLAIMS — add missing columns
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reimbursement_claims' AND column_name = 'claim_id_display'
    ) THEN
        ALTER TABLE reimbursement_claims ADD COLUMN claim_id_display TEXT;
    END IF;

    -- Add admin policy for reimbursement_claims
    DROP POLICY IF EXISTS "Admins can manage all claims" ON reimbursement_claims;
    CREATE POLICY "Admins can manage all claims" ON reimbursement_claims
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin')));
END $$;

SELECT 'Migration completed successfully' AS result;
