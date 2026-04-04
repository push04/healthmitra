import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'db.umyjamvtynsteamwvztu.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Pushpal2004',
    ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log('Connected\n');

// Show current user & search_path
const whoami = await client.query('SELECT current_user, current_schema(), version()');
console.log('User:', whoami.rows[0].current_user);
console.log('Schema:', whoami.rows[0].current_schema);

// List ALL schemas
const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
console.log('\nAll schemas:', schemas.rows.map(r => r.schema_name).join(', '));

// List ALL tables across all schemas
const tables = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_toast')
    ORDER BY table_schema, table_name
`);
console.log('\nAll tables:');
tables.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name}`));

// Try with explicit schema
try {
    const res = await client.query('SELECT COUNT(*) FROM public.profiles');
    console.log('\npublic.profiles count:', res.rows[0].count);
} catch(e) {
    console.log('\npublic.profiles error:', e.message);
}

await client.end();
