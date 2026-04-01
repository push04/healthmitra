// verify_migration.mjs
const URL  = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';
const H    = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const lines = [];
const log   = (s) => { lines.push(s); process.stdout.write(s + '\n'); };

async function countTable(table) {
  const res = await fetch(`${URL}/rest/v1/${table}?select=count`, {
    headers: { ...H, Prefer: 'count=exact', Range: '0-0' },
  });
  const count = res.headers.get('content-range')?.split('/')[1] ?? '?';
  const ok    = res.ok ? '[OK]' : '[FAIL]';
  return `${ok}  ${table.padEnd(25)} rows=${count}  (HTTP ${res.status})`;
}

async function main() {
  log('');
  log('=== HEALTHMITRA MIGRATION VERIFICATION ===');
  log('');

  // --- 1. Table existence ---
  log('-- Table Existence & Row Counts --');
  const tables = ['request_messages','withdrawal_requests','invoices','wallets','payments','coupons','system_settings'];
  for (const t of tables) log(await countTable(t));

  // --- 2. Column additions via RPC ---
  log('');
  log('-- Key Column Additions --');
  const checks = [
    { tbl:'plans',                cols:['status','type','is_featured','coverage_amount','image_url'] },
    { tbl:'notifications',        cols:['recipient_id','sender_id','is_read','action_url','priority','metadata'] },
    { tbl:'service_requests',     cols:['request_id_display','assigned_to','admin_notes','details'] },
    { tbl:'reimbursement_claims', cols:['claim_id_display','amount_approved','rejection_reason'] },
    { tbl:'phr_documents',        cols:['member_id','doctor_name','tags','file_type','file_size'] },
    { tbl:'audit_logs',           cols:['entity_type','target_resource','admin_id'] },
  ];

  for (const { tbl, cols } of checks) {
    // Query information_schema via a safe RPC or use pg_catalog
    const q = encodeURIComponent(cols.join(','));
    const res = await fetch(
      `${URL}/rest/v1/information_schema.columns?select=column_name&table_name=eq.${tbl}&column_name=in.(${cols.join(',')})`,
      { headers: H }
    );
    if (res.ok) {
      const data  = await res.json();
      const found = data.map(r => r.column_name);
      const miss  = cols.filter(c => !found.includes(c));
      log(miss.length === 0
        ? `[OK]  ${tbl}`
        : `[MISS] ${tbl} -- missing: ${miss.join(', ')}`);
    } else {
      log(`[SKIP] ${tbl} -- information_schema not accessible via REST (HTTP ${res.status})`);
    }
  }

  // --- 3. Default data ---
  log('');
  log('-- Default Data --');
  const ss = await fetch(`${URL}/rest/v1/system_settings?key=eq.razorpay_enabled&select=key,value`, { headers: H });
  if (ss.ok) {
    const d = await ss.json();
    log(d.length > 0
      ? `[OK]  system_settings.razorpay_enabled = "${d[0].value}"`
      : `[MISS] system_settings.razorpay_enabled row not found`);
  } else {
    log(`[FAIL] system_settings (HTTP ${ss.status})`);
  }

  log('');
  log('=== DONE ===');
}

main().catch(e => { process.stdout.write('ERROR: ' + e.message + '\n'); });
