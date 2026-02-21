'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadFileToStorage(
    file: File,
    bucket: string,
    folder: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { success: true, path: filePath, url: publicUrl };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadBufferToStorage(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    bucket: string,
    folder: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const fileExt = fileName.split('.').pop();
        const newFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${user.id}/${newFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType,
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { success: true, path: filePath, url: publicUrl };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFileFromStorage(
    path: string,
    bucket: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
        const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSignedDownloadUrl(
    path: string,
    bucket: string,
    expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, url: data.signedUrl };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function listFilesInFolder(
    folder: string,
    bucket: string
): Promise<{ success: boolean; files?: any[]; error?: string }> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, files: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPublicUrl(path: string, bucket: string): Promise<string> {
    const supabase = await createClient();
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    return publicUrl;
}
