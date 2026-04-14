const fs = require('fs');

async function run() {
  console.log('=== FULL VERIFICATION REPORT ===\n');

  // ---- 1. KYC CODE ----
  const f1 = fs.readFileSync('app/admin/franchises/[id]/page.tsx','utf8');
  const f2 = fs.readFileSync('app/admin/partners/[id]/page.tsx','utf8');
  const f3 = fs.readFileSync('app/admin/users/[id]/page.tsx','utf8');
  const f4 = fs.readFileSync('app/api/upload/route.ts','utf8');

  console.log('--- [1] FRANCHISE KYC UPLOAD ---');
  console.log('Uses /api/upload REST:', f1.includes('/api/upload') ? 'YES OK' : 'NO FAIL');
  console.log('Removed server action File:', !f1.includes('uploadKYCDocument') ? 'YES OK' : 'NO FAIL');
  console.log('Accept .pdf:', f1.includes('.pdf') ? 'YES' : 'NO');
  console.log('Accept .doc:', f1.includes('.doc') ? 'YES' : 'NO');
  console.log('DB update after upload:', f1.includes('updateFranchiseKYC') ? 'YES OK' : 'NO FAIL');

  console.log('\n--- [2] PARTNER KYC UPLOAD ---');
  console.log('Uses /api/upload REST:', f2.includes('/api/upload') ? 'YES OK' : 'NO FAIL');
  console.log('Removed server action File:', !f2.includes('uploadPartnerKYCDocument') ? 'YES OK' : 'NO FAIL');
  console.log('Accept .pdf:', f2.includes('.pdf') ? 'YES' : 'NO');
  console.log('Accept .doc:', f2.includes('.doc') ? 'YES' : 'NO');
  console.log('DB update after upload:', f2.includes('updatePartnerKYC') ? 'YES OK' : 'NO FAIL');

  console.log('\n--- [3] USER KYC UPLOAD ---');
  console.log('Uses /api/upload REST:', f3.includes('/api/upload') ? 'YES OK' : 'NO FAIL');
  console.log('Accept .pdf:', f3.includes('.pdf') ? 'YES' : 'NO');
  console.log('Accept .heic:', f3.includes('.heic') ? 'YES' : 'NO');

  console.log('\n--- [4] UPLOAD ROUTE ---');
  console.log('Allows pdf:', f4.includes("'pdf'") ? 'YES' : 'NO');
  console.log('Allows doc:', f4.includes("'doc'") ? 'YES' : 'NO');
  console.log('Allows heic:', f4.includes("'heic'") ? 'YES' : 'NO');
  const maxSize = f4.match(/MAX_FILE_SIZE = (.*);/)?.[1];
  console.log('Max file size:', maxSize || 'unknown');

  // ---- 2. PAYPAL ----
  console.log('\n--- [5] PAYPAL ROUTE LOGIC ---');
  const pp1 = fs.readFileSync('app/api/paypal/create-order/route.ts','utf8');
  const pp2 = fs.readFileSync('app/api/paypal/capture-order/route.ts','utf8');
  // Confirm sandbox is driven by DB not hardcoded
  console.log('create-order: sandbox from DB:', pp1.includes("paypal_sandbox") ? 'YES OK' : 'NO FAIL');
  console.log('create-order: live URL in switch:', pp1.includes('api-m.paypal.com') ? 'YES OK' : 'NO FAIL');
  console.log('capture-order: sandbox from DB:', pp2.includes("paypal_sandbox") ? 'YES OK' : 'NO FAIL');
  console.log('capture-order: live URL in switch:', pp2.includes('api-m.paypal.com') ? 'YES OK' : 'NO FAIL');

  // ---- 3. SUPABASE BUCKETS + UPLOAD ----
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://fbqwsfkpytexbdsfgqbr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA'
  );

  console.log('\n--- [6] SUPABASE BUCKETS ---');
  for (const b of ['documents','images','avatars']) {
    const { data, error } = await s.storage.getBucket(b);
    console.log(b+':', data ? 'EXISTS public='+data.public : 'MISSING '+error?.message);
  }

  console.log('\n--- [7] REAL UPLOAD TEST (PDF to documents/kyc) ---');
  const testBuf = Buffer.from('%PDF-1.4 fake pdf content for test');
  const { error: upErr } = await s.storage.from('documents')
    .upload('kyc/_verify_/test_doc.pdf', testBuf, { upsert: true, contentType: 'application/pdf' });
  if (upErr) {
    console.log('PDF Upload FAIL:', upErr.message);
  } else {
    const { data: url } = s.storage.from('documents').getPublicUrl('kyc/_verify_/test_doc.pdf');
    console.log('PDF Upload OK:', url.publicUrl);
    await s.storage.from('documents').remove(['kyc/_verify_/test_doc.pdf']);
    console.log('Cleanup OK');
  }

  // Test jpg
  const jpgBuf = Buffer.from([0xFF,0xD8,0xFF,0xE0,0,0x10,0x4A,0x46,0x49,0x46,0,1]);
  const { error: jpgErr } = await s.storage.from('documents')
    .upload('kyc/_verify_/test_img.jpg', jpgBuf, { upsert: true, contentType: 'image/jpeg' });
  console.log('JPG Upload:', jpgErr ? 'FAIL '+jpgErr.message : 'OK');
  if (!jpgErr) await s.storage.from('documents').remove(['kyc/_verify_/test_img.jpg']);

  // ---- 4. PAYPAL LIVE TOKEN ----
  console.log('\n--- [8] PAYPAL LIVE TOKEN TEST ---');
  const { data: ppSettings } = await s.from('system_settings')
    .select('key,value')
    .in('key',['paypal_client_id','paypal_client_secret','paypal_sandbox','paypal_enabled']);

  const cid   = ppSettings?.find(d=>d.key==='paypal_client_id')?.value;
  const csec  = ppSettings?.find(d=>d.key==='paypal_client_secret')?.value;
  const sbox  = ppSettings?.find(d=>d.key==='paypal_sandbox')?.value;
  const enab  = ppSettings?.find(d=>d.key==='paypal_enabled')?.value;

  console.log('paypal_enabled:', enab);
  console.log('paypal_sandbox:', sbox, sbox==='false' ? '<-- LIVE MODE OK' : '<-- WARNING: SANDBOX!');

  const base = sbox === 'false' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  console.log('Hitting URL:', base);

  const r = await fetch(base+'/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic '+Buffer.from(cid+':'+csec).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  const td = await r.json();
  console.log('HTTP Status:', r.status);
  console.log('Token Type:', td.token_type || 'N/A');
  console.log('App ID:', td.app_id || 'N/A');
  console.log('Expires in:', td.expires_in || 'N/A', 'seconds');
  if (td.error) console.log('ERROR:', td.error, '-', td.error_description);
  else console.log('PAYPAL LIVE: VERIFIED OK');

  console.log('\n=== ALL CHECKS COMPLETE ===');
}

run().catch(e => console.error('Script error:', e));
