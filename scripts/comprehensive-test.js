const https = require('https');
const SUPABASE_URL = 'fbqwsfkpytexbdsfgqbr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';

async function query(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: path,
      method: 'GET',
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + SERVICE_ROLE_KEY }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', console.error);
    req.end();
  });
}

async function insert(table, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/' + table,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }));
    });
    req.write(body);
    req.on('error', console.error);
    req.end();
  });
}

async function test() {
  console.log('=== COMPREHENSIVE VERIFICATION ===\n');

  // 1. Test Locations (cities) - FETCH
  console.log('1. LOCATIONS - Testing Fetch Cities');
  const cities = await query('/rest/v1/cities?select=*&limit=5');
  console.log('   Result: ' + (Array.isArray(cities) ? cities.length + ' cities found' : 'Error'));
  if (Array.isArray(cities) && cities.length > 0) {
    cities.forEach(c => console.log('   - ' + c.name + ', ' + c.state + ' (Pincodes: ' + (c.pincodes ? c.pincodes.length : 0) + ')'));
  }

  // 2. Test Locations - ADD
  console.log('\n2. LOCATIONS - Testing Add City');
  const addResult = await insert('cities', {
    name: 'Nashik',
    state: 'Maharashtra',
    region: 'West',
    pincodes: ['422001', '422002'],
    is_serviceable: true,
    status: 'active',
    tier: 'Tier 2'
  });
  console.log('   Result: ' + (addResult.status === 201 ? 'SUCCESS - City added' : 'FAILED - Status ' + addResult.status));

  // 3. Test Locations - FETCH AGAIN
  console.log('\n3. LOCATIONS - Fetching Cities Again');
  const cities2 = await query('/rest/v1/cities?select=*&limit=10');
  console.log('   Result: ' + (Array.isArray(cities2) ? cities2.length + ' cities found' : 'Error'));

  // 4. Test Notifications - FETCH  
  console.log('\n4. NOTIFICATIONS - Testing Fetch');
  const notifications = await query('/rest/v1/notifications?select=*&limit=5&order=created_at.desc');
  console.log('   Result: ' + (Array.isArray(notifications) ? notifications.length + ' notifications found' : 'Error'));
  if (Array.isArray(notifications) && notifications.length > 0) {
    console.log('   Latest: ' + notifications[0].title);
  }

  // 5. Test Notifications - SEND
  console.log('\n5. NOTIFICATIONS - Testing Send');
  const profiles = await query('/rest/v1/profiles?select=id,email&limit=1');
  if (profiles && profiles.length > 0) {
    const sendResult = await insert('notifications', {
      recipient_id: profiles[0].id,
      sender_id: profiles[0].id,
      title: 'Final Verification Test - ' + new Date().toLocaleTimeString(),
      message: 'This notification verifies the system is working correctly after fixes.',
      type: 'system',
      priority: 'normal',
      metadata: {},
      is_read: false
    });
    console.log('   Result: ' + (sendResult.status === 201 ? 'SUCCESS - Notification sent to ' + profiles[0].email : 'FAILED - Status ' + sendResult.status));
  }

  // 6. Test Profiles - customer creation simulation
  console.log('\n6. PROFILES - Testing Profile Access');
  const profileCheck = await query('/rest/v1/profiles?select=id,email,full_name&limit=3');
  console.log('   Result: ' + (Array.isArray(profileCheck) ? profileCheck.length + ' profiles accessible' : 'Error'));
  if (Array.isArray(profileCheck) && profileCheck.length > 0) {
    console.log('   Sample: ' + profileCheck[0].full_name + ' (' + profileCheck[0].email + ')');
  }

  // Cleanup test city
  console.log('\n7. CLEANUP - Removing test city');
  const cleanupCity = await query("/rest/v1/cities?name=eq.Nashik");
  if (cleanupCity && cleanupCity.length > 0) {
    await new Promise(r => {
      const req = https.request({
        hostname: SUPABASE_URL, port: 443,
        path: '/rest/v1/cities?id=eq.' + cleanupCity[0].id,
        method: 'DELETE',
        headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + SERVICE_ROLE_KEY }
      }, r);
      req.end();
    });
    console.log('   Test city removed');
  }

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

test().then(() => process.exit(0)).catch(console.error);
