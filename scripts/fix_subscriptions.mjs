import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run(label, sql) {
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: { message: 'rpc not available' } }));
    if (error) {
        // fallback: use raw query via REST
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ sql }),
        });
        const text = await res.text();
        if (!res.ok) {
            console.error(`  FAIL [${label}]:`, text.slice(0, 200));
            return false;
        }
    }
    console.log(`  OK: ${label}`);
    return true;
}

async function directQuery(label, sql) {
    // Use pg directly via Supabase management API isn't available without extra creds
    // Instead use the supabase client with service role to run DDL via raw SQL endpoint
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
    // We'll use the postgres function approach
    const { data, error } = await supabase.from('_sql_exec_dummy').select('*').limit(1);
    // Actually let's just use direct fetch to the SQL endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/pg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`  FAIL [${label}]:`, text.slice(0, 300));
        return false;
    }
    console.log(`  OK: ${label}`);
    return true;
}

// Use the Supabase SQL editor approach via service role
async function sql(label, query) {
    try {
        // Try using rpc with a postgres function if it exists
        const { error } = await supabase.rpc('run_sql', { query });
        if (!error) { console.log(`  OK: ${label}`); return true; }
    } catch {}

    // Direct REST endpoint for SQL (Supabase exposes this)
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ q: query }),
        });
        if (res.ok) { console.log(`  OK: ${label}`); return true; }
    } catch {}

    // Last resort: use supabase-js to run a select that executes DDL via pg_catalog
    console.warn(`  SKIP [${label}]: Cannot run DDL directly — add to migration SQL file`);
    return false;
}

// Verify current state
async function verify() {
    console.log('\n=== VERIFYING CURRENT DATABASE STATE ===\n');

    // Check invoices columns
    const { data: invoiceCols } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'invoices')
        .eq('table_schema', 'public');

    // Use raw query instead
    const invRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/invoices?limit=0`, {
        headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=representation',
        }
    });
    console.log('invoices table status:', invRes.status, invRes.statusText);

    // Check payments columns
    const payRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/payments?limit=0`, {
        headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        }
    });
    console.log('payments table status:', payRes.status, payRes.statusText);

    // Check ecard_members
    const ecRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ecard_members?limit=0`, {
        headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        }
    });
    console.log('ecard_members table status:', ecRes.status, ecRes.statusText);

    // Try insert into payments to see exact error
    const { error: payErr } = await supabase.from('payments').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: 1,
        currency: 'INR',
        status: 'captured',
        payment_method: 'test',
    });
    if (payErr) console.log('payments INSERT error:', payErr.code, payErr.message);
    else console.log('payments INSERT: OK (unexpected — cleanup needed)');

    // Try insert into invoices
    const { error: invErr } = await supabase.from('invoices').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        invoice_number: 'TEST-0',
        amount: 1,
        status: 'paid',
    });
    if (invErr) console.log('invoices INSERT error:', invErr.code, invErr.message);
    else console.log('invoices INSERT: OK (cleanup needed)');

    // Check plans
    const { data: plans, error: planErr } = await supabase.from('plans').select('id,name,price').limit(3);
    if (planErr) console.log('plans SELECT error:', planErr.message);
    else console.log('plans SELECT OK — count:', plans?.length, 'sample:', plans?.[0]?.name);

    // Check RLS on profiles
    const { error: profErr } = await supabase.from('profiles').select('id').limit(1);
    if (profErr) console.log('profiles SELECT error:', profErr.message);
    else console.log('profiles SELECT: OK');
}

verify();
