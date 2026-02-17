'use server';

import { createClient } from '@/lib/supabase/server';
import { Department } from '@/types/departments';

export async function getDepartments() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('departments').select('*').order('name');

    if (error) return { success: false, error: error.message };

    // Fetch employee counts if needed, for now mock or simple count query
    // const { count, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('department_id', dept.id);

    const departments: Department[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        head: d.head_name || '', // Assuming head_name column or join
        description: d.description,
        employeeCount: d.employee_count || 0, // Assuming aggregation or column
        status: d.status || 'active',
        designations: d.designations || [] // JSONB column
    }));

    return { success: true, data: departments };
}

export async function upsertDepartment(dept: Partial<Department>) {
    const supabase = await createClient();

    const dbPayload = {
        id: dept.id,
        name: dept.name,
        head_name: dept.head,
        description: dept.description,
        status: dept.status,
        designations: dept.designations, // JSONB
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('departments').upsert(dbPayload);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Department saved successfully' };
}

export async function deleteDepartment(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Department deleted' };
}
