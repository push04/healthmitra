'use server';

import { MOCK_CITIES, City, Region } from '@/app/lib/mock/locations-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- LOCATION ACTIONS ---

interface GetCitiesFilters {
    query?: string;
    state?: string;
    region?: Region | 'all';
    status?: string;
}

export async function getCities(filters?: GetCitiesFilters) {
    await delay(600);

    let cities = [...MOCK_CITIES];

    if (filters?.query) {
        const q = filters.query.toLowerCase();
        cities = cities.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.pincodes.some(p => p.includes(q))
        );
    }

    if (filters?.state && filters.state !== 'all') {
        cities = cities.filter(c => c.state === filters.state);
    }

    if (filters?.region && filters.region !== 'all') {
        cities = cities.filter(c => c.region === filters.region);
    }

    return { success: true, data: cities };
}

export async function upsertCity(city: Partial<City>) {
    await delay(800);
    console.log("Upserting City:", city);

    if (city.id) {
        return { success: true, message: 'City updated successfully' };
    } else {
        const newCity = {
            ...city,
            id: `city_${Date.now()}`,
            status: city.status || 'active',
            isServiceable: city.isServiceable ?? true,
            pincodes: city.pincodes || [],
            serviceCenters: city.serviceCenters || []
        };
        return { success: true, message: 'City added successfully', data: newCity };
    }
}

export async function deleteCity(id: string) {
    await delay(500);
    console.log("Deleting City:", id);
    return { success: true, message: 'City deleted successfully' };
}

export async function searchPincode(pincode: string) {
    await delay(400);
    const city = MOCK_CITIES.find(c => c.pincodes.includes(pincode));

    if (city) {
        return {
            success: true,
            found: true,
            data: {
                city: city.name,
                state: city.state,
                region: city.region,
                isServiceable: city.isServiceable,
                nearestCenter: city.serviceCenters[0] || null
            }
        };
    }

    return { success: true, found: false };
}

export async function bulkUploadCities(data: any[]) {
    await delay(2000); // larger delay for bulk op
    console.log("Processing Bulk Upload:", data.length, "entries");
    return {
        success: true,
        message: `Successfully processed ${data.length} entries.`,
        stats: { added: data.length, updated: 0, errors: 0 }
    };
}
