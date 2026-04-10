/**
 * Debug script to check plans in the database
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqwsfkpytexbdsfgqbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXdzZmtweXRleGJkc2ZncWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxMDMyMywiZXhwIjoyMDg2ODg2MzIzfQ.Gfo9HOM030l40gdr6BewDO6aiAnzSJvuJpkoigsd_SA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlans() {
    console.log('Checking plans table...\n');
    
    // Get all plans
    const { data: plans, error } = await supabase.from('plans').select('*');
    
    if (error) {
        console.log('Error fetching plans:', error.message);
        return;
    }
    
    console.log(`Found ${plans.length} plans:\n`);
    plans.forEach(p => {
        console.log(`  ID: ${p.id}`);
        console.log(`  Name: ${p.name}`);
        console.log(`  Price: ${p.price}`);
        console.log(`  Status: ${p.status}`);
        console.log(`  Type: ${p.type}`);
        console.log('---');
    });
}

checkPlans();
