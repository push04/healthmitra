'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { login } from '@/app/actions/auth';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const result = await login(formData);
            if (result?.error) {
                toast.error("Login Failed", { description: result.error });
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Sign in to your account to continue managing your health.
                </p>
            </div>

            {message && (
                <div className="p-3 rounded-lg bg-teal-50 text-teal-600 text-sm font-medium text-center border border-teal-100">
                    {message}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-teal-600 hover:text-teal-500"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#113a40] hover:bg-[#0d2b30] text-white h-11 shadow-lg shadow-teal-900/20"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                        Or continue with
                    </span>
                </div>
            </div>

            <p className="px-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                    href="/signup"
                    className="font-semibold text-teal-600 hover:text-teal-500 underline underline-offset-4"
                >
                    Sign up
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
