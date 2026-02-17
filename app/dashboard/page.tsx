import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserDashboardData } from '@/app/actions/dashboard'
import { UserDashboard } from '@/components/dashboard/user-dashboard'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // DOUBLE CHECK: If admin lands here, kick them to /admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
        console.log("Admin on user dashboard -> Redirecting to /admin");
        redirect('/admin')
    }

    const { success, data } = await getUserDashboardData()

    // If data fetch failed, might be a new user or error
    // We can pass empty data or handle error
    const dashboardData = success ? data : null

    return (
        <>
            <UserDashboard initialData={dashboardData} user={user} />
        </>
    )
}
