'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    if (authData?.user) {
        const adminClient = await createAdminClient();
        const { data: profile, error: profileError } = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single()
        
        if (profileError) {
            console.error("Error fetching admin profile:", profileError);
        }
        
        if (profile?.role === 'admin') {
            revalidatePath('/', 'layout')
            return { success: true, redirect: '/admin/dashboard' }
        }
    }

    revalidatePath('/', 'layout')
    return { success: true, redirect: '/dashboard' }
}

export async function signup(formData: FormData) {
    let supabase;
    let isAdmin = false;

    // Try to get admin client, fallback to standard if fails (e.g. missing key)
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        }
        supabase = await createAdminClient();
        isAdmin = true;
    } catch (e) {
        console.warn("Failed to create admin client, falling back to standard signup:", e);
        supabase = await createClient();
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    let error;

    if (isAdmin) {
        // 1. Create User (Admin API - auto confirms email)
        const result = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Bypass verification
            user_metadata: {
                full_name: fullName,
                phone: phone,
            }
        });
        error = result.error;

        if (!error) {
            // 2. Sign In immediatey if admin creation worked
            const supabaseClient = await createClient()
            const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            })
            if (signInError) {
                return { error: "Account created but failed to sign in automatically. Please login." }
            }
        }
    } else {
        // Fallback: Standard Signup
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                },
            },
        })
        error = result.error;
    }

    if (error) {
        console.error("Signup Error:", error.message);
        return { error: error.message }
    }

    // Check user role for redirect
    revalidatePath('/', 'layout')
    
    // For admin creation flow, the role is typically set outside standard signup
    // but just checking the db directly is safest
    let redirectPath = '/dashboard';
    
    const supabaseClient = await createClient()
    const { data: authData } = await supabaseClient.auth.getUser()
    if (authData?.user) {
        const adminClient = await createAdminClient();
        const { data: profile } = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single()
        if (profile?.role === 'admin') {
            redirectPath = '/admin/dashboard';
        }
    }

    return { success: true, redirect: redirectPath }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
