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
    
    console.log('=== SUPABASE STORAGE BUCKETS ===');
    
    try {
        const buckets = await client.query(`
            SELECT id, name, public, file_size_limit, allowed_mime_types
            FROM storage.buckets
            ORDER BY name
        `);
        
        if (buckets.rows.length === 0) {
            console.log('No storage buckets found!');
        } else {
            buckets.rows.forEach(b => {
                console.log(`\nBucket: ${b.name}`);
                console.log(`  Public: ${b.public}`);
                console.log(`  File size limit: ${b.file_size_limit || 'unlimited'}`);
                console.log(`  Allowed MIME types: ${b.allowed_mime_types?.length > 0 ? b.allowed_mime_types.join(', ') : 'all'}`);
            });
        }
    } catch(e) {
        console.log('Cannot access storage.buckets:', e.message);
        console.log('\nChecking storage.objects directly...');
        
        try {
            const objs = await client.query(`
                SELECT bucket_id, name, metadata->>'size' as size
                FROM storage.objects
                LIMIT 20
            `);
            console.log(`Found ${objs.rows.length} objects in storage`);
            objs.rows.forEach(o => console.log(`  ${o.bucket_id}/${o.name}`));
        } catch(e2) {
            console.log('Cannot access storage.objects:', e2.message);
        }
    }
    
    console.log('\n=== CMS CONTENT SAMPLE ===');
    const cms = await client.query('SELECT key, value FROM cms_content LIMIT 10');
    cms.rows.forEach(r => {
        const val = typeof r.value === 'string' ? r.value.substring(0, 50) + '...' : JSON.stringify(r.value).substring(0, 50) + '...';
        console.log(`${r.key}: ${val}`);
    });
    
    await client.end();
}

check().catch(e => console.error('Error:', e.message));
