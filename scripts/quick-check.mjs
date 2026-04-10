import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'db.fbqwsfkpytexbdsfgqbr.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Pushpal2004',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    await client.connect();
    
    console.log('=== FRANCHISE KYC COLUMNS ===');
    const res = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'franchises' 
        AND column_name IN ('aadhaar_number', 'aadhaar_front', 'aadhaar_back', 'pan_number', 'pan_card', 'photo', 'kyc_status', 'kyc_history', 'verification_status', 'verified_at', 'verified_by', 'rejection_reason')
    `);
    console.log('Columns:', res.rows.map(r => r.column_name).join(', ') || 'NONE');
    
    console.log('\n=== CMS CONTENT ===');
    const cms = await client.query('SELECT key FROM cms_content');
    console.log('Rows:', cms.rows.length);
    cms.rows.forEach(r => console.log('  -', r.key));
    
    console.log('\n=== CALL CENTRE AGENTS ===');
    const agents = await client.query('SELECT COUNT(*) FROM call_centre_agents');
    console.log('Count:', agents.rows[0].count);
    
    console.log('\n=== CITIES ===');
    const cities = await client.query('SELECT COUNT(*) FROM cities');
    console.log('Count:', cities.rows[0].count);
    
    console.log('\n=== DEPARTMENTS ===');
    const depts = await client.query('SELECT COUNT(*) FROM departments');
    console.log('Count:', depts.rows[0].count);
    
    console.log('\n=== PLAN CATEGORIES ===');
    const cats = await client.query('SELECT COUNT(*) FROM plan_categories');
    console.log('Count:', cats.rows[0].count);
    
    await client.end();
}

check().catch(e => console.error('Error:', e.message));
