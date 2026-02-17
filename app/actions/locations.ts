'use server';

import { createClient } from '@/lib/supabase/server';
import { City, Region } from '@/types/locations';

// --- LOCATION ACTIONS ---

interface GetCitiesFilters {
    query?: string;
    state?: string;
    region?: string | 'all';
    status?: string;
}

export async function getCities(filters?: GetCitiesFilters) {
    const supabase = await createClient();
    let query = supabase.from('cities').select('*');

    if (filters?.query) {
        query = query.ilike('name', `%${filters.query}%`);
    }

    if (filters?.state && filters.state !== 'all') {
        query = query.eq('state', filters.state);
    }

    if (filters?.region && filters.region !== 'all') {
        query = query.eq('region', filters.region);
    }

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('name');

    if (error) return { success: false, error: error.message };

    // Map to frontend expectation
    const cities: City[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        state: c.state,
        region: c.region,
        tier: 'Tier 2', // Mock or add to schema
        pincodes: c.pincodes || [],
        isServiceable: c.is_serviceable,
        status: c.status,
        serviceCenters: c.service_centers || []
    }));

    return { success: true, data: cities };
}

export async function upsertCity(city: Partial<City>) {
    const supabase = await createClient();
    const { error } = await supabase.from('cities').upsert({
        id: city.id,
        name: city.name,
        state: city.state,
        region: city.region,
        pincodes: city.pincodes,
        is_serviceable: city.isServiceable,
        status: city.status,
        service_centers: city.serviceCenters
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'City saved successfully' };
}

export async function deleteCity(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('cities').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'City deleted successfully' };
}

export async function searchPincode(pincode: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('cities')
        .select('*')
        .contains('pincodes', [pincode])
        .maybeSingle(); // Use maybeSingle to avoid error if not found

    if (data) {
        return {
            success: true,
            found: true,
            data: {
                city: data.name,
                state: data.state,
                region: data.region,
                isServiceable: data.is_serviceable,
                nearestCenter: data.service_centers?.[0] || null
            }
        };
    }

    return { success: true, found: false };
}

export async function bulkUploadCities(data: any[]) {
    const supabase = await createClient();

    // Map data to schema columns
    const rows = data.map(d => ({
        name: d.name,
        state: d.state,
        region: d.region,
        pincodes: d.pincodes,
        is_serviceable: d.isServiceable,
        status: 'active'
    }));

    const { error } = await supabase.from('cities').insert(rows);

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        message: `Successfully processed ${data.length} entries.`,
        stats: { added: data.length, updated: 0, errors: 0 }
    };
}
