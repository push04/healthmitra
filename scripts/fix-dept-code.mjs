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
    
    console.log('=== CHECKING departments TABLE ===');
    
    // Check columns
    const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'departments'
        ORDER BY column_name
    `);
    console.log('Current columns:', cols.rows.map(r => r.column_name).join(', '));
    
    // Check if code column exists
    const hasCode = cols.rows.some(r => r.column_name === 'code');
    
    if (!hasCode) {
        console.log('\nAdding code column...');
        await client.query('ALTER TABLE departments ADD COLUMN code TEXT');
        console.log('✓ Added code column');
    }
    
    // Verify
    const verify = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['departments']);
    console.log('\nFinal columns:', verify.rows.map(r => r.column_name).join(', '));
    
    await client.end();
}

fix().catch(e => console.error(e.message));
