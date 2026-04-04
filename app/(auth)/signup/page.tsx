import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignupForm from "./signup-form";

export default async function SignupPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const adminClient = await createAdminClient();
        const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
            redirect('/admin/dashboard')
        }
        redirect("/dashboard");
    }

    return <SignupForm />;
}
