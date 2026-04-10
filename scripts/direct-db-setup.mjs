/**
 * Direct PostgreSQL Database Setup Script for HealthMitra
 * Uses pg library for direct database connection
 */
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

async function log(msg) { console.log(msg); }
async function ok(msg) { log(`  ✓ ${msg}`); }
async function fail(msg) { log(`  ✗ ${msg}`); }

async function query(sql) {
    try {
        await client.query(sql);
        return true;
    } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('duplicate') || e.message.includes('relation') && e.message.includes('already')) {
            return true; // Consider these as success
        }
        console.log(`  Error: ${e.message.substring(0, 150)}`);
        return false;
    }
}

async function tableExists(table) {
    try {
        const res = await client.query(
            `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`,
            [table]
        );
        return res.rows[0]?.exists === true;
    } catch (e) {
        return false;
    }
}

async function columnExists(table, col) {
    try {
        const res = await client.query(
            `SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2)`,
            [table, col]
        );
        return res.rows[0]?.exists === true;
    } catch (e) {
        return false;
    }
}

async function setupDatabase() {
    console.log('\n========================================');
    console.log('  HealthMitra Database Setup Script');
    console.log('========================================\n');

    try {
        await client.connect();
        console.log('  Connected to database\n');

        // 1. Setup cms_content table
        console.log('[1] Setting up cms_content table...');
        if (!(await tableExists('cms_content'))) {
            await query(`CREATE TABLE cms_content (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                key VARCHAR(255) UNIQUE NOT NULL,
                value JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            ok('cms_content table created');
        } else { ok('cms_content table exists'); }

        // 2. Setup call_centre_agents table
        console.log('\n[2] Setting up call_centre_agents table...');
        if (!(await tableExists('call_centre_agents'))) {
            await query(`CREATE TABLE call_centre_agents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID UNIQUE NOT NULL,
                agent_name VARCHAR(255),
                agent_email VARCHAR(255),
                agent_phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'agent',
                status VARCHAR(50) DEFAULT 'active',
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            await query(`CREATE INDEX idx_call_centre_agents_user_id ON call_centre_agents(user_id)`);
            await query(`CREATE INDEX idx_call_centre_agents_status ON call_centre_agents(status)`);
            ok('call_centre_agents table created');
        } else { ok('call_centre_agents table exists'); }

        // 3. Setup cities table
        console.log('\n[3] Setting up cities table...');
        if (!(await tableExists('cities'))) {
            await query(`CREATE TABLE cities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                state VARCHAR(255),
                region VARCHAR(50),
                tier VARCHAR(50) DEFAULT 'Tier 2',
                pincodes JSONB DEFAULT '[]',
                is_serviceable BOOLEAN DEFAULT true,
                status VARCHAR(50) DEFAULT 'active',
                service_centers JSONB DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            await query(`CREATE INDEX idx_cities_state ON cities(state)`);
            await query(`CREATE INDEX idx_cities_region ON cities(region)`);
            ok('cities table created');
        } else { ok('cities table exists'); }

        // 4. Setup departments table
        console.log('\n[4] Setting up departments table...');
        if (!(await tableExists('departments'))) {
            await query(`CREATE TABLE departments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                head_name VARCHAR(255),
                description TEXT,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            ok('departments table created');
        } else { ok('departments table exists'); }

        // 5. Setup franchises table with KYC columns
        console.log('\n[5] Setting up franchises KYC columns...');
        if (await tableExists('franchises')) {
            const kycCols = [
                'aadhaar_number', 'aadhaar_image', 'pan_number', 'pan_image',
                'kyc_status', 'kyc_history', 'verified_at', 'verified_by', 'rejection_reason'
            ];
            for (const col of kycCols) {
                if (!(await columnExists('franchises', col))) {
                    let type = 'TEXT';
                    if (col === 'kyc_status') type = 'VARCHAR(50) DEFAULT \'pending\'';
                    if (col === 'kyc_history') type = 'JSONB DEFAULT \'[]\'';
                    if (col === 'verified_at') type = 'TIMESTAMPTZ';
                    if (col === 'verified_by') type = 'UUID';
                    await query(`ALTER TABLE franchises ADD COLUMN IF NOT EXISTS ${col} ${type}`);
                }
            }
            ok('franchises KYC columns added');
        } else { fail('franchises table missing'); }

        // 6. Setup plans table columns
        console.log('\n[6] Setting up plans columns...');
        if (await tableExists('plans')) {
            const planCols = [
                ['status', 'VARCHAR(20) DEFAULT \'active\''],
                ['type', 'VARCHAR(50) DEFAULT \'B2C\''],
                ['is_featured', 'BOOLEAN DEFAULT false'],
                ['duration_days', 'INTEGER DEFAULT 365'],
                ['image_url', 'TEXT'],
                ['gst_percent', 'INTEGER DEFAULT 18'],
            ];
            for (const [col, type] of planCols) {
                if (!(await columnExists('plans', col))) {
                    await query(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS ${col} ${type}`);
                }
            }
            ok('plans columns added');
        } else { fail('plans table missing - create in Supabase dashboard'); }

        // 7. Setup profiles table columns
        console.log('\n[7] Setting up profiles columns...');
        if (await tableExists('profiles')) {
            const profileCols = [
                ['role', 'VARCHAR(50) DEFAULT \'user\''],
                ['status', 'VARCHAR(50) DEFAULT \'active\''],
                ['department_id', 'UUID'],
                ['designation', 'VARCHAR(100)'],
                ['avatar_url', 'TEXT'],
                ['dob', 'DATE'],
                ['gender', 'VARCHAR(20)'],
                ['address', 'TEXT'],
                ['city', 'VARCHAR(100)'],
                ['state', 'VARCHAR(100)'],
                ['pincode', 'VARCHAR(20)'],
                ['blood_group', 'VARCHAR(10)'],
                ['alt_phone', 'VARCHAR(50)'],
                ['second_email', 'VARCHAR(255)'],
                ['landline', 'VARCHAR(50)'],
                ['country', 'VARCHAR(100) DEFAULT \'India\''],
                ['aadhaar_number', 'VARCHAR(20)'],
                ['pan_number', 'VARCHAR(20)'],
                ['bank_holder_name', 'VARCHAR(255)'],
                ['bank_account_number', 'VARCHAR(100)'],
                ['bank_ifsc', 'VARCHAR(20)'],
                ['bank_name', 'VARCHAR(255)'],
                ['bank_branch', 'VARCHAR(255)'],
                ['account_type', 'VARCHAR(20)'],
            ];
            for (const [col, type] of profileCols) {
                if (!(await columnExists('profiles', col))) {
                    await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col} ${type}`);
                }
            }
            ok('profiles columns added');
        } else { fail('profiles table missing - create in Supabase dashboard'); }

        // 8. Setup reimbursement_claims columns
        console.log('\n[8] Setting up reimbursement_claims columns...');
        if (await tableExists('reimbursement_claims')) {
            if (!(await columnExists('reimbursement_claims', 'amount_approved'))) {
                await query(`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS amount_approved DECIMAL(12,2)`);
            }
            if (!(await columnExists('reimbursement_claims', 'admin_notes'))) {
                await query(`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
            }
            if (!(await columnExists('reimbursement_claims', 'rejection_reason'))) {
                await query(`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS rejection_reason TEXT`);
            }
            ok('reimbursement_claims columns added');
        } else { fail('reimbursement_claims table missing'); }

        // 9. Setup ecard_members columns
        console.log('\n[9] Setting up ecard_members columns...');
        if (await tableExists('ecard_members')) {
            if (!(await columnExists('ecard_members', 'member_id_code'))) {
                await query(`ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS member_id_code VARCHAR(50)`);
            }
            if (!(await columnExists('ecard_members', 'card_unique_id'))) {
                await query(`ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS card_unique_id VARCHAR(50)`);
            }
            if (!(await columnExists('ecard_members', 'relation'))) {
                await query(`ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS relation VARCHAR(50) DEFAULT 'Self'`);
            }
            ok('ecard_members columns added');
        } else { fail('ecard_members table missing'); }

        // 10. Setup plan_categories table
        console.log('\n[10] Setting up plan_categories table...');
        if (!(await tableExists('plan_categories'))) {
            await query(`CREATE TABLE plan_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            ok('plan_categories table created');
        } else { ok('plan_categories table exists'); }

        // 11. Setup audit_logs table
        console.log('\n[11] Setting up audit_logs table...');
        if (!(await tableExists('audit_logs'))) {
            await query(`CREATE TABLE audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                action VARCHAR(255) NOT NULL,
                entity_type VARCHAR(100),
                entity_id UUID,
                description TEXT,
                metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`);
            await query(`CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)`);
            await query(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`);
            ok('audit_logs table created');
        } else { ok('audit_logs table exists'); }

        // 12. Setup service_requests columns
        console.log('\n[12] Setting up service_requests columns...');
        if (await tableExists('service_requests')) {
            if (!(await columnExists('service_requests', 'request_id'))) {
                await query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS request_id SERIAL`);
            }
            if (!(await columnExists('service_requests', 'assigned_to'))) {
                await query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID`);
            }
            if (!(await columnExists('service_requests', 'assigned_at'))) {
                await query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ`);
            }
            if (!(await columnExists('service_requests', 'completed_at'))) {
                await query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`);
            }
            if (!(await columnExists('service_requests', 'admin_notes'))) {
                await query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
            }
            ok('service_requests columns added');
        }

        console.log('\n========================================');
        console.log('  Database setup completed successfully!');
        console.log('========================================\n');

    } catch (e) {
        console.error('Database connection error:', e.message);
    } finally {
        await client.end();
    }
}

setupDatabase();
