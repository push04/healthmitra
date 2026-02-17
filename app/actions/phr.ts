'use server';

import { createClient } from "@/lib/supabase/server";

export async function getPHRDocuments() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('phr_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Transform if necessary to match UI expectations
    // UI expects: id, name, category, user_id, uploaded_at, file_url, created_at
    const documents = data?.map(doc => ({
        ...doc,
        uploaded_at: doc.created_at, // Map created_at to uploaded_at
        file_url: doc.file_url || '#'
    }));

    return { success: true, data: documents };
}

export async function uploadPHRDocument(formData: any) {
    // Handling file upload is complex with Server Actions directly if using FormData
    // For now, we assume the file is uploaded to Storage via client-side or separate API, 
    // and this action records the metadata.
    // OR we implement signed URL generation here.

    // For simplicity given the scope, we'll assume metadata insertion.
    // Real implementation would require Supabase Storage handling.

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { name, category, file_url } = formData;

    const { data, error } = await supabase.from('phr_documents').insert({
        user_id: user.id,
        name,
        category,
        file_url, // This should come from a storage upload
        created_at: new Date().toISOString()
    }).select().single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}
export async function verifyPatientAccess(data: { type: 'otp' | 'abha', value: string }) {
    const supabase = await createClient();

    // In a real scenario, this would verify OTP against a temporal store or check ABHA integration.
    // For this implementation, we will mock the verification success for specific inputs
    // but fetch REAL data from ecard_members to ensure the flow works.

    // Demo bypass
    if (data.type === 'otp' && data.value === '123456') {
        // Fetch a random member to simulate success
        const { data: member } = await supabase.from('ecard_members').select('*').limit(1).single();

        if (member) {
            return {
                success: true,
                message: 'Patient verified successfully',
                data: {
                    id: member.id,
                    name: member.full_name,
                    email: member.email || 'N/A',
                    phone: member.contact_number || 'N/A',
                    planName: 'HealthMitra Plan', // Join with plans if needed
                    memberId: member.member_id_code
                }
            };
        }
    }

    // Attempt to find by ABHA (using card_unique_id or other field as proxy)
    if (data.type === 'abha') {
        const { data: member } = await supabase.from('ecard_members')
            .select('*')
            .eq('aadhaar_last4', data.value.slice(-4)) // Mock logic matching last 4
            .single();

        if (member) {
            return {
                success: true,
                message: 'Patient verified successfully',
                data: {
                    id: member.id,
                    name: member.full_name,
                    email: member.email || 'N/A',
                    phone: member.contact_number || 'N/A',
                    planName: 'HealthMitra Plan',
                    memberId: member.member_id_code
                }
            };
        }
    }

    return { success: false, error: 'Verification failed. Invalid OTP or ID.' };
}

export async function addVendorRecord(memberId: string, data: { category: string, notes: string, addedBy: string, vendorName: string }) {
    const supabase = await createClient();

    // Get member details to find the user_id
    const { data: member } = await supabase.from('ecard_members').select('user_id').eq('id', memberId).single();

    if (!member) return { success: false, error: 'Patient not found' };

    // Insert into phr_documents
    // Note: In real app, we would upload file to storage first. 
    // Here we might be creating a "record" without a file, or using a placeholder.
    const { error } = await supabase.from('phr_documents').insert({
        user_id: member.user_id,
        member_id: memberId,
        name: `${data.vendorName} Record`,
        category: data.category,
        file_url: '#', // Placeholder or from previous upload step
        doctor_name: data.vendorName,
        tags: ['vendor-upload', data.addedBy],
        created_at: new Date().toISOString()
    });

    if (error) return { success: false, error: error.message };

    // Log to Audit
    await supabase.from('audit_logs').insert({
        action: 'vendor_add_record',
        target_resource: 'phr_documents',
        details: { memberId, vendor: data.vendorName, category: data.category },
        created_at: new Date().toISOString()
    });

    return { success: true, message: 'Record added successfully' };
}

export async function getVendorAuditLog() {
    const supabase = await createClient();
    // Fetch logs related to vendor actions
    const { data: logs, error } = await supabase.from('audit_logs')
        .select('*')
        .eq('action', 'vendor_add_record')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Map to UI type
    const auditEntries = logs.map(log => ({
        id: log.id,
        vendorName: log.details?.vendor || 'Unknown Vendor',
        action: 'add_record',
        memberName: log.details?.memberId || 'Unknown Member', // Ideally fetch name
        recordName: log.details?.category || 'Record',
        verificationMethod: 'otp', // Mock
        timestamp: log.created_at
    }));

    return { success: true, data: auditEntries };
}

export async function getPatients(query?: string) {
    const supabase = await createClient();

    let dbQuery = supabase.from('ecard_members').select('*, plans(name)');

    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,member_id_code.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const patients = data.map((m: any) => ({
        id: m.id,
        name: m.full_name,
        email: m.email || '',
        phone: m.contact_number || '',
        relation: m.relation,
        age: m.dob ? new Date().getFullYear() - new Date(m.dob).getFullYear() : 0,
        gender: m.gender || 'Unknown',
        abhaId: m.card_unique_id, // Using this as proxy for now
        planName: m.plans?.name || 'Basic Plan',
        recordCount: 0, // Need subquery or separate fetch for count
        lastUpdated: new Date(m.updated_at).toLocaleDateString()
    }));

    return { success: true, data: patients };
}

export async function getPatientPHR(memberId: string) {
    const supabase = await createClient();

    // Fetch member details
    const { data: member, error: memberError } = await supabase.from('ecard_members')
        .select('*, plans(name)')
        .eq('id', memberId)
        .single();

    if (memberError || !member) return { success: false, error: 'Patient not found' };

    const patient = {
        id: member.id,
        name: member.full_name,
        email: member.email || '',
        phone: member.contact_number || '',
        relation: member.relation,
        age: member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : 0,
        gender: member.gender || 'Unknown',
        abhaId: member.card_unique_id,
        planName: member.plans?.name || 'Basic Plan',
        recordCount: 0,
        lastUpdated: new Date(member.updated_at).toLocaleDateString()
    };

    // Fetch PHR records
    const { data: docs, error: docError } = await supabase.from('phr_documents')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

    if (docError) return { success: false, error: docError.message };

    const records = docs.map((d: any) => ({
        id: d.id,
        fileName: d.name,
        fileType: d.file_type || 'pdf',
        fileSize: d.file_size || '1.2 MB', // Mock size if not stored
        uploadedAt: d.created_at,
        category: d.category,
        addedBy: d.doctor_name === 'Self' ? 'self' : d.doctor_name ? 'vendor' : 'admin', // Infer based on logic
        vendorName: d.doctor_name,
        tags: d.tags || [],
        fileUrl: d.file_url
    }));

    return { success: true, data: { patient, records } };
}
