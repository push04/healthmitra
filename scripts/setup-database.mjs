/**
 * Comprehensive Database Setup Script for HealthMitra
 * Run this script to ensure all tables, columns, and constraints are properly set up
 */

const SUPABASE_URL = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';

async function query(sql, method = 'POST') {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({ query: sql })
        });
        const text = await res.text();
        if (!res.ok) {
            console.log(`  Error: ${text.substring(0, 200)}`);
            return null;
        }
        return JSON.parse(text);
    } catch (e) {
        console.log(`  Query error: ${e.message}`);
        return null;
    }
}

async function directQuery(sql) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: sql })
        });
        return res.ok;
    } catch (e) {
        console.log(`  Direct query error: ${e.message}`);
        return false;
    }
}

async function tableExists(tableName) {
    const res = await query(`
        SELECT EXISTS(
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema='public' AND table_name='${tableName}'
        ) as exists
    `);
    return res && res[0] && res[0].exists === true;
}

async function columnExists(tableName, columnName) {
    const res = await query(`
        SELECT EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='${tableName}' AND column_name='${columnName}'
        ) as exists
    `);
    return res && res[0] && res[0].exists === true;
}

async function runSQL(sql) {
    console.log(`  Running: ${sql.substring(0, 80)}...`);
    const result = await query(sql);
    if (result !== null) {
        console.log(`  ✓ Success`);
        return true;
    } else {
        // Try alternative method
        console.log(`  Trying alternative method...`);
        return await directQuery(sql);
    }
}

