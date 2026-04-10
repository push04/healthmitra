'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { City, Region } from '@/types/locations';

// --- LOCATION ACTIONS ---

interface GetCitiesFilters {
    query?: string;
    state?: string;
    region?: string | 'all';
    status?: string;
}

export async function getCities(filters?: GetCitiesFilters) {
    const supabase = await createAdminClient();
    let query = supabase.from('cities').select('*');

    if (filters?.query) {
        query = query.or(`name.ilike.%${filters.query}%,state.ilike.%${filters.query}%`);
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

    const cities: City[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        state: c.state,
        region: c.region,
        tier: c.tier || 'Tier 2',
        pincodes: Array.isArray(c.pincodes) ? c.pincodes : (typeof c.pincodes === 'string' ? JSON.parse(c.pincodes) : []),
        isServiceable: c.is_serviceable ?? true,
        status: c.status,
        serviceCenters: Array.isArray(c.service_centers) ? c.service_centers : []
    }));

    return { success: true, data: cities };
}

export async function upsertCity(city: Partial<City>) {
    const supabase = await createAdminClient();
    
    const cityData = {
        name: city.name,
        state: city.state,
        region: city.region,
        pincodes: city.pincodes || [],
        tier: city.tier || 'Tier 2',
        is_serviceable: city.isServiceable ?? true,
        status: city.status || 'active',
        service_centers: city.serviceCenters || []
    };

    let error;
    if (city.id) {
        // Update existing
        ({ error } = await supabase.from('cities').update(cityData).eq('id', city.id));
    } else {
        // Insert new
        ({ error } = await supabase.from('cities').insert(cityData));
    }

    if (error) return { success: false, error: error.message };
    return { success: true, message: city.id ? 'City updated successfully' : 'City added successfully' };
}

export async function deleteCity(id: string) {
    const supabase = await createAdminClient();
    const { error } = await supabase.from('cities').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'City deleted successfully' };
}

export async function searchPincode(pincode: string) {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('cities')
        .select('*')
        .contains('pincodes', [pincode])
        .maybeSingle();

    if (error) return { success: false, error: error.message };

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
    const supabase = await createAdminClient();

    const rows = data.map(d => ({
        name: d.name,
        state: d.state,
        region: d.region,
        pincodes: d.pincodes || [],
        is_serviceable: d.isServiceable ?? true,
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
