'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { Department } from '@/types/departments';

export async function getDepartments() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('departments').select('*').order('name');

    if (error) return { success: false, error: error.message };

    const departments: Department[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        head: d.head_name || '',
        description: d.description,
        employeeCount: d.employee_count || 0,
        status: d.status || 'active',
        designations: d.designations || []
    }));

    return { success: true, data: departments };
}

export async function createDepartment(name: string, description?: string) {
    const supabase = await createAdminClient();
    
    // Generate a code from the name
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
    
    const { data, error } = await supabase
        .from('departments')
        .insert({
            name: name,
            description: description || '',
            code: code,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    
    return { success: true, data: data, message: 'Department created successfully' };
}

export async function upsertDepartment(dept: Partial<Department>) {
    const supabase = await createAdminClient();

    const dbPayload: any = {
        updated_at: new Date().toISOString()
    };
    
    if (dept.id) dbPayload.id = dept.id;
    if (dept.name) dbPayload.name = dept.name;
    if (dept.head) dbPayload.head_name = dept.head;
    if (dept.description !== undefined) dbPayload.description = dept.description;
    if (dept.status) dbPayload.status = dept.status;
    if (dept.designations) dbPayload.designations = dept.designations;

    // Check if department exists
    if (dept.id) {
        const { error } = await supabase.from('departments').update(dbPayload).eq('id', dept.id);
        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Department updated successfully' };
    } else {
        // Create new
        return createDepartment(dept.name || '', dept.description);
    }
}

export async function deleteDepartment(id: string) {
    const supabase = await createAdminClient();
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Department deleted' };
}