async function setupDatabase() {
    console.log('\n========================================');
    console.log('  HealthMitra Database Setup Script');
    console.log('========================================\n');

    // 1. Setup cms_content table
    console.log('\n[1] Setting up cms_content table...');
    if (!(await tableExists('cms_content'))) {
        await runSQL(`
            CREATE TABLE cms_content (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                key VARCHAR(255) UNIQUE NOT NULL,
                value JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
    } else {
        console.log('  ✓ cms_content table exists');
    }

    // 2. Setup call_centre_agents table
    console.log('\n[2] Setting up call_centre_agents table...');
    if (!(await tableExists('call_centre_agents'))) {
        await runSQL(`
            CREATE TABLE call_centre_agents (
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
            )
        `);
        await runSQL(`CREATE INDEX idx_call_centre_agents_user_id ON call_centre_agents(user_id)`);
        await runSQL(`CREATE INDEX idx_call_centre_agents_status ON call_centre_agents(status)`);
    } else {
        console.log('  ✓ call_centre_agents table exists');
    }

    // 3. Setup cities table
    console.log('\n[3] Setting up cities table...');
    if (!(await tableExists('cities'))) {
        await runSQL(`
            CREATE TABLE cities (
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
            )
        `);
        await runSQL(`CREATE INDEX idx_cities_state ON cities(state)`);
        await runSQL(`CREATE INDEX idx_cities_region ON cities(region)`);
    } else {
        console.log('  ✓ cities table exists');
    }

    // 4. Setup departments table
    console.log('\n[4] Setting up departments table...');
    if (!(await tableExists('departments'))) {
        await runSQL(`
            CREATE TABLE departments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                head_name VARCHAR(255),
                description TEXT,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
    } else {
        console.log('  ✓ departments table exists');
    }

    // 5. Setup franchises table with KYC columns
    console.log('\n[5] Setting up franchises table...');
    if (await tableExists('franchises')) {
        const kycColumns = [
            ['aadhaar_number', 'VARCHAR(20)'],
            ['aadhaar_image', 'TEXT'],
            ['pan_number', 'VARCHAR(20)'],
            ['pan_image', 'TEXT'],
            ['kyc_status', 'VARCHAR(50) DEFAULT \'pending\''],
            ['kyc_history', 'JSONB DEFAULT \'[]\''],
        ];
        
        for (const [col, type] of kycColumns) {
            if (!(await columnExists('franchises', col))) {
                await runSQL(`ALTER TABLE franchises ADD COLUMN IF NOT EXISTS ${col} ${type}`);
            }
        }
        console.log('  ✓ franchises table exists with KYC columns');
    } else {
        await runSQL(`
            CREATE TABLE franchises (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                franchise_name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                alt_phone VARCHAR(50),
                gst_number VARCHAR(50),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                website VARCHAR(255),
                commission_percentage DECIMAL(5,2) DEFAULT 10,
                status VARCHAR(50) DEFAULT 'active',
                verification_status VARCHAR(50) DEFAULT 'unverified',
                aadhaar_number VARCHAR(20),
                aadhaar_image TEXT,
                pan_number VARCHAR(20),
                pan_image TEXT,
                kyc_status VARCHAR(50) DEFAULT 'pending',
                kyc_history JSONB DEFAULT '[]',
                verified_at TIMESTAMPTZ,
                verified_by UUID,
                rejection_reason TEXT,
                total_members INTEGER DEFAULT 0,
                total_sales DECIMAL(12,2) DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('  ✓ franchises table created with KYC columns');
    }

    // 6. Setup plans table
    console.log('\n[6] Setting up plans table...');
    if (await tableExists('plans')) {
        const planColumns = [
            ['status', 'VARCHAR(20) DEFAULT \'active\''],
            ['type', 'VARCHAR(50) DEFAULT \'B2C\''],
            ['is_featured', 'BOOLEAN DEFAULT false'],
            ['duration_days', 'INTEGER DEFAULT 365'],
            ['image_url', 'TEXT'],
        ];
        
        for (const [col, type] of planColumns) {
            if (!(await columnExists('plans', col))) {
                await runSQL(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS ${col} ${type}`);
            }
        }
        console.log('  ✓ plans table exists');
    } else {
        console.log('  ✗ plans table missing - needs to be created in Supabase dashboard');
    }

    // 7. Setup profiles table
    console.log('\n[7] Setting up profiles table...');
    if (await tableExists('profiles')) {
        const profileColumns = [
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
        
        for (const [col, type] of profileColumns) {
            if (!(await columnExists('profiles', col))) {
                await runSQL(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col} ${type}`);
            }
        }
        console.log('  ✓ profiles table exists');
    } else {
        console.log('  ✗ profiles table missing - needs to be created in Supabase dashboard');
    }

    // 8. Setup reimbursement_claims table
    console.log('\n[8] Setting up reimbursement_claims table...');
    if (await tableExists('reimbursement_claims')) {
        if (!(await columnExists('reimbursement_claims', 'amount_approved'))) {
            await runSQL(`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS amount_approved DECIMAL(12,2)`);
        }
        if (!(await columnExists('reimbursement_claims', 'admin_notes'))) {
            await runSQL(`ALTER TABLE reimbursement_claims ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
        }
        console.log('  ✓ reimbursement_claims table exists');
    }

    // 9. Setup ecard_members table
    console.log('\n[9] Setting up ecard_members table...');
    if (await tableExists('ecard_members')) {
        const ecardColumns = [
            ['member_id_code', 'VARCHAR(50)'],
            ['card_unique_id', 'VARCHAR(50)'],
            ['relation', 'VARCHAR(50) DEFAULT \'Self\''],
        ];
        
        for (const [col, type] of ecardColumns) {
            if (!(await columnExists('ecard_members', col))) {
                await runSQL(`ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS ${col} ${type}`);
            }
        }
        console.log('  ✓ ecard_members table exists');
    }

    // 10. Setup plan_categories table
    console.log('\n[10] Setting up plan_categories table...');
    if (!(await tableExists('plan_categories'))) {
        await runSQL(`
            CREATE TABLE plan_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
    } else {
        console.log('  ✓ plan_categories table exists');
    }

    // 11. Create audit_logs table if missing
    console.log('\n[11] Setting up audit_logs table...');
    if (!(await tableExists('audit_logs'))) {
        await runSQL(`
            CREATE TABLE audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                action VARCHAR(255) NOT NULL,
                entity_type VARCHAR(100),
                entity_id UUID,
                description TEXT,
                metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await runSQL(`CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)`);
        await runSQL(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`);
    } else {
        console.log('  ✓ audit_logs table exists');
    }

    console.log('\n========================================');
    console.log('  Database setup completed!');
    console.log('========================================\n');
}

setupDatabase().catch(console.error);
