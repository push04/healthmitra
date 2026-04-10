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

async function fixPolicy() {
    await client.connect();
    
    console.log('=== ADDING MISSING RLS POLICY ===');
    
    try {
        // Check if policy exists
        const check = await client.query(`
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'ecard_members' AND policyname = 'Admins can view all members'
        `);
        
        if (check.rows.length === 0) {
            await client.query(`
                CREATE POLICY "Admins can view all members"
                ON ecard_members FOR SELECT
                USING (
                    EXISTS (
                        SELECT 1 FROM profiles
                        WHERE profiles.id = auth.uid()
                        AND profiles.role = 'admin'
                    )
                )
            `);
            console.log('✓ Created RLS policy: "Admins can view all members"');
        } else {
            console.log('✓ Policy already exists');
        }
    } catch(e) {
        console.log('✗ Error:', e.message);
    }
    
    await client.end();
}

fixPolicy().catch(e => console.error('Error:', e.message));
