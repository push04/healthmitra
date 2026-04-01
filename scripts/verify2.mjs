// verify2.mjs - writes results to verify_results.json
import { writeFileSync } from 'fs';

const URL = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact', Range: '0-0' };

const tables = ['request_messages','withdrawal_requests','invoices','wallets','payments','coupons','system_settings'];

const results = await Promise.all(tables.map(async t => {
  const r = await fetch(`${URL}/rest/v1/${t}?select=count`, { headers: H });
  return { table: t, ok: r.ok, http: r.status, rows: r.headers.get('content-range')?.split('/')[1] ?? '?' };
}));

// system_settings check
const ss = await fetch(`${URL}/rest/v1/system_settings?key=eq.razorpay_enabled&select=key,value`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
});
const ssData = ss.ok ? await ss.json() : [];

const output = { tables: results, razorpay_default: ssData[0] ?? null };
writeFileSync('./scripts/verify_results.json', JSON.stringify(output, null, 2));
console.log('done');
