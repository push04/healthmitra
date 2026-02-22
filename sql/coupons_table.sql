-- ============================================================================
-- COUPONS TABLE FOR HEALTHMITRA
-- ============================================================================

-- Create coupons table if not exists
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Discount details
    discount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    
    -- Order requirements
    min_order_value NUMERIC(10,2),
    max_discount NUMERIC(10,2),
    
    -- Usage limits
    usage_limit INTEGER,
    uses_per_customer INTEGER DEFAULT 1,
    times_used INTEGER DEFAULT 0,
    
    -- Validity
    start_date DATE,
    expiry_date DATE,
    
    -- Targeting
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'new', 'existing')),
    applicable_plans TEXT DEFAULT 'all', -- 'all' or JSON array of plan IDs
    
    -- Settings
    is_exclusive BOOLEAN DEFAULT false,
    show_on_website BOOLEAN DEFAULT false,
    terms TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin full access to coupons" ON coupons FOR ALL USING (true);

-- Create index on code for fast lookups
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);

-- Insert a sample coupon if table is empty
INSERT INTO coupons (code, description, discount_type, discount_value, status, show_on_website)
SELECT 'WELCOME50', 'Get 50% off on your first purchase', 'percentage', 50, 'active', true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'WELCOME50');

SELECT 'Coupons table ready!' as message;
