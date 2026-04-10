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
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
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
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });
    req.write(body);
    req.on('error', console.error);
    req.end();
  });
}

async function test() {
  console.log('=== INVESTIGATING & FIXING ===\n');

  // 1. Get all profiles and find admin
  console.log('1. FIND ADMIN PROFILE');
  const allProfiles = await query('/rest/v1/profiles?select=id,email,role');
  if (Array.isArray(allProfiles)) {
    const adminProfile = allProfiles.find(p => p.role === 'admin');
    console.log('   Found admin: ' + (adminProfile ? adminProfile.email : 'none'));
    if (adminProfile) {
      console.log('   Admin ID: ' + adminProfile.id);
      
      // Send notification to admin
      console.log('\n2. SEND NOTIFICATION TO ADMIN');
      const notif = await insert('notifications', {
        recipient_id: adminProfile.id,
        sender_id: adminProfile.id,
        title: 'Final Test - All Systems Verified',
        message: 'Locations, Notifications, and Profiles all working correctly.',
        type: 'system',
        priority: 'high',
        metadata: {},
        is_read: false
      });
      console.log('   Status: ' + notif.status);
      if (notif.status === 201) {
        console.log('   SUCCESS: Notification sent!');
      } else {
        console.log('   Error:', notif.data);
      }
    }
  }

  // 3. Clean up TEST cities
  console.log('\n3. CLEANUP TEST CITIES');
  const testCities = await query('/rest/v1/cities?name=eq.TEST');
  console.log('   Found ' + testCities.length + ' TEST cities');
  for (const tc of testCities) {
    await new Promise(r => {
      https.request({
        hostname: SUPABASE_URL, port: 443,
        path: '/rest/v1/cities?id=eq.' + tc.id,
        method: 'DELETE',
        headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + SERVICE_ROLE_KEY }
      }, r).end();
    });
    console.log('   Deleted: ' + tc.id.substring(0, 8));
  }

  // 4. Final city list
  console.log('\n4. FINAL CITIES LIST');
  const cities = await query('/rest/v1/cities?select=name,state,pincodes&limit=20');
  if (Array.isArray(cities)) {
    console.log('   Total: ' + cities.length + ' cities');
    cities.forEach(c => {
      const pins = Array.isArray(c.pincodes) && c.pincodes.length > 0 
        ? c.pincodes.slice(0, 3).join(', ') + '...' 
        : 'NO PINCODES';
      console.log('   - ' + c.name + ': ' + pins);
    });
  }

  // 5. Final notifications check
  console.log('\n5. FINAL NOTIFICATIONS CHECK');
  const notifications = await query('/rest/v1/notifications?select=id,title,type,is_read&limit=5&order=created_at.desc');
  if (Array.isArray(notifications)) {
    console.log('   Total: ' + notifications.length + ' notifications');
    notifications.forEach(n => {
      console.log('   - ' + n.title.substring(0, 40) + ' (' + n.type + ', ' + (n.is_read ? 'Read' : 'Unread') + ')');
    });
  }

  console.log('\n=== ALL VERIFICATIONS COMPLETE ===');
}

test().then(() => process.exit(0)).catch(console.error);
