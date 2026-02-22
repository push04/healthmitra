-- ============================================================================
-- CRITICAL DATABASE FIXES
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE CITIES TABLE (for locations page)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cities') THEN
        CREATE TABLE cities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            region VARCHAR(20),
            pincodes JSONB DEFAULT '[]',
            is_serviceable BOOLEAN DEFAULT true,
            status VARCHAR(20) DEFAULT 'active',
            service_centers JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active cities" ON cities
            FOR SELECT TO authenticated USING (status = 'active');
            
        CREATE POLICY "Admins can manage cities" ON cities
            FOR ALL TO authenticated USING (true);
            
        -- Insert some sample cities
        INSERT INTO cities (name, state, region, pincodes, is_serviceable, status) VALUES
            ('Mumbai', 'Maharashtra', 'West', '["400001", "400002", "400003"]', true, 'active'),
            ('Delhi', 'Delhi', 'North', '["110001", "110002"]', true, 'active'),
            ('Bangalore', 'Karnataka', 'South', '["560001", "560002"]', true, 'active'),
            ('Chennai', 'Tamil Nadu', 'South', '["600001", "600002"]', true, 'active'),
            ('Kolkata', 'West Bengal', 'East', '["700001", "700002"]', true, 'active'),
            ('Hyderabad', 'Telangana', 'South', '["500001", "500002"]', true, 'active'),
            ('Pune', 'Maharashtra', 'West', '["411001", "411002"]', true, 'active'),
            ('Ahmedabad', 'Gujarat', 'West', '["380001", "380002"]', true, 'active'),
            ('Jaipur', 'Rajasthan', 'North', '["302001", "302002"]', true, 'active'),
            ('Lucknow', 'Uttar Pradesh', 'Central', '["226001", "226002"]', true, 'active');
    END IF;
END $$;

-- ============================================================================
-- 2. FIX WALLETS TABLE (add balance column if missing)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'balance') THEN
        ALTER TABLE wallets ADD COLUMN balance DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'currency') THEN
        ALTER TABLE wallets ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'user_id') THEN
        ALTER TABLE wallets ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE WALLETS IF NOT EXISTS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
        CREATE TABLE wallets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            balance DECIMAL(12,2) DEFAULT 0,
            currency VARCHAR(10) DEFAULT 'INR',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own wallet" ON wallets
            FOR SELECT TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;

-- ============================================================================
-- 4. FIX NOTIFICATIONS TABLE (ensure correct columns)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
            -- Rename user_id to recipient_id if needed
            ALTER TABLE notifications RENAME COLUMN user_id TO recipient_id;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 5. ENSURE REQUEST_MESSAGES TABLE EXISTS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'request_messages') THEN
        CREATE TABLE request_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            request_id UUID NOT NULL,
            sender_id UUID,
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view request messages" ON request_messages
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- VERIFY TABLES
-- ============================================================================

SELECT 'Cities table rows:' as info, COUNT(*) as count FROM cities
UNION ALL
SELECT 'Wallets table rows:', COUNT(*) FROM wallets
UNION ALL
SELECT 'Notifications table rows:', COUNT(*) FROM notifications
UNION ALL
SELECT 'Request Messages table rows:', COUNT(*) FROM request_messages;
