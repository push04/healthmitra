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

async function addColumns() {
    await client.connect();
    
    console.log('=== ADDING MISSING KYC COLUMNS TO FRANCHISES ===');
    
    const columns = [
        { name: 'aadhaar_front', type: 'TEXT' },
        { name: 'aadhaar_back', type: 'TEXT' },
        { name: 'pan_card', type: 'TEXT' },
        { name: 'photo', type: 'TEXT' },
    ];
    
    for (const col of columns) {
        try {
            // Check if column exists
            const check = await client.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'franchises' AND column_name = $1
            `, [col.name]);
            
            if (check.rows.length === 0) {
                await client.query(`ALTER TABLE franchises ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✓ Added column: ${col.name}`);
            } else {
                console.log(`✓ Column already exists: ${col.name}`);
            }
        } catch(e) {
            console.log(`✗ Error adding ${col.name}:`, e.message);
        }
    }
    
    console.log('\n=== VERIFYING COLUMNS ===');
    const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'franchises' 
        AND column_name LIKE '%aadhaar%' OR column_name LIKE '%pan%' OR column_name LIKE '%photo%'
        OR column_name LIKE '%kyc%'
    `);
    console.log('KYC-related columns:', cols.rows.map(r => r.column_name).join(', '));
    
    await client.end();
}

addColumns().catch(e => console.error('Error:', e.message));
