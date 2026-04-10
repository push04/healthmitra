const https = require('https');

const SUPABASE_URL = 'fbqwsfkpytexbdsfgqbr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';

function postSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runSQL(sql) {
  const body = `query=${encodeURIComponent(sql)}`;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/pg.rpc.exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function queryTable(table, columns = '*') {
  return new Promise((resolve, reject) => {
    const encodedTable = encodeURIComponent(table);
    const encodedCols = encodeURIComponent(columns);
    const path = `/rest/v1/${encodedTable}?select=${encodedCols}&limit=10`;
    
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function insertInto(table, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function updateTable(table, id, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: `/rest/v1/${table}?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function deleteFrom(table, id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: `/rest/v1/${table}?id=eq.${id}`,
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyFixes() {
  console.log('=== SUPABASE DATABASE FIXES & VERIFICATION ===\n');

  // 1. Check if cities table exists and has data
  console.log('1. Checking Locations (cities) Table...');
  const citiesData = await queryTable('cities');
  
  if (Array.isArray(citiesData) && citiesData.length > 0) {
    console.log(`   SUCCESS: Found ${citiesData.length} cities`);
    citiesData.slice(0, 5).forEach(c => console.log(`     - ${c.name}, ${c.state}`));
  } else {
    console.log('   INFO: No cities found or table not accessible via REST API');
    console.log('   Note: You may need to run SQL in Supabase Dashboard');
  }

  // 2. Verify Notifications Table
  console.log('\n2. Checking Notifications Table...');
  const notificationsData = await queryTable('notifications', 'id, recipient_id, title, type, is_read, created_at');
  
  if (Array.isArray(notificationsData) && notificationsData.length > 0) {
    console.log(`   SUCCESS: Found ${notificationsData.length} notifications`);
    notificationsData.slice(0, 3).forEach(n => console.log(`     - "${n.title}" (${n.type}) - ${n.is_read ? 'Read' : 'Unread'}`));
  } else {
    console.log('   INFO: No notifications found');
  }

  // 3. Verify Profiles Table
  console.log('\n3. Checking Profiles Table...');
  const profilesData = await queryTable('profiles', 'id, email, full_name, role');
  
  if (Array.isArray(profilesData) && profilesData.length > 0) {
    console.log(`   SUCCESS: Found ${profilesData.length} profiles`);
    profilesData.slice(0, 3).forEach(p => console.log(`     - ${p.full_name || 'N/A'} (${p.role})`));
  } else {
    console.log('   ERROR: Could not access profiles');
  }

  // 4. Test Adding a City
  console.log('\n4. Testing Add City (Insert)...');
  const testCity = {
    name: 'Test City',
    state: 'Maharashtra',
    region: 'West',
    pincodes: ['411001', '411002'],
    is_serviceable: true,
    status: 'active',
    tier: 'Tier 2'
  };
  
  const insertResult = await insertInto('cities', testCity);
  console.log(`   Insert Result: Status ${insertResult.status}`);
  
  if (insertResult.status === 201) {
    console.log('   SUCCESS: City added successfully!');
    
    // Fetch the inserted city
    const newCities = await queryTable('cities');
    const addedCity = newCities.find(c => c.name === 'Test City');
    if (addedCity) {
      console.log(`   Added City ID: ${addedCity.id}`);
      
      // 5. Test Deleting the city
      console.log('\n5. Testing Delete City...');
      const deleteResult = await deleteFrom('cities', addedCity.id);
      console.log(`   Delete Result: Status ${deleteResult.status}`);
      console.log(deleteResult.status === 204 ? '   SUCCESS: City deleted!' : '   INFO: Delete status: ' + deleteResult.status);
    }
  } else {
    console.log(`   INFO: Insert returned status ${insertResult.status} - may need RLS policy fix`);
  }

  // 6. Test Adding a Notification
  console.log('\n6. Testing Send Notification...');
  if (profilesData && profilesData.length > 0) {
    const testNotif = {
      recipient_id: profilesData[0].id,
      sender_id: profilesData[0].id,
      title: 'Verification Test - ' + new Date().toISOString(),
      message: 'This notification was sent during system verification to test the notification system.',
      type: 'system',
      priority: 'normal',
      metadata: {},
      is_read: false
    };
    
    const notifResult = await insertInto('notifications', testNotif);
    console.log(`   Send Result: Status ${notifResult.status}`);
    console.log(notifResult.status === 201 ? '   SUCCESS: Notification sent!' : '   INFO: Notification insert status: ' + notifResult.status);
  }

  // 7. Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`
  FIXES APPLIED TO CODE:
  1. notifications.ts - Fixed sender join query (removed non-existent sender_id column)
  2. customers.ts - Changed INSERT to UPSERT for profile creation
  3. locations.ts - Changed to use 'cities' table (not 'public.cities') and createAdminClient

  DATABASE SCHEMA FIX NEEDED (run in Supabase SQL Editor):
  - Create/verify cities table exists with proper RLS policies
  - Run: sql/locations_fix.sql

  FILES READY:
  - sql/locations_fix.sql - Run this in Supabase SQL Editor
  `);

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyFixes().catch(console.error);
