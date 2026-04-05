-- ============================================================================
-- HealthMitra: PayPal Payment Gateway Settings
-- Run this in Supabase SQL Editor
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, is_secure)
VALUES ('paypal_enabled', 'false', 'Enable or disable PayPal payments', false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value, description, is_secure)
VALUES ('paypal_sandbox', 'false', 'Use PayPal sandbox (test) mode — false = LIVE', false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value, description, is_secure)
VALUES ('paypal_client_id', 'YOUR_PAYPAL_CLIENT_ID_HERE', 'PayPal Client ID', false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.system_settings (key, value, description, is_secure)
VALUES ('paypal_client_secret', 'YOUR_PAYPAL_CLIENT_SECRET_HERE', 'PayPal Client Secret', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- DONE! After running this SQL:
-- 1. Go to Admin → Settings → Payments → PayPal section
-- 2. Enable PayPal and set Sandbox mode ON (for testing)
-- 3. Click "Test Connection" to verify
-- 4. Save settings
-- ============================================================================
