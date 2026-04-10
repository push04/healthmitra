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

async function fix() {
    await client.connect();
    
    console.log('=== FIXING profiles_role_check CONSTRAINT ===');
    
    try {
        // Drop the existing constraint
        await client.query('ALTER TABLE profiles DROP CONSTRAINT profiles_role_check');
        console.log('✓ Dropped old constraint');
        
        // Add new constraint with 'employee' included
        await client.query(`
            ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'franchise_owner'::text, 'doctor'::text, 'diagnostic_center'::text, 'pharmacy'::text, 'employee'::text, 'call_center_agent'::text, 'partner'::text]))
        `);
        console.log('✓ Added new constraint with employee, call_center_agent, partner');
        
        // Verify
        const res = await client.query(`
            SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'profiles_role_check'
        `);
        console.log('New constraint:', res.rows[0].pg_get_constraintdef);
        
    } catch(e) {
        console.log('Error:', e.message);
    }
    
    await client.end();
}

fix().catch(e => console.error(e.message));
