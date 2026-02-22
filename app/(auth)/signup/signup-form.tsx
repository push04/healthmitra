'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signup } from '@/app/actions/auth';
import { Loader2, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignupForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        // Client-side match check
        const password = formData.get('password') as string;
        const confirm = formData.get('confirmPassword') as string;

        if (password !== confirm) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const result = await signup(formData);
            if (result?.error) {
                toast.error("Signup Failed", { description: result.error });
            }
        } catch (err: any) {
            if (err?.message?.includes('redirect')) {
                return;
            }
            toast.error("Signup Failed", { description: "Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 delay-100">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Create an account
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Get started with your health journey today.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            required
                            className="pl-10 bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="pl-10 bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            required
                            className="pl-10 bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••"
                                required
                                className="pl-10 bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••"
                                required
                                className="pl-10 bg-slate-50 border-slate-200"
                            />
                        </div>
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
                        <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </form>

            <p className="px-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-teal-600 hover:text-teal-500 underline underline-offset-4"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
