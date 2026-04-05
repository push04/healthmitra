import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID_HERE';
const PAYPAL_CLIENT_SECRET = 'YOUR_PAYPAL_CLIENT_SECRET_HERE';

async function pushPaypalSettings() {
    console.log('Pushing PayPal settings to Supabase...');

    const settings = [
        { key: 'paypal_enabled', value: 'true', description: 'Enable PayPal payments', is_secure: false },
        { key: 'paypal_sandbox', value: 'true', description: 'PayPal sandbox mode (test)', is_secure: false },
        { key: 'paypal_client_id', value: PAYPAL_CLIENT_ID, description: 'PayPal Client ID', is_secure: false },
        { key: 'paypal_client_secret', value: PAYPAL_CLIENT_SECRET, description: 'PayPal Client Secret', is_secure: true },
    ];

    for (const setting of settings) {
        const { error } = await supabase
            .from('system_settings')
            .upsert(setting, { onConflict: 'key' });

        if (error) {
            console.error(`  FAILED: ${setting.key} — ${error.message}`);
        } else {
            console.log(`  OK: ${setting.key}`);
        }
    }

    // Verify
    const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['paypal_enabled', 'paypal_sandbox', 'paypal_client_id', 'paypal_client_secret']);

    if (error) {
        console.error('Verification failed:', error.message);
        return;
    }

    console.log('\n--- Verification ---');
    data.forEach(row => {
        const display = row.key === 'paypal_client_secret'
            ? row.value?.slice(0, 8) + '***'
            : row.key === 'paypal_client_id'
            ? row.value?.slice(0, 12) + '...'
            : row.value;
        console.log(`  ${row.key}: ${display}`);
    });

    // Test PayPal API connection
    console.log('\n--- Testing PayPal API Connection ---');
    try {
        const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        const tokenData = await res.json();
        if (tokenData.access_token) {
            console.log('  PayPal Auth: SUCCESS — got access token');
            console.log('  Token type:', tokenData.token_type);
            console.log('  Expires in:', tokenData.expires_in, 'seconds');

            // Test create an order
            const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{ amount: { currency_code: 'USD', value: '1.00' } }],
                }),
            });
            const orderData = await orderRes.json();
            if (orderData.id) {
                console.log('  Create Order: SUCCESS — order ID:', orderData.id);
                console.log('  Status:', orderData.status);
                console.log('\n  PayPal is fully working!');
            } else {
                console.log('  Create Order: FAILED —', JSON.stringify(orderData));
            }
        } else {
            console.error('  PayPal Auth: FAILED —', tokenData.error_description || JSON.stringify(tokenData));
        }
    } catch (e) {
        console.error('  PayPal API test error:', e.message);
    }

    console.log('\nDone!');
}

pushPaypalSettings();
