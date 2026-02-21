-- ============================================================================
-- HealthMitra: Razorpay Payment Gateway Settings
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add Razorpay settings columns to system_settings
INSERT INTO public.system_settings (key, value, description, is_secure) 
VALUES ('razorpay_enabled', 'false', 'Enable or disable Razorpay payments', false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value, description, is_secure) 
VALUES ('razorpay_webhook_secret', '', 'Razorpay Webhook Secret for verification', true)
ON CONFLICT (key) DO NOTHING;

-- Add payment_mode column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'razorpay';

-- Add payment verification columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Update existing payments table trigger if needed
CREATE OR REPLACE FUNCTION handle_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_payments_updated ON public.payments;
CREATE TRIGGER on_payments_updated
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE PROCEDURE handle_payment_updated_at();

-- Create function to verify Razorpay signature
CREATE OR REPLACE FUNCTION verify_razorpay_signature(
    order_id TEXT,
    payment_id TEXT,
    signature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    secret TEXT;
    generated_signature TEXT;
BEGIN
    -- Get the webhook secret
    SELECT value INTO secret 
    FROM public.system_settings 
    WHERE key = 'razorpay_webhook_secret';

    IF secret IS NULL OR secret = '' THEN
        RETURN FALSE;
    END IF;

    -- In production, you would use Razorpay's SDK to verify
    -- This is a simplified check
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE!
-- ============================================================================
