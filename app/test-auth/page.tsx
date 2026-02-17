import { createClient } from "@/lib/supabase/server";

export default async function TestAuthPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let profile = null;
    let profileError = null;

    if (user) {
        const response = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = response.data;
        profileError = response.error;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 font-mono text-sm bg-slate-50 min-h-screen text-slate-900">
            <h1 className="text-2xl font-bold border-b pb-4 border-slate-300">Auth Diagnostics</h1>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">1. Auth User</h2>
                {user ? (
                    <div className="bg-green-100 p-4 rounded border border-green-300">
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role (JWT):</strong> {user.role}</p>
                    </div>
                ) : (
                    <div className="bg-red-100 p-4 rounded border border-red-300">
                        No User Logged In. <br />
                        Error: {authError?.message || 'None'}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">2. Profile Data (Database)</h2>
                {profile ? (
                    <div className="bg-blue-100 p-4 rounded border border-blue-300">
                        <pre>{JSON.stringify(profile, null, 2)}</pre>
                    </div>
                ) : (
                    <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
                        <p><strong>Profile Not Found / Null</strong></p>
                        <p><strong>Error:</strong> {profileError?.message || 'None'}</p>
                        <p><strong>Code:</strong> {profileError?.code}</p>
                        <p><strong>Details:</strong> {profileError?.details}</p>
                        <p><strong>Hint:</strong> {profileError?.hint}</p>
                        <div className="mt-4 pt-4 border-t border-yellow-400">
                            <p className="font-bold">Diagnosis:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>If <strong>Code = 42501</strong>: Row Level Security (RLS) is blocking access. Run <code>final_db_fix.sql</code> again.</li>
                                <li>If <strong>Code = PGRST116</strong>: The row does not exist. Run <code>make_admin_robust.sql</code> again.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">3. Logic Check</h2>
                <div className="p-4 bg-white border border-slate-300 rounded shadow-sm">
                    <p><strong>Check:</strong> <code>profile?.role === 'admin'</code></p>
                    <p><strong>Result:</strong> {profile?.role === 'admin' ? '✅ TRUE (Should go to /admin)' : '❌ FALSE (Will force redirect to /dashboard)'}</p>
                </div>
            </div>
        </div>
    );
}
