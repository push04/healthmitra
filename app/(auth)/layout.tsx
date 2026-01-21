import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <Link href="/" className="mb-8 flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    H
                </div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">HealthMitra</span>
            </Link>
            {children}
        </div>
    );
}
