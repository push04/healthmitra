import { ReimbursementsView } from "@/components/client/reimbursements/ReimbursementsView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReimbursementsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: claims } = await supabase.from('reimbursement_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return <ReimbursementsView initialClaims={claims || []} />;
}
