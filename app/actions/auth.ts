'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createAdminClient() // Use Admin Client to skip verification

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    // 1. Create User (Admin API - auto confirms email)
    const { data: user, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Bypass verification
        user_metadata: {
            full_name: fullName,
            phone: phone,
        }
    })

    if (error) {
        return { error: error.message }
    }

    // 2. Sign In (Since admin.createUser doesn't set session)
    const supabaseClient = await createClient() // Standard client for session
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) {
        return { error: "Account created but failed to sign in automatically. Please login." }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
